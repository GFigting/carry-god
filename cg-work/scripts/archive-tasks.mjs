import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import yaml from 'js-yaml';

const frameworkRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

async function exists(target) {
  try { await fs.access(target); return true; } catch { return false; }
}

async function taskFiles(root, { includeArchived = false } = {}) {
  const files = [];
  const projectsRoot = path.join(root, 'local', 'projects');
  if (!(await exists(projectsRoot))) return files;
  for (const project of await fs.readdir(projectsRoot, { withFileTypes: true })) {
    if (!project.isDirectory()) continue;
    const tasksRoot = path.join(projectsRoot, project.name, 'tasks');
    if (!(await exists(tasksRoot))) continue;
    for (const task of await fs.readdir(tasksRoot, { withFileTypes: true })) {
      if (!task.isDirectory()) continue;
      if (task.name === 'archive') {
        if (!includeArchived) continue;
        const archiveRoot = path.join(tasksRoot, task.name);
        for (const archivedTask of await fs.readdir(archiveRoot, { withFileTypes: true })) {
          if (!archivedTask.isDirectory()) continue;
          const archivedFile = path.join(archiveRoot, archivedTask.name, 'task.yaml');
          if (await exists(archivedFile)) files.push(archivedFile);
        }
        continue;
      }
      const file = path.join(tasksRoot, task.name, 'task.yaml');
      if (await exists(file)) files.push(file);
    }
  }
  return files;
}

function taskDirectory(file) {
  return path.dirname(file);
}

function relocateTaskReferences(text, { requirementArchived = false } = {}) {
  const eol = text.includes('\r\n') ? '\r\n' : '\n';
  const lines = text.split(/\r?\n/).map((line) => {
    if (/^\s*-\s+\.\.\//.test(line)) return line.replace('../', '../../');
    return line.replace(/^(\s*[A-Za-z0-9_-]+:\s*)(\.\.\/)/, '$1../$2');
  });
  let output = lines.join(eol);
  if (requirementArchived) {
    output = output.replace(/^(\s*requirements_reference:\s*)(\.\.\/\.\.\/\.\.\/requirements-inbox\/)/m, '$1../../../requirements-inbox/archive/');
  }
  return output;
}

async function requirementReferences(root) {
  const active = new Map();
  const archived = new Map();
  for (const file of await taskFiles(root, { includeArchived: true })) {
    let task;
    try { task = yaml.load(await fs.readFile(file, 'utf8')); } catch { continue; }
    if (!task || typeof task !== 'object' || typeof task.requirements_reference !== 'string') continue;
    const target = path.resolve(path.dirname(file), task.requirements_reference);
    if (task.archived === true) archived.set(file, target);
    else active.set(target, (active.get(target) ?? 0) + 1);
  }
  return { active, archived };
}

function parseArgs(argv) {
  const options = {
    root: frameworkRoot,
    before: null,
    status: 'review',
    ids: null,
    reason: '用户授权归档历史任务',
    relocateArchived: false,
    includeRequirements: false,
    apply: false,
  };
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === '--before') options.before = argv[++index];
    else if (arg === '--status') options.status = argv[++index];
    else if (arg === '--ids') options.ids = new Set(String(argv[++index] ?? '').split(',').map((value) => value.trim()).filter(Boolean));
    else if (arg === '--reason') options.reason = argv[++index];
    else if (arg === '--relocate-archived') options.relocateArchived = true;
    else if (arg === '--include-requirements') options.includeRequirements = true;
    else if (arg === '--root') options.root = path.resolve(argv[++index]);
    else if (arg === '--apply') options.apply = true;
    else throw new Error(`未知参数：${arg}`);
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(options.before ?? '')) {
    throw new Error('--before 必须是 YYYY-MM-DD，且用于排除当天任务');
  }
  if (typeof options.status !== 'string' || !options.status.trim()) throw new Error('--status 不能为空');
  if (typeof options.reason !== 'string' || !options.reason.trim()) throw new Error('--reason 不能为空');
  return options;
}

function upsertScalar(text, key, value, eol) {
  const line = `${key}: ${value}`;
  const pattern = new RegExp(`^${key}:.*$`, 'm');
  if (pattern.test(text)) return text.replace(pattern, line);
  const status = /^status:.*(?:\r?\n|$)/m;
  if (status.test(text)) return text.replace(status, (match) => `${match}${line}${eol}`);
  return `${line}${eol}${text}`;
}

function archiveText(text, { archivedAt, reason }) {
  const eol = text.includes('\r\n') ? '\r\n' : '\n';
  let output = text;
  output = upsertScalar(output, 'archived', 'true', eol);
  output = upsertScalar(output, 'archived_at', JSON.stringify(archivedAt), eol);
  output = upsertScalar(output, 'archive_reason', JSON.stringify(reason), eol);
  return output.endsWith(eol) ? output : `${output}${eol}`;
}

export async function archiveTasks({ root = frameworkRoot, before, status = 'review', ids = null, reason = '用户授权归档历史任务', relocateArchived = false, includeRequirements = false, apply = false, now = new Date() }) {
  const candidates = [];
  const errors = [];
  const refs = includeRequirements ? await requirementReferences(root) : null;
  for (const file of await taskFiles(root)) {
    let task;
    try {
      task = yaml.load(await fs.readFile(file, 'utf8'));
    } catch (error) {
      errors.push(`${path.relative(root, file)}：YAML 无法解析：${error.message}`);
      continue;
    }
    if (!task || typeof task !== 'object' || Array.isArray(task)) continue;
    const alreadyArchived = task.archived === true;
    if (alreadyArchived && !relocateArchived) continue;
    if (!alreadyArchived && task.status !== status) continue;
    if (typeof task.id !== 'string' || !/^\d{4}-\d{2}-\d{2}-/.test(task.id)) continue;
    if (ids && !ids.has(task.id)) continue;
    if (task.id.slice(0, 10) >= before) continue;
    const requirement = refs?.archived.get(file) ?? (typeof task.requirements_reference === 'string' ? path.resolve(path.dirname(file), task.requirements_reference) : null);
    candidates.push({ id: task.id, file, alreadyArchived, requirement });
  }

  if (apply) {
    const archivedAt = now instanceof Date ? now.toISOString() : String(now);
    const candidateRequirements = new Set(candidates.map((candidate) => candidate.requirement).filter(Boolean));
    if (includeRequirements && relocateArchived) {
      for (const requirement of refs.archived.values()) candidateRequirements.add(requirement);
    }
    const candidateActiveCounts = new Map();
    for (const candidate of candidates) {
      if (!candidate.alreadyArchived && candidate.requirement) {
        candidateActiveCounts.set(candidate.requirement, (candidateActiveCounts.get(candidate.requirement) ?? 0) + 1);
      }
    }
    const requirementsToMove = includeRequirements
      ? new Set([...candidateRequirements].filter((target) =>
        (refs.active.get(target) ?? 0) - (candidateActiveCounts.get(target) ?? 0) === 0
        && path.basename(path.dirname(target)) === 'requirements-inbox'))
      : new Set();
    for (const candidate of candidates) {
      const sourceDir = taskDirectory(candidate.file);
      const tasksRoot = path.dirname(sourceDir);
      const targetDir = path.join(tasksRoot, 'archive', candidate.id);
      if (await exists(targetDir)) {
        errors.push(`${path.relative(root, targetDir)}：归档目标已存在`);
        continue;
      }
      await fs.mkdir(path.dirname(targetDir), { recursive: true });
      await fs.rename(sourceDir, targetDir);
      const targetFile = path.join(targetDir, 'task.yaml');
      let text = await fs.readFile(targetFile, 'utf8');
      if (!candidate.alreadyArchived) text = archiveText(text, { archivedAt, reason });
      text = relocateTaskReferences(text, { requirementArchived: requirementsToMove.has(candidate.requirement) });
      await fs.writeFile(targetFile, text);
    }
    for (const requirement of requirementsToMove) {
      if (!(await exists(requirement))) continue;
      const target = path.join(path.dirname(requirement), 'archive', path.basename(requirement));
      if (await exists(target)) continue;
      await fs.mkdir(path.dirname(target), { recursive: true });
      await fs.rename(requirement, target);
    }
  }
  return { candidates, errors, applied: apply };
}

const usage = '用法：node scripts/archive-tasks.mjs --before YYYY-MM-DD [--status review] [--ids id1,id2] [--reason "说明"] [--relocate-archived] [--include-requirements] [--apply]';
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    const options = parseArgs(process.argv.slice(2));
    const result = await archiveTasks(options);
    for (const error of result.errors) console.error(error);
    const mode = result.applied ? '已归档' : '预览归档';
    console.log(`${mode}任务数：${result.candidates.length}`);
    for (const candidate of result.candidates) console.log(`- ${candidate.id}`);
    if (result.errors.length) process.exitCode = 1;
    else if (!result.applied) console.log('未写入文件；添加 --apply 才会执行归档。');
  } catch (error) {
    console.error(`${error.message}\n${usage}`);
    process.exitCode = 1;
  }
}

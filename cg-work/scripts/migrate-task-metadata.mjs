import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import yaml from 'js-yaml';

const frameworkRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const historicalReason = '历史迁移：原记录未保存时间与原因';

async function exists(target) {
  try { await fs.access(target); return true; } catch { return false; }
}

async function taskFiles(root, project) {
  const tasksRoot = path.join(root, 'local', 'projects', project, 'tasks');
  if (!(await exists(tasksRoot))) return [];
  const files = [];
  for (const entry of await fs.readdir(tasksRoot, { withFileTypes: true })) {
    if (!entry.isDirectory() || entry.name === 'archive') continue;
    const file = path.join(tasksRoot, entry.name, 'task.yaml');
    if (await exists(file)) files.push(file);
  }
  return files;
}

function replaceDocumentationAliases(text, task) {
  const doc = task.documentation;
  if (!doc || typeof doc !== 'object' || Array.isArray(doc)) return { text, changed: false, error: null };
  if (doc.targets !== undefined && doc.files !== undefined) {
    return { text, changed: false, error: 'documentation.targets 与 documentation.files 不能同时存在' };
  }
  if (doc.not_needed_reason !== undefined && doc.reason !== undefined) {
    return { text, changed: false, error: 'documentation.not_needed_reason 与 documentation.reason 不能同时存在' };
  }
  let output = text;
  if (doc.targets !== undefined) output = output.replace(/^  targets:/m, '  files:');
  if (doc.not_needed_reason !== undefined) output = output.replace(/^  not_needed_reason:/m, '  reason:');
  return { text: output, changed: output !== text, error: null };
}

function replaceStatusHistory(text, task) {
  if (!Array.isArray(task.status_history) || task.status_history.some((entry) => typeof entry !== 'string')) {
    return { text, changed: false, error: null };
  }
  const eol = text.includes('\r\n') ? '\r\n' : '\n';
  const pattern = /^status_history:\r?\n(?:[ \t]*-[^\r\n]*(?:\r?\n|$))*/m;
  if (!pattern.test(text)) return { text, changed: false, error: 'status_history 无法定位为顶层列表' };
  const replacement = [
    'status_history:',
    ...task.status_history.flatMap((status) => [
      `  - status: ${status}`,
      '    at: null',
      `    reason: ${JSON.stringify(historicalReason)}`,
    ]),
  ].join(eol) + eol;
  return { text: text.replace(pattern, replacement), changed: true, error: null };
}

export function migrateTaskText(text, task, { documentation = false, statusHistory = false } = {}) {
  let output = text;
  const errors = [];
  let changed = false;
  if (documentation) {
    const result = replaceDocumentationAliases(output, task);
    if (result.error) errors.push(result.error);
    else { output = result.text; changed ||= result.changed; }
  }
  if (statusHistory) {
    const result = replaceStatusHistory(output, yaml.load(output));
    if (result.error) errors.push(result.error);
    else { output = result.text; changed ||= result.changed; }
  }
  return { text: output, changed, errors };
}

export async function migrateTaskMetadata({
  root = frameworkRoot,
  project = 'cg-work',
  documentation = false,
  statusHistory = false,
  apply = false,
} = {}) {
  const changed = [];
  const errors = [];
  if (!documentation && !statusHistory) errors.push('至少指定 --documentation 或 --status-history');
  for (const file of await taskFiles(root, project)) {
    let text;
    let task;
    try {
      text = await fs.readFile(file, 'utf8');
      task = yaml.load(text);
    } catch (error) {
      errors.push(`${path.relative(root, file)}：YAML 无法解析：${error.message}`);
      continue;
    }
    if (task && task.archived === true) continue;
    const result = migrateTaskText(text, task, { documentation, statusHistory });
    if (result.errors.length) {
      errors.push(`${path.relative(root, file)}：${result.errors.join('；')}`);
      continue;
    }
    if (!result.changed) continue;
    changed.push(file);
    if (apply) await fs.writeFile(file, result.text);
  }
  return { changed, errors, applied: apply };
}

function parseArgs(argv) {
  const options = { root: frameworkRoot, project: 'cg-work', documentation: false, statusHistory: false, apply: false };
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === '--root') options.root = path.resolve(argv[++index]);
    else if (arg === '--project') options.project = argv[++index];
    else if (arg === '--documentation') options.documentation = true;
    else if (arg === '--status-history') options.statusHistory = true;
    else if (arg === '--apply') options.apply = true;
    else throw new Error(`未知参数：${arg}`);
  }
  return options;
}

const usage = '用法：node scripts/migrate-task-metadata.mjs (--documentation | --status-history) [--project cg-work] [--apply]';
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    const result = await migrateTaskMetadata(parseArgs(process.argv.slice(2)));
    for (const error of result.errors) console.error(error);
    console.log(`${result.applied ? '已迁移' : '预览迁移'}任务数：${result.changed.length}`);
    for (const file of result.changed) console.log(`- ${file}`);
    if (result.errors.length) process.exitCode = 1;
    else if (!result.applied) console.log('未写入文件；添加 --apply 才会执行迁移。');
  } catch (error) {
    console.error(`${error.message}\n${usage}`);
    process.exitCode = 1;
  }
}

import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { checkTaskRecord } from './check-task.mjs';
import { checkProjectContext } from './check-project.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const errors = [];
const isKebab = (name) => name === '.gitkeep' || name === '.gitignore'
  || /^(README|AGENTS|CLAUDE|SKILL|VERSION)(\.md)?$/.test(name)
  || /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(name)
  || /^[a-z0-9]+(?:-[a-z0-9]+)*(?:\.[a-z0-9]+)+$/.test(name);
const isLocal = (relative) => relative === 'local' || relative.startsWith('local/');
const isSkill = (relative) => relative === 'skills' || relative.startsWith('skills/');

async function exists(file) {
  try { await fs.access(file); return true; } catch { return false; }
}

function frontmatter(text) {
  return text.match(/^---\r?\n([\s\S]*?)\r?\n---/)?.[1] || '';
}

function listValue(metadata, key) {
  const match = metadata.match(new RegExp(`^${key}:\\s*\\r?\\n((?:\\s+- .*(?:\\r?\\n|$))*)`, 'm'));
  return match ? [...match[1].matchAll(/^\s+-\s+(.+)$/gm)].map((item) => item[1].trim()) : [];
}

function frameworkSkillPath(reference) {
  if (!reference.startsWith('framework:')) return null;
  const name = reference.slice('framework:'.length);
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(name)) return null;
  return path.join(root, 'skills', name);
}

function slugify(text) {
  return text.trim().toLowerCase()
    .replace(/[`*_~[\]]/g, '')
    .replace(/[^\p{L}\p{N}\s-]/gu, '')
    .replace(/\s+/g, '-');
}

function isArchivedArtifact(relative) {
  const parts = relative.split('/');
  return parts.some((part, index) =>
    (part === 'tasks' || part === 'requirements-inbox') && parts[index + 1] === 'archive'
  );
}

// 围栏代码块里的 # 不是标题，必须排除，否则会产生幽灵锚点。
function headingTexts(content) {
  const headings = [];
  let fenced = false;
  for (const line of content.split(/\r?\n/)) {
    if (/^\s*(?:```|~~~)/.test(line)) {
      fenced = !fenced;
      continue;
    }
    if (fenced) continue;
    const match = line.match(/^#{1,6}\s+(.+?)\s*$/);
    if (match) headings.push(match[1]);
  }
  return headings;
}

async function headingSlugs(file) {
  return new Set(headingTexts(await fs.readFile(file, 'utf8')).map(slugify));
}

function decode(fragment) {
  try { return decodeURIComponent(fragment); } catch { return fragment; }
}

// 兼容 `](dest)`、`](<dest>)` 与 `](dest "title")`；返回按优先级排列的候选目标。
function linkDestinations(raw) {
  const trimmed = raw.trim();
  const angle = trimmed.match(/^<([^>]+)>/);
  if (angle) return [angle[1].trim()];
  const withoutTitle = trimmed.replace(/\s+["'(].*$/, '').trim();
  return withoutTitle === trimmed ? [trimmed] : [withoutTitle, trimmed];
}

async function checkMarkdownLinks(file, { checkAnchors }) {
  const content = await fs.readFile(file, 'utf8');
  for (const match of content.matchAll(/\[[^\]]+\]\(([^)]+)\)/g)) {
    const raw = match[1].trim();
    if (!raw || /^(https?:|mailto:)/.test(raw)) continue;
    let resolved;
    for (const candidate of linkDestinations(raw)) {
      const [rawTarget, fragment] = candidate.split('#');
      const targetFile = rawTarget ? path.resolve(path.dirname(file), rawTarget) : file;
      if (!rawTarget || await exists(targetFile)) {
        resolved = { targetFile, fragment };
        break;
      }
    }
    if (!resolved) {
      errors.push(`broken link: ${path.relative(root, file)} -> ${raw}`);
      continue;
    }
    if (!checkAnchors || !resolved.fragment) continue;
    if (!(await headingSlugs(resolved.targetFile)).has(slugify(decode(resolved.fragment)))) {
      errors.push(`broken anchor: ${path.relative(root, file)} -> ${raw}`);
    }
  }
}

async function checkManagedProjectRecords() {
  const projectRoot = path.join(root, 'local', 'projects', 'cg-work');
  const contextFile = path.join(projectRoot, 'project-context.yaml');
  if (await exists(contextFile)) {
    for (const error of await checkProjectContext(contextFile)) {
      errors.push(`local/projects/cg-work/project-context.yaml: ${error}`);
    }
  }
  const tasksRoot = path.join(projectRoot, 'tasks');
  if (!(await exists(tasksRoot))) return;
  for (const entry of await fs.readdir(tasksRoot, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    if (entry.name === 'archive') {
      // 归档记录退出生命周期门禁，但必须保持 YAML 可解析（见工作模型的任务归档）。
      const archiveRoot = path.join(tasksRoot, entry.name);
      for (const archived of await fs.readdir(archiveRoot, { withFileTypes: true })) {
        if (!archived.isDirectory()) continue;
        const archivedFile = path.join(archiveRoot, archived.name, 'task.yaml');
        if (!(await exists(archivedFile))) continue;
        const label = path.relative(root, archivedFile).replaceAll(path.sep, '/');
        for (const error of await checkTaskRecord(archivedFile)) errors.push(`${label}: ${error}`);
      }
      continue;
    }
    const taskFile = path.join(tasksRoot, entry.name, 'task.yaml');
    if (!(await exists(taskFile))) continue;
    const label = path.relative(root, taskFile).replaceAll(path.sep, '/');
    for (const error of await checkTaskRecord(taskFile)) errors.push(`${label}: ${error}`);
  }
}

async function walk(dir) {
  for (const entry of await fs.readdir(dir, { withFileTypes: true })) {
    // 点号目录属于本机工具、编辑器或运行时状态，不是框架内容；不参与命名、README 和链接校验。
    if (entry.isDirectory() && (entry.name.startsWith('.') || entry.name === 'node_modules')) continue;
    const target = path.join(dir, entry.name);
    const relative = path.relative(root, target).replaceAll(path.sep, '/');
    if (isArchivedArtifact(relative)) continue;
    if (!isLocal(relative) && !isSkill(relative) && !isKebab(entry.name)) errors.push(`invalid name: ${relative}`);
    if (entry.isDirectory()) {
      if (!isLocal(relative) && !isSkill(relative) && !(await exists(path.join(target, 'README.md')))) errors.push(`missing README.md: ${relative}`);
      await walk(target);
    } else if (!isSkill(relative) && entry.name.endsWith('.md')) {
      // 锚点校验只覆盖框架内容；local/ 下的项目资料由项目自行维护。
      await checkMarkdownLinks(target, { checkAnchors: !isLocal(relative) });
    }
  }
}

await walk(root);
await checkManagedProjectRecords();
await checkRequirementsInboxes();
const workflowFiles = (await fs.readdir(path.join(root, 'workflows'), { withFileTypes: true }))
  .filter((entry) => entry.isFile() && entry.name.endsWith('.md') && entry.name !== 'README.md')
  .map((entry) => entry.name)
  .sort();
for (const file of workflowFiles) {
  const content = await fs.readFile(path.join(root, 'workflows', file), 'utf8');
  const metadata = frontmatter(content);
  if (!metadata) {
    errors.push(`missing workflow frontmatter: workflows/${file}`);
    continue;
  }
  for (const key of ['required_skills', 'optional_skills', 'conditional_skills']) {
    if (!new RegExp(`^${key}:\\s*`, 'm').test(metadata)) errors.push(`missing workflow field: workflows/${file} -> ${key}`);
  }
  if (!listValue(metadata, 'required_skills').length) errors.push(`empty required skills: workflows/${file}`);
  const references = ['required_skills', 'optional_skills', 'conditional_skills'].flatMap((key) => listValue(metadata, key));
  if (new Set(references).size !== references.length) errors.push(`duplicate workflow skill reference: workflows/${file}`);
  for (const skill of references) {
    const skillPath = frameworkSkillPath(skill);
    if (skillPath && !(await exists(skillPath))) errors.push(`unknown workflow skill: workflows/${file} -> ${skill}`);
    if (!skillPath && !skill.startsWith('project:')) errors.push(`invalid workflow skill reference: workflows/${file} -> ${skill}`);
  }
}

if (!(await exists(path.join(root, 'core', 'project-context.template.yaml')))) errors.push('missing project context template');
const ignore = await fs.readFile(path.join(root, '.gitignore'), 'utf8');
for (const requiredIgnoreRule of [
  '/local/projects/*',
  '!/local/projects/.gitkeep',
  '!/local/projects/*/',
  '/local/projects/*/*',
  '!/local/projects/*/requirements-inbox/',
  '!/local/projects/*/requirements-inbox/README.md',
  '!/local/projects/cg-work/**',
]) {
  if (!ignore.includes(requiredIgnoreRule)) errors.push(`missing local project ignore rule: ${requiredIgnoreRule}`);
}
if (errors.length) {
  console.error(errors.join('\n'));
  process.exitCode = 1;
} else {
  console.log('cg-work checks passed');
}

async function checkRequirementsInboxes() {
  const projectsRoot = path.join(root, 'local', 'projects');
  for (const entry of await fs.readdir(projectsRoot, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    const projectRoot = path.join(projectsRoot, entry.name);
    if (!(await exists(path.join(projectRoot, 'project-context.yaml')))) continue;
    const inbox = path.join(projectRoot, 'requirements-inbox');
    if (!(await exists(inbox))) {
      errors.push(`missing requirements-inbox: local/projects/${entry.name}`);
      continue;
    }
    for (const name of ['README.md']) {
      if (!(await exists(path.join(inbox, name)))) errors.push(`missing requirements-inbox file: local/projects/${entry.name}/requirements-inbox/${name}`);
    }
  }
}

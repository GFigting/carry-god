import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

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

async function checkMarkdownLinks(file) {
  const content = await fs.readFile(file, 'utf8');
  for (const match of content.matchAll(/\[[^\]]+\]\(([^)#]+)(?:#[^)]+)?\)/g)) {
    const target = match[1].trim();
    if (!target || /^(https?:|mailto:)/.test(target)) continue;
    if (!(await exists(path.resolve(path.dirname(file), target)))) errors.push(`broken link: ${path.relative(root, file)} -> ${target}`);
  }
}

async function walk(dir) {
  for (const entry of await fs.readdir(dir, { withFileTypes: true })) {
    // 点号目录属于本机工具、编辑器或运行时状态，不是框架内容；不参与命名、README 和链接校验。
    if (entry.isDirectory() && (entry.name.startsWith('.') || entry.name === 'node_modules')) continue;
    const target = path.join(dir, entry.name);
    const relative = path.relative(root, target).replaceAll(path.sep, '/');
    if (!isLocal(relative) && !isSkill(relative) && !isKebab(entry.name)) errors.push(`invalid name: ${relative}`);
    if (entry.isDirectory()) {
      if (!isLocal(relative) && !isSkill(relative) && !(await exists(path.join(target, 'README.md')))) errors.push(`missing README.md: ${relative}`);
      await walk(target);
    } else if (!isSkill(relative) && entry.name.endsWith('.md')) {
      await checkMarkdownLinks(target);
    }
  }
}

await walk(root);
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
  '!/local/projects/*/requirements-inbox/.gitkeep',
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
    for (const name of ['README.md', '.gitkeep']) {
      if (!(await exists(path.join(inbox, name)))) errors.push(`missing requirements-inbox file: local/projects/${entry.name}/requirements-inbox/${name}`);
    }
  }
}

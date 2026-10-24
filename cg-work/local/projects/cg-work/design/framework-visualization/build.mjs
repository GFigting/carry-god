// cg-work 框架可视化页面 — 数据管线
// 用法：node build.mjs（路径基于本文件解析，任意 cwd 可运行）
// 输入：local/projects/*/tasks/**/task.yaml、git log、skills/、requirements-inbox/、npm run check
// 输出：index.html（模板 template.html 内嵌 JSON 快照，零外链依赖）
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execSync } from 'node:child_process';
import yaml from 'js-yaml';
import { formatLocalIso } from '../../../../../scripts/local-time.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const repo = path.resolve(here, '../../../../..');
const projectsBase = path.join(repo, 'local', 'projects');

const FRAMEWORK_SKILLS = ['project-initialization', 'framework-optimization', 'parent-child-decomposition', 'subagent-dispatch-timing', 'product-management'];
const LOCALIZED_SKILLS = ['baoyu-design'];

function walkFiles(dir, out = []) {
  if (!fs.existsSync(dir)) return out;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) walkFiles(p, out);
    else out.push(p);
  }
  return out;
}

// ---- 任务扫描 ----
const tasks = [];
const projectMeta = {};
for (const proj of fs.readdirSync(projectsBase, { withFileTypes: true })) {
  if (!proj.isDirectory()) continue;
  const tdir = path.join(projectsBase, proj.name, 'tasks');
  projectMeta[proj.name] = { tasks: 0, archived: 0, requirements: 0, requirementsArchived: 0 };
  if (!fs.existsSync(tdir)) continue;
  const yamlFiles = walkFiles(tdir).filter((f) => path.basename(f) === 'task.yaml');
  for (const f of yamlFiles) {
    let doc;
    try { doc = yaml.load(fs.readFileSync(f, 'utf8')); } catch { continue; }
    if (!doc || !doc.id) continue;
    const archived = f.includes(`${path.sep}archive${path.sep}`);
    const workflow = String(doc.workflow || '').replace(/^["']|["']$/g, '').replace(/^framework:/, '');
    tasks.push({
      id: String(doc.id),
      project: proj.name,
      status: String(doc.status || 'unknown'),
      workflow: workflow || '(未声明)',
      delivery_path: String(doc.delivery_path || '(默认standard)'),
      role: doc.role ? String(doc.role) : '',
      archived,
    });
    projectMeta[proj.name][archived ? 'archived' : 'tasks'] += 1;
  }
  // 需求箱
  const inbox = path.join(projectsBase, proj.name, 'requirements-inbox');
  if (fs.existsSync(inbox)) {
    for (const f of walkFiles(inbox)) {
      if (f.includes(`${path.sep}archive${path.sep}`)) projectMeta[proj.name].requirementsArchived += 1;
      else projectMeta[proj.name].requirements += 1;
    }
  }
}

// ---- 技能分类 ----
const skillDirs = fs.readdirSync(path.join(repo, 'skills'), { withFileTypes: true }).filter((d) => d.isDirectory()).map((d) => d.name);
const skills = {
  total: skillDirs.length,
  framework: skillDirs.filter((s) => FRAMEWORK_SKILLS.includes(s)).length,
  localized: skillDirs.filter((s) => LOCALIZED_SKILLS.includes(s)).length,
};
skills.mirror = skills.total - skills.framework - skills.localized;

// ---- 目录文件数 ----
const countExt = (dir, ext) => walkFiles(dir).filter((f) => f.endsWith(ext)).length;
const files = {
  core: countExt(path.join(repo, 'core'), '.md'),
  workflows: countExt(path.join(repo, 'workflows'), '.md'),
  scripts: countExt(path.join(repo, 'scripts'), '.mjs'),
  tests: countExt(path.join(repo, 'test'), '.mjs'),
};

// ---- git 提交时间线（近 90 天） ----
const since = '2026-09-01';
const logOut = execSync(`git log --since="${since}" --pretty=%ad%x09%s --date=short`, { cwd: repo, encoding: 'utf8' });
const commitMap = {};
for (const line of logOut.split('\n')) {
  const idx = line.indexOf('\t');
  if (idx < 0) continue;
  const d = line.slice(0, idx).trim();
  const subject = line.slice(idx + 1).trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(d)) continue;
  (commitMap[d] = commitMap[d] || []).push(subject);
}
const commits = [];
const start = new Date(`${since}T00:00:00`);
const end = new Date();
for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
  const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  const titles = commitMap[key] || [];
  commits.push({ date: key, n: titles.length, titles });
}

// ---- 框架校验 ----
let check = { ok: false, detail: '未执行' };
try {
  const out = execSync('npm run check', { cwd: repo, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
  check = { ok: /checks passed/.test(out), detail: out.trim().split('\n').pop() };
} catch (err) {
  check = { ok: false, detail: String(err.stdout || err.message).trim().split('\n').slice(-3).join(' / ') };
}

const version = fs.readFileSync(path.join(repo, 'VERSION'), 'utf8').trim();

const data = {
  generated_at: formatLocalIso(new Date()),
  version,
  check,
  skills,
  files,
  tasks,
  projectMeta,
  commits,
};

const template = fs.readFileSync(path.join(here, 'template.html'), 'utf8');
const html = template.replace('/*__CG_DATA__*/', JSON.stringify(data));
fs.writeFileSync(path.join(here, 'index.html'), html);
console.log(`index.html 已生成：${tasks.length} 个任务，${commits.reduce((s, c) => s + c.n, 0)} 个提交（${since} 起），check=${check.ok ? 'passed' : 'FAILED'}`);

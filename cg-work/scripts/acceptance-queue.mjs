import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import yaml from 'js-yaml';
import { checkTaskRecord } from './check-task.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const projectsRoot = path.join(root, 'local', 'projects');

const exists = async (target) => { try { await fs.access(target); return true; } catch { return false; } };

async function taskFiles() {
  const files = [];
  for (const project of await fs.readdir(projectsRoot, { withFileTypes: true })) {
    if (!project.isDirectory()) continue;
    const tasksRoot = path.join(projectsRoot, project.name, 'tasks');
    if (!(await exists(tasksRoot))) continue;
    for (const entry of await fs.readdir(tasksRoot, { withFileTypes: true })) {
      if (!entry.isDirectory()) continue;
      const file = path.join(tasksRoot, entry.name, 'task.yaml');
      if (await exists(file)) files.push({ project: project.name, file });
    }
  }
  return files;
}

async function queue() {
  const items = [];
  for (const { project, file } of await taskFiles()) {
    let task;
    try { task = yaml.load(await fs.readFile(file, 'utf8')); } catch { continue; }
    if (!task || typeof task !== 'object') continue;
    const requiresUser = task.next_user_action?.required === true;
    if (task.status !== 'review' && !requiresUser) continue;
    items.push({
      project,
      id: task.id ?? path.basename(path.dirname(file)),
      status: task.status ?? '',
      waiting: requiresUser,
      action: task.next_user_action?.action ?? '',
      message: task.next_user_action?.message ?? task.next_action ?? '',
      file,
    });
  }
  return items.sort((a, b) => Number(b.waiting) - Number(a.waiting)
    || a.project.localeCompare(b.project) || a.id.localeCompare(b.id));
}

function render(items) {
  if (!items.length) return '待验收清单为空：没有处于 review 或等待用户操作的任务。';
  const lines = [`待验收清单（${items.length} 条）`, ''];
  for (const item of items) {
    const tag = item.waiting ? '等待用户' : '审查中';
    lines.push(`[${tag}] ${item.project}/${item.id}`);
    if (item.action) lines.push(`    动作：${item.action}`);
    if (item.message) lines.push(`    说明：${item.message}`);
  }
  lines.push('', '一次验收多条：node scripts/acceptance-queue.mjs --accept <id>[,<id>...] --note "<验收说明>"');
  return lines.join('\n');
}

// 只改三处：状态、状态历史、面向用户的下一步；其余原文不动。
function markAccepted(text, note) {
  let out = text.replace(/^status:\s*review\s*$/m, 'status: done');
  out = out.replace(/^(status_history:\r?\n(?:[ \t]*-[^\n]*\r?\n)*)/m, (block) => `${block}  - done\n`);
  const lines = out.split(/\r?\n/);
  const start = lines.findIndex((line) => /^next_user_action:\s*$/.test(line));
  if (start !== -1) {
    let end = start + 1;
    while (end < lines.length && (lines[end].trim() === '' || /^\s/.test(lines[end]))) end += 1;
    lines.splice(start, end - start,
      'next_user_action:',
      '  required: false',
      '  action: none',
      `  message: 用户已验收${note ? `：${note}` : '。'}`);
    out = lines.join('\n');
  }
  return out.endsWith('\n') ? out : `${out}\n`;
}

async function accept(ids, note) {
  const files = await taskFiles();
  const results = [];
  for (const id of ids) {
    const hit = files.find((entry) => path.basename(path.dirname(entry.file)) === id);
    if (!hit) { results.push({ id, ok: false, reason: '找不到任务记录' }); continue; }
    const text = await fs.readFile(hit.file, 'utf8');
    const task = yaml.load(text);
    if (task?.status !== 'review') { results.push({ id, ok: false, reason: `当前状态是 ${task?.status}，只有 review 可验收` }); continue; }
    const next = markAccepted(text, note);
    const probe = path.join(path.dirname(hit.file), '.acceptance-probe.yaml');
    await fs.writeFile(probe, next);
    const errors = await checkTaskRecord(probe);
    await fs.rm(probe, { force: true });
    if (errors.length) { results.push({ id, ok: false, reason: `证据不全，拒绝标记完成：${errors.join('；')}` }); continue; }
    await fs.writeFile(hit.file, next);
    results.push({ id, ok: true, file: hit.file });
  }
  return results;
}

function parseArgs(argv) {
  const options = { accept: null, note: '' };
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === '--accept') { options.accept = argv[index + 1] ?? ''; index += 1; }
    else if (arg === '--note') { options.note = argv[index + 1] ?? ''; index += 1; }
    else return { error: `未知参数：${arg}` };
  }
  return options;
}

const usage = '用法：node scripts/acceptance-queue.mjs [--accept <id>[,<id>...]] [--note "<验收说明>"]';
const options = parseArgs(process.argv.slice(2));

if (options.error) {
  console.error(`${options.error}\n${usage}`);
  process.exitCode = 1;
} else if (options.accept !== null) {
  const ids = options.accept.split(',').map((value) => value.trim()).filter(Boolean);
  if (!ids.length) {
    console.error(`--accept 需要一个或多个任务 id，用逗号分隔\n${usage}`);
    process.exitCode = 1;
  } else {
    const results = await accept(ids, options.note);
    for (const result of results) {
      console.log(result.ok ? `已验收：${result.id}` : `未处理：${result.id} —— ${result.reason}`);
    }
    if (results.some((result) => !result.ok)) process.exitCode = 1;
  }
} else {
  console.log(render(await queue()));
}

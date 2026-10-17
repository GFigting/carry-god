// 任务时间戳脚本：created_at 与 status_history[].at 一律由脚本写入真实本地墙钟时间，
// 禁止手工填占位值（如 T00:00:00）。写入格式复用 local-time.mjs（YYYY-MM-DDTHH:mm:ss，无时区后缀）。
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import yaml from 'js-yaml';
import { formatLocalIso } from './local-time.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const projectsRoot = path.join(root, 'local', 'projects');

const exists = async (target) => { try { await fs.access(target); return true; } catch { return false; } };

function resolveTask(project, id) {
  if (!project || !id) return { error: '缺少 --project 或 --id' };
  const dir = path.join(projectsRoot, project, 'tasks', id);
  const file = path.join(dir, 'task.yaml');
  return { dir, file };
}

// --- create：生成任务骨架，created_at 与首条 status_history 由脚本盖当前时间 ---
async function create({ project, id, goal, workflow, deliveryPath, reason }) {
  const { dir, file } = resolveTask(project, id);
  if (file.endsWith('task.yaml') && (await exists(file))) return { ok: false, reason: 'task.yaml 已存在' };
  if (!goal) return { ok: false, reason: '缺少 --goal' };
  if (!workflow) return { ok: false, reason: '缺少 --workflow' };
  const now = formatLocalIso(new Date());
  const lines = [
    `id: ${id}`,
    'status: pending',
    `goal: ${yaml.dump(goal, { lineWidth: -1 }).trim()}`,
    `workflow: ${workflow}`,
  ];
  if (deliveryPath) lines.push(`delivery_path: ${deliveryPath}`);
  lines.push(
    `created_at: ${now}`,
    'status_history:',
    '  - status: pending',
    `    at: ${now}`,
    `    reason: ${JSON.stringify(reason ?? '任务创建')}`,
    'next_action:',
    '  required: false',
    '  action: none',
    '  message: ""',
    '',
  );
  await fs.mkdir(dir, { recursive: true });
  await fs.writeFile(file, lines.join('\n'));
  return { ok: true, file, at: now };
}

// --- transition：更新顶层 status、追加 status_history 条目，时间由脚本盖当前墙钟 ---
function appendHistory(lines, status, now, reason) {
  const historyStart = lines.findIndex((line) => /^status_history:\s*$/.test(line));
  if (historyStart === -1) {
    lines.push('status_history:', `  - status: ${status}`, `    at: ${now}`, `    reason: ${JSON.stringify(reason)}`);
    return lines;
  }
  let end = historyStart + 1;
  while (end < lines.length && (lines[end].trim() === '' || /^\s/.test(lines[end]))) end += 1;
  lines.splice(end, 0, `  - status: ${status}`, `    at: ${now}`, `    reason: ${JSON.stringify(reason)}`);
  return lines;
}

function replaceNextAction(lines, { required, action, message }) {
  const start = lines.findIndex((line) => /^next_action:/.test(line));
  if (start === -1) {
    lines.push('next_action:', `  required: ${required}`, `  action: ${action}`, `  message: ${JSON.stringify(message)}`);
    return lines;
  }
  let end = start + 1;
  while (end < lines.length && (lines[end].trim() === '' || /^\s/.test(lines[end]))) end += 1;
  lines.splice(start, end - start,
    'next_action:',
    `  required: ${required}`,
    `  action: ${action}`,
    `  message: ${JSON.stringify(message)}`);
  return lines;
}

async function transition({ project, id, status, reason, nextAction }) {
  const { file } = resolveTask(project, id);
  if (!(await exists(file))) return { ok: false, reason: '找不到 task.yaml' };
  const text = await fs.readFile(file, 'utf8');
  const task = yaml.load(text);
  if (!task || typeof task !== 'object') return { ok: false, reason: 'YAML 无法解析' };
  if (!status) return { ok: false, reason: '缺少 --status' };
  if (!reason) return { ok: false, reason: '缺少 --reason' };
  const now = formatLocalIso(new Date());
  const lines = text.split(/\r?\n/);
  const statusIndex = lines.findIndex((line) => /^status:\s*\S/.test(line));
  if (statusIndex === -1) return { ok: false, reason: '缺少顶层 status 行' };
  lines[statusIndex] = `status: ${status}`;
  appendHistory(lines, status, now, reason);
  if (nextAction) replaceNextAction(lines, nextAction);
  const output = lines.join('\n');
  await fs.writeFile(file, output.endsWith('\n') ? output : `${output}\n`);
  return { ok: true, file, at: now };
}

// --- fix-placeholders：识别活跃任务中手工占位的时间，预览；--apply 时置为 null（不可考） ---
// 只处理严格 T00:00:00 的 status_history.at；无法自动识别的编造时刻不在范围内。
async function fixPlaceholders({ project, apply }) {
  const projects = project ? [project] : (await fs.readdir(projectsRoot, { withFileTypes: true }))
    .filter((entry) => entry.isDirectory()).map((entry) => entry.name);
  const findings = [];
  for (const proj of projects) {
    const tasksRoot = path.join(projectsRoot, proj, 'tasks');
    if (!(await exists(tasksRoot))) continue;
    for (const entry of await fs.readdir(tasksRoot, { withFileTypes: true })) {
      if (!entry.isDirectory() || entry.name === 'archive') continue;
      const file = path.join(tasksRoot, entry.name, 'task.yaml');
      if (!(await exists(file))) continue;
      const text = await fs.readFile(file, 'utf8');
      let task;
      try { task = yaml.load(text); } catch { continue; }
      if (!task || typeof task !== 'object' || task.archived === true) continue;
      // js-yaml 会把 2026-10-16T00:00:00 解析成 Date 对象，识别占位必须基于原始文本。
      const matches = text.match(/^\s*at:\s*"?(\d{4}-\d{2}-\d{2})T00:00:00"?\s*$/gm) ?? [];
      if (!matches.length) continue;
      findings.push({ project: proj, id: task.id ?? entry.name, count: matches.length, file });
      if (apply) {
        const output = text.replace(
          /^(\s*at:\s*)"?(\d{4}-\d{2}-\d{2})T00:00:00"?\s*$/gm,
          '$1null',
        );
        await fs.writeFile(file, output);
      }
    }
  }
  return findings;
}

// --- 参数解析 ---
// --apply 是布尔旗标（可选显式值 --apply true/false），--next-action 后接 3 个位置参数。
function parseArgs(argv) {
  const options = { _: [] };
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === '--next-action') { options.nextAction = { required: argv[++index] === 'true', action: argv[++index], message: argv[++index] }; }
    else if (arg === '--apply') {
      const next = argv[index + 1];
      if (next === 'true') { options.apply = true; index += 1; }
      else if (next === 'false') { options.apply = false; index += 1; }
      else options.apply = true;
    }
    else if (arg.startsWith('--')) options[arg.slice(2).replace(/-([a-z])/g, (_, c) => c.toUpperCase())] = argv[++index];
    else options._.push(arg);
  }
  return options;
}

const usage = [
  '用法：',
  '  node scripts/task-stamp.mjs create --project <id> --task-id <task-id> --goal "<目标>" --workflow <workflow> [--delivery-path standard] [--reason "<原因>"]',
  '  node scripts/task-stamp.mjs transition --project <id> --task-id <task-id> --status <status> --reason "<原因>" [--next-action <required> <action> <message>]',
  '  node scripts/task-stamp.mjs fix-placeholders [--project <id>] [--apply]',
].join('\n');

const options = parseArgs(process.argv.slice(2));
const action = options._[0];

if (action === 'create') {
  const result = await create({ project: options.project, id: options.taskId, goal: options.goal, workflow: options.workflow, deliveryPath: options.deliveryPath, reason: options.reason });
  if (!result.ok) { console.error(result.reason); process.exitCode = 1; } else { console.log(`已创建：${result.file}（created_at=${result.at}）`); }
} else if (action === 'transition') {
  const result = await transition({ project: options.project, id: options.taskId, status: options.status, reason: options.reason, nextAction: options.nextAction });
  if (!result.ok) { console.error(result.reason); process.exitCode = 1; } else { console.log(`已流转：${options.taskId} -> ${options.status}（at=${result.at}）`); }
} else if (action === 'fix-placeholders') {
  const findings = await fixPlaceholders({ project: options.project, apply: options.apply === true });
  if (!findings.length) { console.log('没有发现占位时间。'); }
  else {
    const total = findings.reduce((sum, item) => sum + item.count, 0);
    console.log(`${options.apply ? '已修复' : '预览'}：${findings.length} 个任务、${total} 条 status_history.at 占位时间${options.apply ? '（已置 null）' : '（追加 --apply 才写入）'}`);
    for (const item of findings) console.log(`  ${item.project}/${item.id}：${item.count} 条`);
  }
} else {
  console.error(usage);
  process.exitCode = 1;
}

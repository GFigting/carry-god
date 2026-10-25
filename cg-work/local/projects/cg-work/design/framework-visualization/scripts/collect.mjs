// cg-work 框架可视化页面 — 数据收集
// 输入：local/projects/*/tasks/**/task.yaml、git log、skills/、requirements-inbox/、npm run check
// 口径与原静态页的构建脚本一致，只把写文件改成返回快照对象。
import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';
import yaml from 'js-yaml';
import { formatLocalIso } from '../../../../../../scripts/local-time.mjs';

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

const pad2 = (value) => String(value).padStart(2, '0');

// 统一成本地墙钟字符串：框架时间字段不带时区，js-yaml 会把无时区时间解析成 UTC Date，
// 所以 Date 一律按其 UTC 分量还原成原始墙钟，避免用本地 getter 造成 8 小时漂移。
function wallClock(value) {
  if (value === null || value === undefined || value === '') return null;
  if (value instanceof Date) {
    if (Number.isNaN(value.getTime())) return null;
    return `${value.getUTCFullYear()}-${pad2(value.getUTCMonth() + 1)}-${pad2(value.getUTCDate())}T${pad2(value.getUTCHours())}:${pad2(value.getUTCMinutes())}:${pad2(value.getUTCSeconds())}`;
  }
  const text = String(value).trim().replace(/^["']|["']$/g, '');
  if (/^\d{4}-\d{2}-\d{2}$/.test(text)) return `${text}T00:00:00`;
  const match = text.match(/^(\d{4})-(\d{2})-(\d{2})[T ](\d{2}):(\d{2})(?::(\d{2}))?/);
  return match ? `${match[1]}-${match[2]}-${match[3]}T${match[4]}:${match[5]}:${match[6] ?? '00'}` : null;
}

function toDate(value) {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function daysBetween(value, now) {
  const date = toDate(value);
  if (!date) return null;
  return Math.max(0, Math.floor((now.getTime() - date.getTime()) / 86400000));
}

// 状态历史已统一成 YYYY-MM-DDTHH:mm:ss，字典序即时间序，避免二次 Date 转换造成时区漂移。
function latestHistoryAt(history) {
  let latest = null;
  for (const item of history) {
    if (item.at && (!latest || item.at > latest)) latest = item.at;
  }
  return latest;
}

function currentStatusEnteredAt(history, status) {
  let entered = null;
  for (const item of history) {
    if (item.status !== status || !item.at) continue;
    if (!entered || item.at > entered) entered = item.at;
  }
  return entered;
}

function normalizeHistory(history) {
  if (!Array.isArray(history)) return [];
  return history
    .map((item) => {
      if (typeof item === 'string') return { status: item, at: null, reason: '' };
      if (!item || typeof item !== 'object') return null;
      return {
        status: String(item.status || ''),
        at: wallClock(item.at),
        reason: item.reason ? String(item.reason) : '',
      };
    })
    .filter((item) => item && item.status);
}

function normalizeAction(value) {
  if (!value) return null;
  if (typeof value === 'string') return { required: false, action: '', message: value };
  if (typeof value === 'object') {
    return {
      required: value.required === true,
      action: value.action ? String(value.action) : '',
      message: value.message ? String(value.message) : '',
    };
  }
  return null;
}

// 一次 git log 取每个文件最近的提交日期（输出按新到旧，首次出现即为最新），避免逐任务起进程。
function collectGitDates(repo, relativePaths) {
  const wanted = new Set(relativePaths);
  const dates = new Map();
  if (!wanted.size) return dates;
  let output = '';
  try {
    output = execSync('git log --pretty=format:%ad --date=short --name-only', {
      cwd: repo,
      encoding: 'utf8',
      maxBuffer: 64 * 1024 * 1024,
    });
  } catch {
    return dates;
  }
  let current = null;
  for (const raw of output.split('\n')) {
    const line = raw.trim();
    if (!line) continue;
    if (/^\d{4}-\d{2}-\d{2}$/.test(line)) { current = line; continue; }
    if (!current || dates.has(line) || !wanted.has(line)) continue;
    dates.set(line, current);
  }
  return dates;
}

export function collectData(repo, cache = null) {
  const projectsBase = path.join(repo, 'local', 'projects');

  // ---- 任务扫描 ----
  const now = new Date();
  const projectMeta = {};
  const entries = [];
  for (const proj of fs.readdirSync(projectsBase, { withFileTypes: true })) {
    if (!proj.isDirectory()) continue;
    projectMeta[proj.name] = { tasks: 0, archived: 0, requirements: 0, requirementsArchived: 0 };
    const tdir = path.join(projectsBase, proj.name, 'tasks');
    if (!fs.existsSync(tdir)) continue;
    for (const file of walkFiles(tdir).filter((f) => path.basename(f) === 'task.yaml')) {
      entries.push({ project: proj.name, file });
    }
  }

  // task.yaml 变更不影响 git 历史与结构校验，增量重建直接复用，避免每次刷新多等 8 秒。
  const gitDates = cache?.gitDates ?? collectGitDates(repo, entries.map((entry) => path.relative(repo, entry.file).split(path.sep).join('/')));

  const tasks = [];
  for (const { project, file } of entries) {
    let doc;
    try { doc = yaml.load(fs.readFileSync(file, 'utf8')); } catch { continue; }
    if (!doc || !doc.id) continue;
    const archived = file.includes(`${path.sep}archive${path.sep}`);
    const status = String(doc.status || 'unknown');
    const statusHistory = normalizeHistory(doc.status_history);
    const taskFile = path.relative(repo, file).split(path.sep).join('/');
    const createdAt = wallClock(doc.created_at);
    const gitDate = gitDates.get(taskFile) ? `${gitDates.get(taskFile)}T00:00:00` : null;
    const historyAt = latestHistoryAt(statusHistory);
    const enteredFromHistory = currentStatusEnteredAt(statusHistory, status);
    const enteredAt = enteredFromHistory ?? gitDate ?? createdAt;
    const dwellSource = enteredFromHistory ? 'status_history' : gitDate ? 'git' : createdAt ? 'created_at' : 'unknown';
    // 验收建议只看证据是否齐全，不判断内容质量。
    const taskDir = path.dirname(file);
    const hasReview = fs.existsSync(path.join(taskDir, 'review.md'));
    const hasVerification = fs.existsSync(path.join(taskDir, 'verification.md'));
    tasks.push({
      id: String(doc.id),
      project,
      status,
      workflow: String(doc.workflow || '').replace(/^["']|["']$/g, '').replace(/^framework:/, '') || '(未声明)',
      delivery_path: String(doc.delivery_path || '(默认standard)'),
      role: doc.role ? String(doc.role) : '',
      archived,
      goal: doc.goal ? String(doc.goal) : '',
      created_at: createdAt,
      updated_at: historyAt ?? gitDate ?? createdAt,
      entered_at: enteredAt,
      days_in_status: daysBetween(enteredAt, now),
      dwell_source: dwellSource,
      next_action: normalizeAction(doc.next_action),
      next_user_action: normalizeAction(doc.next_user_action),
      status_history: statusHistory,
      has_review: hasReview,
      has_verification: hasVerification,
      task_file: taskFile,
    });
    projectMeta[project][archived ? 'archived' : 'tasks'] += 1;
  }

  // 需求箱
  for (const proj of Object.keys(projectMeta)) {
    const inbox = path.join(projectsBase, proj, 'requirements-inbox');
    if (!fs.existsSync(inbox)) continue;
    for (const f of walkFiles(inbox)) {
      if (f.includes(`${path.sep}archive${path.sep}`)) projectMeta[proj].requirementsArchived += 1;
      else projectMeta[proj].requirements += 1;
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
  const commits = cache?.commits ?? collectCommits(repo, since);

  // ---- 框架校验 ----
  const check = cache ? { ...cache.check, stale: true } : runCheck(repo);

  const version = fs.readFileSync(path.join(repo, 'VERSION'), 'utf8').trim();

  return {
    snapshot: {
      generated_at: formatLocalIso(new Date()),
      version,
      check,
      skills,
      files,
      tasks,
      projectMeta,
      commits,
    },
    cache: { gitDates, commits, check },
  };
}

function collectCommits(repo, since) {
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
  return commits;
}

function runCheck(repo) {
  const checkedAt = formatLocalIso(new Date());
  try {
    const out = execSync('npm run check', { cwd: repo, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
    return { ok: /checks passed/.test(out), detail: out.trim().split('\n').pop(), checked_at: checkedAt, stale: false };
  } catch (err) {
    return {
      ok: false,
      detail: String(err.stdout || err.message).trim().split('\n').slice(-3).join(' / '),
      checked_at: checkedAt,
      stale: false,
    };
  }
}

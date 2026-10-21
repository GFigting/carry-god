// 活跃任务时间字段校验：created_at 与 status_history[].at 必须是 task-stamp 可写入的本地时间，
// 占位值与时区后缀一律拒绝（规则正文见 core/operating-model.md 的「状态历史格式」）。
// 归档任务（tasks/archive/）与解析失败的文件不在本检查范围内。
import fs from 'node:fs/promises';
import path from 'node:path';
import yaml from 'js-yaml';

const LOCAL_DATETIME = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}$/;
const DATE_ONLY = /^\d{4}-\d{2}-\d{2}$/;

// 返回问题描述；合法时返回 null。
export function timeFieldProblem(value, { allowDate = false, allowNull = false } = {}) {
  if (value === null || value === undefined) {
    if (allowNull) return null;
    return '不得为空';
  }
  if (typeof value !== 'string') return '必须是字符串' + (allowNull ? '或 null' : '');
  if (allowDate && DATE_ONLY.test(value)) return null;
  if (LOCAL_DATETIME.test(value)) {
    return value.endsWith('T00:00:00') ? '不得使用 T00:00:00 占位，须由 task-stamp 写入真实时间' : null;
  }
  if (DATE_ONLY.test(value)) return '纯日期仅允许用于 created_at 的创建日语义';
  if (/^\d{4}-\d{2}-\d{2}[T ]/.test(value)) return '必须是不带时区后缀的本地时间 YYYY-MM-DDTHH:mm:ss';
  return '格式无效，必须是 YYYY-MM-DDTHH:mm:ss（无时区后缀）' + (allowDate ? ' 或纯日期 YYYY-MM-DD' : '');
}

async function exists(file) {
  try { await fs.access(file); return true; } catch { return false; }
}

export async function collectTaskTimeErrors(root) {
  const errors = [];
  const projectsRoot = path.join(root, 'local', 'projects');
  if (!(await exists(projectsRoot))) return errors;
  for (const entry of await fs.readdir(projectsRoot, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    const tasksRoot = path.join(projectsRoot, entry.name, 'tasks');
    if (!(await exists(tasksRoot))) continue;
    for (const taskEntry of await fs.readdir(tasksRoot, { withFileTypes: true })) {
      if (!taskEntry.isDirectory() || taskEntry.name === 'archive') continue;
      const taskFile = path.join(tasksRoot, taskEntry.name, 'task.yaml');
      if (!(await exists(taskFile))) continue;
      let data;
      // JSON_SCHEMA 不含 timestamp 类型：默认 schema 会把时间解析成 Date，丢失占位与时区后缀信息。
      try { data = yaml.load(await fs.readFile(taskFile, 'utf8'), { schema: yaml.JSON_SCHEMA }); }
      catch { continue; }
      if (!data || typeof data !== 'object') continue;
      const relative = path.relative(root, taskFile).replaceAll(path.sep, '/');
      if ('created_at' in data) {
        const problem = timeFieldProblem(data.created_at, { allowDate: true });
        if (problem) errors.push(`${relative}: created_at ${problem}：${JSON.stringify(data.created_at)}`);
      }
      for (const item of Array.isArray(data.status_history) ? data.status_history : []) {
        if (!item || typeof item !== 'object' || !('at' in item)) continue;
        const problem = timeFieldProblem(item.at, { allowNull: true });
        if (problem) errors.push(`${relative}: status_history.at ${problem}：${JSON.stringify(item.at)}`);
      }
    }
  }
  return errors;
}

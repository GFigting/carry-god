import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import yaml from 'js-yaml';

const taskFile = process.argv[2];
const frameworkRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const workflowRoot = path.join(frameworkRoot, 'workflows');
const allowedStatuses = new Set(['pending', 'in_progress', 'review', 'done', 'blocked', 'cancelled']);
const transitions = {
  pending: new Set(['in_progress', 'blocked', 'cancelled']),
  in_progress: new Set(['review', 'blocked', 'cancelled']),
  review: new Set(['in_progress', 'done', 'blocked', 'cancelled']),
  blocked: new Set(['pending', 'in_progress', 'cancelled']),
  done: new Set(),
  cancelled: new Set(),
};

if (!taskFile) {
  console.error('用法：node scripts/check-task.mjs <任务记录文件路径>');
  process.exitCode = 1;
} else {
  const file = path.resolve(taskFile);
  const errors = [];
  let task;

  try {
    task = yaml.load(await fs.readFile(file, 'utf8'), { json: false });
  } catch (error) {
    errors.push(`无法读取或解析任务 YAML：${error.message}`);
  }

  if (!isObject(task)) {
    errors.push('任务记录必须是 YAML 映射对象');
  } else {
    for (const key of ['id', 'status', 'goal', 'workflow', 'created_at', 'next_action']) {
      if (!(key in task)) errors.push(`缺少任务字段：${key}`);
    }

    if (typeof task.id !== 'string' || !/^\d{4}-\d{2}-\d{2}-[a-z0-9]+(?:-[a-z0-9]+)*$/.test(task.id)) {
      errors.push('task.id 必须使用 YYYY-MM-DD-task-slug 格式');
    } else if (path.basename(path.dirname(file)) !== task.id) {
      errors.push('任务目录名必须与 task.id 一致');
    }

    if (typeof task.status !== 'string' || !allowedStatuses.has(task.status)) errors.push(`任务状态无效：${task.status}`);
    if (typeof task.workflow !== 'string' || !/^framework:[a-z0-9]+(?:-[a-z0-9]+)*$/.test(task.workflow)) {
      errors.push('task.workflow 必须使用 framework:<workflow-name> 格式');
    } else {
      const workflowName = task.workflow.slice('framework:'.length);
      if (!(await exists(path.join(workflowRoot, `${workflowName}.md`)))) errors.push(`未知工作流：${task.workflow}`);
    }

    if (task.documentation === undefined || !isObject(task.documentation)) {
      errors.push('task.documentation 必须是映射对象');
    } else if (!['add', 'update', 'none'].includes(task.documentation.impact)) {
      errors.push('task.documentation.impact 必须是 add、update 或 none');
    } else if (task.documentation.impact === 'none' && typeof task.documentation.not_needed_reason !== 'string') {
      errors.push('impact 为 none 时必须填写 task.documentation.not_needed_reason');
    }

    if (Array.isArray(task.status_history)) {
      for (let index = 1; index < task.status_history.length; index += 1) {
        const previous = task.status_history[index - 1];
        const current = task.status_history[index];
        if (!allowedStatuses.has(previous) || !allowedStatuses.has(current)) errors.push('status_history 包含无效状态');
        else if (!transitions[previous].has(current)) errors.push(`状态转换无效：${previous} -> ${current}`);
      }
      if (task.status_history.at(-1) !== task.status) errors.push('status_history 必须以 task.status 结尾');
    }

    if (task.status === 'review' || task.status === 'done') {
      await requireReference(task.review_reference, 'review_reference', file, errors);
      await requireReference(task.verification_reference, 'verification_reference', file, errors);
    }
    if (task.status === 'done') await requireReference(task.handoff_reference, 'handoff_reference', file, errors);
  }

  if (errors.length) {
    console.error(errors.join('\n'));
    process.exitCode = 1;
  } else {
    console.log(`task checks passed: ${file}`);
  }
}

function isObject(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

async function exists(target) {
  try { await fs.access(target); return true; } catch { return false; }
}

async function requireReference(value, key, taskFilePath, errors) {
  if (typeof value !== 'string' || !value.trim()) {
    errors.push(`review 或 done 任务必须填写 ${key}`);
    return;
  }
  const target = path.resolve(path.dirname(taskFilePath), value);
  if (!(await exists(target))) errors.push(`${key} 指向的文件不存在：${value}`);
}

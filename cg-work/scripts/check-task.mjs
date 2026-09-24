import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import yaml from 'js-yaml';

const taskFile = process.argv[2];
const frameworkRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const workflowRoot = path.join(frameworkRoot, 'workflows');
const allowedStatuses = new Set(['pending', 'in_progress', 'review', 'done', 'blocked', 'cancelled']);
// `standard` is explicit opt-in for the default path; omitted values remain
// valid for backwards compatibility with historical task records.
const executionProfiles = new Set(['standard', 'lightweight']);
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

    if (task.execution_profile !== undefined && (typeof task.execution_profile !== 'string' || !executionProfiles.has(task.execution_profile))) {
      errors.push(`执行模式无效：${task.execution_profile}（可选值：standard、lightweight）`);
    }
    const isLightweight = task.execution_profile === 'lightweight';
    if (isLightweight && task.workflow !== 'framework:bugfix') {
      errors.push('lightweight 执行模式只适用于 framework:bugfix');
    }
    if (isLightweight) validateLightweightScope(task, errors);

    if (task.documentation === undefined || !isObject(task.documentation)) {
      errors.push('task.documentation 必须是映射对象');
    } else if (!['add', 'update', 'none'].includes(task.documentation.impact)) {
      errors.push('task.documentation.impact 必须是 add、update 或 none');
    } else if (task.documentation.impact === 'none' && typeof task.documentation.not_needed_reason !== 'string') {
      errors.push('impact 为 none 时必须填写 task.documentation.not_needed_reason');
    }

    validateAcceptanceSummary(task.acceptance_summary, errors);
    validateOpenDecisions(task.open_decisions, errors);

    if (task.scope_decision !== undefined) await validateScopeDecision(task, file, errors);

    if (Array.isArray(task.status_history)) {
      for (let index = 1; index < task.status_history.length; index += 1) {
        const previous = task.status_history[index - 1];
        const current = task.status_history[index];
        if (!allowedStatuses.has(previous) || !allowedStatuses.has(current)) errors.push('status_history 包含无效状态');
        else if (!transitions[previous].has(current)) errors.push(`状态转换无效：${previous} -> ${current}`);
      }
      if (task.status_history.at(-1) !== task.status) errors.push('status_history 必须以 task.status 结尾');
    }

    if (isLightweight && (task.status === 'review' || task.status === 'done')) {
      validateLightweightEvidence(task.lightweight_evidence, errors);
    } else if (task.status === 'review' || task.status === 'done') {
      await requireReference(task.review_reference, 'review_reference', file, errors);
      await requireReference(task.verification_reference, 'verification_reference', file, errors);
      if (task.execution_profile === 'standard') await validateStandardsPreflight(task, file, errors);
    }
    if (task.prototype_reference !== undefined) {
      await requireReference(task.prototype_reference, 'prototype_reference', file, errors);
      if (task.status === 'review' || task.status === 'done') {
        await requirePrototypeDisposition(task.prototype_disposition_reference, file, errors);
      } else if (task.prototype_disposition_reference !== undefined) {
        await requirePrototypeDisposition(task.prototype_disposition_reference, file, errors);
      }
    } else if (task.prototype_disposition_reference !== undefined) {
      errors.push('prototype_disposition_reference 只能与 prototype_reference 一起使用');
    }
    if (task.learning_protocol !== undefined && task.learning_protocol !== 'v1') {
      errors.push('learning_protocol 目前只支持 v1');
    }
    if (isLightweight && task.learning_protocol !== undefined) {
      errors.push('lightweight 任务不得声明 learning_protocol；请将可复用经验升级为标准任务记录');
    } else if (task.learning_protocol === 'v1' && (task.status === 'review' || task.status === 'done')) {
      await requireReference(task.learning_reference, 'learning_reference', file, errors);
    } else if (task.learning_reference !== undefined) {
      await requireReference(task.learning_reference, 'learning_reference', file, errors);
    }
    if (task.interaction_protocol !== undefined && task.interaction_protocol !== 'v1') {
      errors.push('interaction_protocol 目前只支持 v1');
    }
    if (task.interaction_protocol === 'v1' && ['review', 'blocked', 'done'].includes(task.status)) {
      validateNextUserAction(task.next_user_action, errors);
    } else if (task.next_user_action !== undefined) {
      validateNextUserAction(task.next_user_action, errors);
    }
    if (task.status === 'done' && !isLightweight) await requireReference(task.handoff_reference, 'handoff_reference', file, errors);
    await validateTaskReferences(task, file, errors);
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
    errors.push(`必须填写 ${key}`);
    return;
  }
  const target = path.resolve(path.dirname(taskFilePath), value);
  if (!(await exists(target))) errors.push(`${key} 指向的文件不存在：${value}`);
}

async function requirePrototypeDisposition(value, taskFilePath, errors) {
  if (typeof value !== 'string' || !value.trim()) {
    errors.push('必须填写 prototype_disposition_reference');
    return;
  }
  const target = path.resolve(path.dirname(taskFilePath), value);
  let content;
  try {
    content = await fs.readFile(target, 'utf8');
  } catch {
    errors.push(`prototype_disposition_reference 指向的文件不存在：${value}`);
    return;
  }
  for (const heading of ['采纳结论', '实现映射', '验证映射', '未采纳项']) {
    if (!new RegExp(`^##\\s+${heading}\\s*$`, 'm').test(content)) {
      errors.push(`prototype_disposition_reference 缺少“${heading}”章节：${value}`);
    }
  }
}

async function validateStandardsPreflight(task, taskFilePath, errors) {
  for (const key of ['plan_reference', 'verification_reference']) {
    await requireReference(task[key], key, taskFilePath, errors);
    if (typeof task[key] !== 'string' || !task[key].trim()) continue;
    const target = path.resolve(path.dirname(taskFilePath), task[key]);
    let content;
    try {
      content = await fs.readFile(target, 'utf8');
    } catch {
      continue;
    }
    if (!/standards_preflight/i.test(content)) {
      errors.push(`standard 任务的 ${key} 必须包含 standards_preflight 段落：${task[key]}`);
    }
  }
}

async function validateTaskReferences(task, taskFilePath, errors) {
  for (const key of ['parent_task_reference', 'roadmap_reference', 'closure_reference', 'requirements_reference']) {
    if (task[key] !== undefined) await requireNonSelfReference(task[key], key, taskFilePath, errors);
  }

  for (const key of ['depends_on', 'follow_up_task_references', 'child_task_references']) {
    if (task[key] === undefined) continue;
    if (!Array.isArray(task[key]) || task[key].some((value) => typeof value !== 'string' || !value.trim())) {
      errors.push(`${key} 必须是非空路径字符串数组`);
      continue;
    }
    for (const value of task[key]) await requireNonSelfReference(value, key, taskFilePath, errors);
  }

  if (task.requirements_coverage !== undefined) {
    if (!isObject(task.requirements_coverage) || !Object.keys(task.requirements_coverage).length
      || Object.values(task.requirements_coverage).some((value) => typeof value !== 'string' || !value.trim())) {
      errors.push('requirements_coverage 必须是非空映射，值为需求证据路径');
    } else {
      for (const value of Object.values(task.requirements_coverage)) {
        await requireNonSelfReference(value, 'requirements_coverage', taskFilePath, errors);
      }
    }
  }

  if (task.status === 'done' && task.roadmap_reference !== undefined) {
    await requireReference(task.closure_reference, 'closure_reference', taskFilePath, errors);
  }
}

async function validateScopeDecision(task, taskFilePath, errors) {
  const decision = task.scope_decision;
  if (!isObject(decision)) {
    errors.push('scope_decision 必须是映射对象');
    return;
  }
  if (!['independent', 'continuation'].includes(decision.mode)) {
    errors.push('scope_decision.mode 必须是 independent 或 continuation');
  }
  if (typeof decision.rationale !== 'string' || !decision.rationale.trim()) {
    errors.push('scope_decision.rationale 必须说明为何新建或延续任务');
  }
  if (decision.mode === 'continuation') {
    await requireNonSelfReference(decision.prior_task_reference, 'scope_decision.prior_task_reference', taskFilePath, errors);
    if (['in_progress', 'review', 'done'].includes(task.status)) {
      await requireReference(task.plan_reference, 'plan_reference', taskFilePath, errors);
    }
  } else if (decision.prior_task_reference !== undefined) {
    errors.push('independent 任务不得填写 scope_decision.prior_task_reference');
  }
}

async function requireNonSelfReference(value, key, taskFilePath, errors) {
  if (typeof value !== 'string' || !value.trim()) {
    errors.push(`${key} 必须是非空路径字符串`);
    return;
  }
  const target = path.resolve(path.dirname(taskFilePath), value);
  if (target === taskFilePath) {
    errors.push(`${key} 不能指向任务自身`);
    return;
  }
  if (!(await exists(target))) errors.push(`${key} 指向的文件不存在：${value}`);
}

function validateNextUserAction(value, errors) {
  if (!isObject(value)) {
    errors.push('必须填写 next_user_action');
    return;
  }
  if (typeof value.required !== 'boolean') errors.push('next_user_action.required 必须是布尔值');
  if (typeof value.action !== 'string' || !value.action.trim()) errors.push('next_user_action.action 必须是非空字符串');
  if (typeof value.message !== 'string' || !value.message.trim()) errors.push('next_user_action.message 必须是非空字符串');
}

function validateAcceptanceSummary(value, errors) {
  if (value === undefined) return;
  if (!Array.isArray(value) || value.length === 0 || value.some((item) => typeof item !== 'string' || !item.trim())) {
    errors.push('acceptance_summary 必须是非空字符串数组');
  }
}

function validateOpenDecisions(value, errors) {
  if (value === undefined) return;
  if (!Array.isArray(value)) {
    errors.push('open_decisions 必须是数组');
    return;
  }
  const ids = new Set();
  value.forEach((decision, index) => {
    const prefix = `open_decisions[${index}]`;
    if (!isObject(decision)) {
      errors.push(`${prefix} 必须是映射对象`);
      return;
    }
    if (typeof decision.id !== 'string' || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(decision.id)) {
      errors.push(`${prefix}.id 必须使用 kebab-case`);
    } else if (ids.has(decision.id)) {
      errors.push(`${prefix}.id 不得重复：${decision.id}`);
    } else {
      ids.add(decision.id);
    }
    if (typeof decision.question !== 'string' || !decision.question.trim()) {
      errors.push(`${prefix}.question 必须是非空字符串`);
    }
    if (typeof decision.blocking !== 'boolean') {
      errors.push(`${prefix}.blocking 必须是布尔值`);
    }
  });
}

function validateLightweightEvidence(value, errors) {
  if (!isObject(value)) {
    errors.push('lightweight 任务进入审查或完成前必须填写 lightweight_evidence');
    return;
  }
  for (const key of ['root_cause', 'scope', 'verification', 'review', 'integration_decision']) {
    if (typeof value[key] !== 'string' || !value[key].trim()) {
      errors.push(`lightweight_evidence.${key} 必须是非空字符串`);
    }
  }
}

function validateLightweightScope(task, errors) {
  for (const key of [
    'prototype_reference',
    'prototype_disposition_reference',
    'roadmap_reference',
    'closure_reference',
    'parent_task_reference',
    'depends_on',
    'follow_up_task_references',
    'child_task_references',
    'requirements_coverage'
  ]) {
    if (task[key] !== undefined) errors.push(`lightweight 任务不得声明 ${key}`);
  }
}

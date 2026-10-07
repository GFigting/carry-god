import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import yaml from 'js-yaml';

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

export async function checkTaskRecord(taskFile) {
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
  } else if (task.archived === true) {
    // 已归档记录只需成功解析 YAML；归档本身明确退出任务生命周期门禁。
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
    const isCompact = task.artifact_profile === 'compact';
    if (task.artifact_profile !== undefined && task.artifact_profile !== 'compact') {
      errors.push(`artifact_profile 无效：${task.artifact_profile}（可选值：compact）`);
    }
    if (isCompact && (task.status === 'review' || task.status === 'done')) {
      await validateCompactArtifacts(task, file, errors);
    }
    const isLightweight = task.execution_profile === 'lightweight';
    const lightweightWorkflows = new Set(['framework:bugfix', 'framework:feature-development']);
    if (isLightweight && !lightweightWorkflows.has(task.workflow)) {
      errors.push('lightweight 执行模式只适用于 framework:bugfix 或 framework:feature-development');
    }
    // compact 是证据文件组织方式而非执行档位；轻量执行的证据已合并进 task.yaml，
    // 两者同时声明会引入多余的主产物门禁，按组合规则表直接拒绝。
    if (isLightweight && isCompact) {
      errors.push('lightweight 与 artifact_profile: compact 不能同时声明：轻量执行的证据已合并进 task.yaml，需要主产物时使用标准执行');
    }
    if (isLightweight) validateLightweightScope(task, errors);

    validateDocumentation(task.documentation, errors);

    validateAcceptanceSummary(task.acceptance_summary, errors);
    validateOpenDecisions(task.open_decisions, errors);

    // standards_preflight 是 plan.md 与 verification.md 里的证据段落，不是任务字段。
    if (task.standards_preflight !== undefined) {
      errors.push('standards_preflight 不是 task.yaml 字段；请写入 plan.md 和 verification.md 的证据段落');
    }

    if (task.scope_decision !== undefined) await validateScopeDecision(task, file, errors);

    if (Array.isArray(task.status_history)) validateStatusHistory(task.status_history, task.status, errors);

    if (isLightweight && (task.status === 'review' || task.status === 'done')) {
      validateLightweightEvidence(task.lightweight_evidence, task, errors);
    } else if (!isCompact && (task.status === 'review' || task.status === 'done')) {
      await requireReference(task.review_reference, 'review_reference', file, errors);
      await requireReference(task.verification_reference, 'verification_reference', file, errors);
      if (task.execution_profile === 'standard') await validateStandardsPreflight(task, file, errors);
    }
    if (task.prototype_contract_reference !== undefined) {
      errors.push('prototype_contract_reference 已废弃：原型实现契约写入计划记录的“原型实现契约”章节');
    }
    if (task.prototype_disposition_reference !== undefined) {
      errors.push('prototype_disposition_reference 已废弃：原型采纳结论写入评审记录的“原型采纳”章节');
    }
    if (task.prototype_reference !== undefined) {
      await requireReference(task.prototype_reference, 'prototype_reference', file, errors);
      if (['in_progress', 'review', 'done'].includes(task.status)) {
        await requirePrototypeSection(task, file, {
          kind: 'contract',
          label: '原型实现契约',
          headings: ['问题与目标', '状态与场景', '视觉与响应式约束', '资源与依赖', '交互与业务规则', '验收映射'],
          errors,
        });
      }
      if (['review', 'done'].includes(task.status)) {
        await requirePrototypeSection(task, file, {
          kind: 'adoption',
          label: '原型采纳',
          headings: ['采纳结论', '实现映射', '验证映射', '未采纳项'],
          errors,
        });
      }
    }
    if (task.learning_protocol !== undefined && task.learning_protocol !== 'v1') {
      errors.push('learning_protocol 目前只支持 v1');
    }
    if (isLightweight && task.learning_protocol !== undefined) {
      errors.push('lightweight 任务不得声明 learning_protocol；请将可复用经验升级为标准任务记录');
    } else if (!isCompact && task.learning_protocol === 'v1'
      && (task.status === 'review' || task.status === 'done')) {
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
    if (task.status === 'done' && !isLightweight && !isCompact) await requireReference(task.handoff_reference, 'handoff_reference', file, errors);
    await validateTaskReferences(task, file, errors);
  }

  return errors;
}

const taskFile = process.argv[2];
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  if (!taskFile) {
    console.error('用法：node scripts/check-task.mjs <任务记录文件路径>');
    process.exitCode = 1;
  } else {
    const errors = await checkTaskRecord(taskFile);
    if (errors.length) {
      console.error(errors.join('\n'));
      process.exitCode = 1;
    } else {
      console.log(`task checks passed: ${path.resolve(taskFile)}`);
    }
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

async function validateCompactArtifacts(task, taskFilePath, errors) {
  if (!isObject(task.artifacts) || typeof task.artifacts.primary !== 'string' || !task.artifacts.primary.trim()) {
    errors.push('compact 任务必须填写 artifacts.primary 主产物');
    return;
  }
  const target = path.resolve(path.dirname(taskFilePath), task.artifacts.primary);
  if (target === taskFilePath) errors.push('artifacts.primary 不能指向任务自身');
  else if (!(await exists(target))) errors.push(`artifacts.primary 指向的文件不存在：${task.artifacts.primary}`);
}

// 原型实现契约写入计划记录、采纳结论写入评审记录；compact 任务统一写入其主产物。
function prototypeSectionFile(task, kind) {
  if (task.artifact_profile === 'compact' && isObject(task.artifacts)
    && typeof task.artifacts.primary === 'string' && task.artifacts.primary.trim()) {
    return task.artifacts.primary;
  }
  const reference = kind === 'contract' ? task.plan_reference : task.review_reference;
  if (typeof reference === 'string' && reference.trim()) return reference;
  return kind === 'contract' ? './plan.md' : './review.md';
}

async function requirePrototypeSection(task, taskFilePath, { kind, label, headings, errors }) {
  const relative = prototypeSectionFile(task, kind);
  const target = path.resolve(path.dirname(taskFilePath), relative);
  let content;
  try {
    content = await fs.readFile(target, 'utf8');
  } catch {
    errors.push(`声明 prototype_reference 的任务需要${label}，但 ${relative} 不存在`);
    return;
  }
  if (!new RegExp(`^#{2,3}\\s+${label}\\s*$`, 'm').test(content)) {
    errors.push(`${relative} 缺少“${label}”章节`);
  }
  for (const heading of headings) {
    if (!new RegExp(`^#{2,4}\\s+${heading}\\s*$`, 'm').test(content)) {
      errors.push(`${label}缺少“${heading}”章节：${relative}`);
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
  for (const key of ['parent_task_reference', 'roadmap_reference', 'closure_reference']) {
    if (task[key] !== undefined) await requireNonSelfReference(task[key], key, taskFilePath, errors);
  }
  await validateRequirementsReference(task, taskFilePath, errors);

  for (const key of ['depends_on']) {
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

async function validateRequirementsReference(task, taskFilePath, errors) {
  const note = task.requirements_reference_note;
  if (note !== undefined && (typeof note !== 'string' || !note.trim())) {
    errors.push('requirements_reference_note 必须是非空字符串');
    return;
  }
  if (task.requirements_reference === undefined) {
    if (note !== undefined) errors.push('requirements_reference_note 不能脱离 requirements_reference 单独使用');
    return;
  }
  if (typeof task.requirements_reference !== 'string' || !task.requirements_reference.trim()) {
    errors.push('requirements_reference 必须是非空路径字符串');
    return;
  }
  const target = path.resolve(path.dirname(taskFilePath), task.requirements_reference);
  if (target === taskFilePath) {
    errors.push('requirements_reference 不能指向任务自身');
    return;
  }
  if (await exists(target)) {
    if (note !== undefined) errors.push('requirements_reference 目标存在时不得填写 requirements_reference_note');
    return;
  }
  if (note === undefined) errors.push(`requirements_reference 指向的文件不存在：${task.requirements_reference}`);
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

function validateDocumentation(value, errors) {
  if (!isObject(value)) {
    errors.push('task.documentation 必须是映射对象');
    return;
  }
  if (!['add', 'update', 'none'].includes(value.impact)) {
    errors.push('task.documentation.impact 必须是 add、update 或 none');
  }
  if (value.files !== undefined && value.targets !== undefined) {
    errors.push('task.documentation.files 与 targets 不能同时填写；targets 仅为历史兼容字段');
  }
  if (value.reason !== undefined && value.not_needed_reason !== undefined) {
    errors.push('task.documentation.reason 与 not_needed_reason 不能同时填写；not_needed_reason 仅为历史兼容字段');
  }
  for (const [key, label] of [['files', 'files'], ['targets', 'targets']]) {
    if (value[key] === undefined) continue;
    if (!Array.isArray(value[key]) || value[key].length === 0 || value[key].some((item) => typeof item !== 'string' || !item.trim())) {
      errors.push(`task.documentation.${label} 必须是非空字符串数组`);
    }
  }
  if (value.impact === 'none') {
    const reason = value.reason ?? value.not_needed_reason;
    if (typeof reason !== 'string' || !reason.trim()) errors.push('impact 为 none 时必须填写 task.documentation.reason（历史记录可使用 not_needed_reason）');
  }
  if (value.summary !== undefined && (typeof value.summary !== 'string' || !value.summary.trim())) {
    errors.push('task.documentation.summary 如填写必须是非空字符串');
  }
}

function validateStatusHistory(history, currentStatus, errors) {
  const statuses = [];
  for (const entry of history) {
    if (typeof entry === 'string') {
      statuses.push(entry);
      continue;
    }
    if (!isObject(entry) || typeof entry.status !== 'string' || !entry.status.trim()) {
      errors.push('status_history 项必须是状态字符串或包含 status 的映射');
      statuses.push(null);
      continue;
    }
    const validDateObject = entry.at instanceof Date && !Number.isNaN(entry.at.getTime());
    if (entry.at !== null && entry.at !== undefined && !validDateObject
      && (typeof entry.at !== 'string' || Number.isNaN(Date.parse(entry.at)))) {
      errors.push('status_history.at 必须是 ISO 时间字符串或 null');
    }
    if (typeof entry.reason !== 'string' || !entry.reason.trim()) {
      errors.push('结构化 status_history 项必须填写非空 reason');
    }
    statuses.push(entry.status);
  }
  for (let index = 1; index < statuses.length; index += 1) {
    const previous = statuses[index - 1];
    const next = statuses[index];
    if (!allowedStatuses.has(previous) || !allowedStatuses.has(next)) errors.push('status_history 包含无效状态');
    else if (!transitions[previous].has(next)) errors.push(`状态转换无效：${previous} -> ${next}`);
  }
  if (statuses.at(-1) !== currentStatus) errors.push('status_history 必须以 task.status 结尾');
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

function validateLightweightEvidence(value, task, errors) {
  if (!isObject(value)) {
    errors.push('lightweight 任务进入审查或完成前必须填写 lightweight_evidence');
    return;
  }
  // 缺陷类要交代根因；功能类没有"根因"可言，以范围/验证/自审/集成结论为准。
  const keys = task.workflow === 'framework:bugfix'
    ? ['root_cause', 'scope', 'verification', 'review', 'integration_decision']
    : ['scope', 'verification', 'review', 'integration_decision'];
  for (const key of keys) {
    if (typeof value[key] !== 'string' || !value[key].trim()) {
      errors.push(`lightweight_evidence.${key} 必须是非空字符串`);
    }
  }
}

function validateLightweightScope(task, errors) {
  for (const key of [
    'prototype_reference',
    'roadmap_reference',
    'closure_reference',
    'parent_task_reference',
    'depends_on',
    'requirements_coverage'
  ]) {
    if (task[key] !== undefined) errors.push(`lightweight 任务不得声明 ${key}`);
  }
}

import { TYPES, STATES, canTransition } from './transitions.js';

export function validateTask(task) {
  const errors = [];
  for (const field of ['id', 'type', 'title', 'status', 'acceptance', 'evidence']) {
    if (task[field] === undefined || task[field] === null) errors.push(`missing field: ${field}`);
  }
  if (task.type && !TYPES.has(task.type)) errors.push(`invalid type: ${task.type}`);
  if (task.status && !STATES.includes(task.status)) errors.push(`invalid status: ${task.status}`);
  if (task.id && !/^TASK-[A-Za-z0-9._-]+$/.test(task.id)) errors.push('invalid task id');
  if (typeof task.title === 'string' && !task.title.trim()) errors.push('title must not be empty');
  if (!Array.isArray(task.acceptance)) errors.push('acceptance must be an array');
  if (!Array.isArray(task.evidence)) errors.push('evidence must be an array');
  for (const item of task.acceptance || []) {
    if (!item?.id || !item?.text) errors.push('acceptance items require id and text');
  }
  const acceptanceIds = new Set((task.acceptance || []).map((item) => item.id));
  for (const item of task.evidence || []) {
    if (!item?.id || !item?.kind || !item?.acceptance || !item?.result) errors.push('evidence items require id, kind, acceptance, and result');
    if (item?.acceptance && !acceptanceIds.has(item.acceptance)) errors.push(`evidence references unknown acceptance: ${item.acceptance}`);
  }
  return errors;
}

export function validateTransition(task, target, reason) {
  const errors = [];
  if (!STATES.includes(target)) errors.push(`invalid target status: ${target}`);
  else if (!canTransition(task.status, target)) errors.push(`illegal transition: ${task.status} -> ${target}`);
  if (target === 'ready' && (!task.intent || !task.scope?.include?.length || !task.acceptance?.length)) errors.push('ready requires intent, scope, and acceptance');
  if (target === 'under_review' && (!task.outputs?.length || !task.evidence?.length)) errors.push('under_review requires outputs and verification evidence');
  if (target === 'blocked' && (!task.blocker || !task.owner || !task.unblock_condition)) errors.push('blocked requires blocker, owner, and unblock condition');
  if (target === 'revision' && !task.findings?.length) errors.push('revision requires findings');
  if (['blocked', 'revision', 'cancelled', 'done'].includes(target) && !reason) errors.push(`reason required for ${target}`);
  if (target === 'done') {
    const ids = new Set(task.evidence.filter((e) => e.result === 'pass' || e.result === 'verified').map((e) => e.acceptance));
    const missing = task.acceptance.filter((item) => item.id && !ids.has(item.id));
    if (missing.length) errors.push(`evidence required for acceptance: ${missing.map((x) => x.id).join(', ')}`);
    if (!task.acceptance.length || !task.evidence.length) errors.push('done requires acceptance and evidence');
    if (!task.residual_risk_declared) errors.push('done requires residual risk declaration');
  }
  return errors;
}

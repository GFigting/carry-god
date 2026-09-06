import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { appendEvent, createTask, listTasks, loadEvents, loadTask, saveTask, taskDir } from './task-store.js';
import { TYPES } from './transitions.js';
import { validateTask, validateTransition } from './validators.js';
import { initializeProject, loadProjectConfig } from './project-store.js';
import { classifyRequest, makeTaskId, titleFromRequest } from './intake.js';
import { importSkill, importSkillDirectory } from './skill-importer.js';
import { startWebServer } from './web-server.js';

const EXIT = { VALIDATION: 1, ARGS: 2, TRANSITION: 3, EVIDENCE: 4, CAPABILITY: 5 };
function fail(message, code = EXIT.VALIDATION) { const error = new Error(message); error.exitCode = code; throw error; }
function value(args, flag) { const i = args.indexOf(flag); return i >= 0 ? args[i + 1] : undefined; }
function required(args, flag) { const v = value(args, flag); if (!v) fail(`missing argument: ${flag}`, EXIT.ARGS); return v; }
function values(args, flag) { const found = []; for (let i = 0; i < args.length; i += 1) if (args[i] === flag && args[i + 1]) found.push(args[i + 1]); return found; }

export async function main(args) {
  const [command, id, ...rest] = args;
  if (!command) fail('command required', EXIT.ARGS);
  if (command === 'init') return init(id, rest);
  if (command === 'intake') return intake([id, ...rest].filter((value) => value !== undefined));
  if (command === 'list') return list();
  if (command === 'web') return web([id, ...rest].filter((value) => value !== undefined));
  if (command === 'skill') return skill([id, ...rest].filter((value) => value !== undefined));
  if (!id) fail('task id required', EXIT.ARGS);
  if (command === 'check') return check(id);
  if (command === 'show') return show(id);
  if (command === 'update') return update(id, rest);
  if (command === 'acceptance') return acceptance(id, rest);
  if (command === 'capability') return capability(id, rest);
  if (command === 'context') return context(id, rest);
  if (command === 'plan') return plan(id, rest);
  if (command === 'step') return step(id, rest);
  if (command === 'artifact') return artifact(id, rest);
  if (command === 'learn') return learn(id, rest);
  if (command === 'subtask') return subtask(id, rest);
  if (command === 'resume') return resume(id);
  if (command === 'transition') return transition(id, rest);
  if (command === 'evidence') return evidence(id, rest);
  fail(`unknown command: ${command}`, EXIT.ARGS);
}

async function web(args) {
  const port = Number(value(args, '--port') || 3210); if (!Number.isInteger(port) || port < 1 || port > 65535) fail('invalid port', EXIT.ARGS);
  const server = startWebServer({ port }); console.log(JSON.stringify({ ok: true, url: `http://127.0.0.1:${port}` }));
  await new Promise((resolve) => server.on('close', resolve));
}

async function skill(args) {
  if (args[0] === 'list') return skillList();
  if (args[0] === 'show') return skillShow(required(args, '--id'));
  if (!['import', 'import-dir'].includes(args[0])) fail('skill subcommand must be import, import-dir, list, or show', EXIT.ARGS);
  const sourcePath = required(args, '--path');
  const result = args[0] === 'import-dir' ? await importSkillDirectory(sourcePath) : await importSkill(sourcePath);
  console.log(JSON.stringify({ ok: true, ...result }));
}

async function skillIndex() {
  const file = path.join(process.env.CG_HARNESS_ROOT || path.resolve(fileURLToPath(new URL('../..', import.meta.url))), 'skills', 'imported', 'INDEX.json');
  try { return JSON.parse(await fs.readFile(file, 'utf8')); } catch { return []; }
}

async function skillList() {
  const skills = await skillIndex();
  console.log(JSON.stringify({ skills: skills.map(({ id, names, quality, sources }) => ({ id, names, quality, source_count: sources?.length || 0 })) }, null, 2));
}

async function skillShow(id) {
  const skill = (await skillIndex()).find((item) => item.id === id);
  if (!skill) fail(`skill not found: ${id}`, EXIT.CAPABILITY);
  console.log(JSON.stringify(skill, null, 2));
}

async function list() {
  const ids = await listTasks();
  const tasks = await Promise.all(ids.map(async (id) => {
    const task = await loadTask(id);
    return { id: task.id, type: task.type, title: task.title, status: task.status, updated_at: task.updated_at };
  }));
  console.log(JSON.stringify({ tasks }, null, 2));
}

async function update(id, args) {
  const task = await loadTask(id);
  const scalar = [['--intent', 'intent'], ['--owner', 'owner'], ['--goal', 'goal'], ['--project', 'project'], ['--blocker', 'blocker'], ['--unblock', 'unblock_condition']];
  for (const [flag, field] of scalar) { const v = value(args, flag); if (v !== undefined) task[field] = v; }
  const include = value(args, '--include'); if (include) task.scope.include.push(include);
  const exclude = value(args, '--exclude'); if (exclude) task.scope.exclude.push(exclude);
  const preserve = value(args, '--preserve'); if (preserve) task.preserve.push(preserve);
  const risk = value(args, '--risk'); if (risk) task.risks.push(risk);
  const output = value(args, '--output'); if (output) task.outputs.push(output);
  const finding = value(args, '--finding'); if (finding) task.findings.push(finding);
  for (const dependency of values(args, '--depends-on')) if (!task.dependencies.includes(dependency)) task.dependencies.push(dependency);
  if (args.includes('--risk-declared')) task.residual_risk_declared = true;
  await saveTask(task);
  const fields = scalar.filter(([flag]) => value(args, flag) !== undefined).map(([, field]) => field);
  if (include) fields.push('scope.include');
  if (exclude) fields.push('scope.exclude');
  if (preserve) fields.push('preserve');
  if (risk) fields.push('risks');
  if (output) fields.push('outputs');
  if (finding) fields.push('findings');
  if (values(args, '--depends-on').length) fields.push('dependencies');
  if (args.includes('--risk-declared')) fields.push('residual_risk_declared');
  await appendEvent(id, { event: 'task_updated', actor: 'cg-cli', fields });
  console.log(JSON.stringify({ ok: true, task: id }));
}

async function acceptance(id, args) {
  if (args[0] !== 'add') fail('acceptance subcommand must be add', EXIT.ARGS);
  const task = await loadTask(id);
  const item = { id: required(args, '--id'), text: required(args, '--text') };
  if (task.acceptance.some((entry) => entry.id === item.id)) fail(`acceptance already exists: ${item.id}`);
  task.acceptance.push(item);
  await saveTask(task);
  await appendEvent(id, { event: 'acceptance_added', actor: 'cg-cli', acceptance: item });
  console.log(JSON.stringify({ ok: true, task: id, acceptance: item.id }));
}

async function capability(id, args) {
  if (args[0] !== 'record') fail('capability subcommand must be record', EXIT.ARGS);
  const task = await loadTask(id);
  const file = required(args, '--path');
  let record;
  try { record = JSON.parse(await fs.readFile(file, 'utf8')); } catch (error) { fail(`invalid capability result: ${error.message}`, EXIT.CAPABILITY); }
  const requiredFields = ['capability', 'provider', 'result'];
  for (const field of requiredFields) if (!record?.[field]) fail(`capability result missing: ${field}`, EXIT.CAPABILITY);
  const results = new Set(['completed', 'failed', 'unavailable', 'fallback']);
  if (!results.has(record.result)) fail(`invalid capability result: ${record.result}`, EXIT.CAPABILITY);
  if (record.task && record.task !== id) fail(`capability result task mismatch: ${record.task}`, EXIT.CAPABILITY);
  if (!Array.isArray(task.capabilities)) task.capabilities = [];
  const stored = { ...record, recorded_at: new Date().toISOString() };
  task.capabilities.push(stored);
  if (record.fallback) task.fallback = record.fallback;
  for (const risk of record.risks || []) if (!task.risks.includes(risk)) task.risks.push(risk);
  for (const artifact of record.artifacts || []) if (!task.outputs.includes(artifact)) task.outputs.push(artifact);
  await saveTask(task);
  await appendEvent(id, { event: 'capability_recorded', actor: 'cg-cli', capability: stored });
  console.log(JSON.stringify({ ok: true, task: id, capability: record.capability, result: record.result }));
}

async function context(id, args) {
  if (args[0] !== 'create') fail('context subcommand must be create', EXIT.ARGS);
  const task = await loadTask(id);
  const file = pathFor(task, 'context', value(args, '--path') || 'context-package.md');
  const content = `# Context Package\n\n- Project: ${task.project || ''}\n- Goal: ${task.goal || ''}\n- Task: ${task.id}\n- Intent: ${task.intent}\n\n## Scope\n\n- Include: ${(task.scope?.include || []).join(', ')}\n- Exclude: ${(task.scope?.exclude || []).join(', ')}\n\n## Acceptance\n\n${(task.acceptance || []).map((item) => `- ${item.id}: ${item.text}`).join('\n')}\n`;
  await fs.mkdir(path.dirname(file), { recursive: true }); await fs.writeFile(file, content, 'utf8');
  task.context_package = file; await saveTask(task); await appendEvent(id, { event: 'context_created', actor: 'cg-cli', path: file });
  console.log(JSON.stringify({ ok: true, task: id, context: file }));
}

async function plan(id, args) {
  if (args[0] !== 'create') fail('plan subcommand must be create', EXIT.ARGS);
  const task = await loadTask(id); const text = required(args, '--text');
  const file = pathFor(task, 'artifacts', value(args, '--path') || 'plan.md');
  await fs.mkdir(path.dirname(file), { recursive: true }); await fs.writeFile(file, `# Implementation Plan\n\n${text.trim()}\n`, 'utf8');
  if (!task.artifacts.includes(file)) task.artifacts.push(file); if (!task.outputs.includes(file)) task.outputs.push(file);
  const steps = values(args, '--step');
  if (steps.length) task.plan_steps = steps.map((step, index) => ({ id: `P${index + 1}`, text: step, status: 'pending' }));
  await saveTask(task); await appendEvent(id, { event: 'plan_created', actor: 'cg-cli', path: file, steps: task.plan_steps || [] });
  console.log(JSON.stringify({ ok: true, task: id, plan: file }));
}

async function step(id, args) {
  const action = args[0];
  if (!['list', 'start', 'done'].includes(action)) fail('step subcommand must be list, start, or done', EXIT.ARGS);
  const task = await loadTask(id);
  if (!Array.isArray(task.plan_steps) || !task.plan_steps.length) fail('task has no plan steps', EXIT.VALIDATION);
  if (action === 'list') {
    console.log(JSON.stringify({ task: id, steps: task.plan_steps }, null, 2));
    return;
  }
  const stepId = required(args, '--id'); const item = task.plan_steps.find((entry) => entry.id === stepId);
  if (!item) fail(`unknown plan step: ${stepId}`, EXIT.VALIDATION);
  if (action === 'start') {
    if (item.status === 'done') fail(`plan step already done: ${stepId}`, EXIT.VALIDATION);
    item.status = 'in_progress'; item.started_at ||= new Date().toISOString();
  } else {
    if (item.status !== 'in_progress') fail(`plan step must be in_progress: ${stepId}`, EXIT.VALIDATION);
    item.status = 'done'; item.completed_at = new Date().toISOString();
  }
  await saveTask(task); await appendEvent(id, { event: 'plan_step_updated', actor: 'cg-cli', step: item, action });
  console.log(JSON.stringify({ ok: true, task: id, step: item }));
}

async function artifact(id, args) {
  if (args[0] !== 'add') fail('artifact subcommand must be add', EXIT.ARGS);
  const task = await loadTask(id); const file = required(args, '--path');
  try { await fs.access(file); } catch { fail(`artifact path not found: ${file}`, EXIT.VALIDATION); }
  if (!task.artifacts.includes(file)) task.artifacts.push(file); if (!task.outputs.includes(file)) task.outputs.push(file);
  await saveTask(task); await appendEvent(id, { event: 'artifact_recorded', actor: 'cg-cli', path: file });
  console.log(JSON.stringify({ ok: true, task: id, artifact: file }));
}

async function learn(id, args) {
  if (args[0] !== 'add') fail('learn subcommand must be add', EXIT.ARGS);
  const task = await loadTask(id); const text = required(args, '--text');
  const entry = { text: text.trim(), recorded_at: new Date().toISOString() };
  if (!Array.isArray(task.learnings)) task.learnings = []; task.learnings.push(entry); await saveTask(task);
  await appendEvent(id, { event: 'learning_recorded', actor: 'cg-cli', learning: entry });
  console.log(JSON.stringify({ ok: true, task: id, learning: entry }));
}

async function subtask(id, args) {
  if (args[0] !== 'add') fail('subtask subcommand must be add', EXIT.ARGS);
  const parent = await loadTask(id); const childId = required(args, '--id'); const type = value(args, '--type') || parent.type; const title = required(args, '--title');
  if (!TYPES.has(type)) fail(`invalid type: ${type}`); const child = await createTask({ id: childId, type, title }); child.parent_task = id; await saveTask(child);
  parent.subtasks.push(childId); await saveTask(parent); await appendEvent(id, { event: 'subtask_added', actor: 'cg-cli', subtask: childId });
  console.log(JSON.stringify({ ok: true, parent: id, subtask: childId }));
}

async function resume(id) {
  const task = await loadTask(id); const events = await loadEvents(id);
  const currentStep = (task.plan_steps || []).find((step) => step.status === 'in_progress') || (task.plan_steps || []).find((step) => step.status === 'pending');
  console.log(JSON.stringify({ task: id, status: task.status, next_action: task.next_action, current_step: currentStep || null, last_event: events.at(-1)?.event || null, open_questions: task.open_questions || [] }, null, 2));
}

function pathFor(task, folder, requested) {
  return path.isAbsolute(requested) ? requested : path.join(taskDir(task.id), folder, requested);
}

async function init(id, args) {
  if (id === '--project' || args.includes('--project')) {
    const projectPath = value([id, ...args], '--path') || process.cwd();
    const config = await initializeProject(projectPath);
    console.log(JSON.stringify({ ok: true, project: config.project }, null, 2));
    return;
  }
  if (!id) fail('task id required', EXIT.ARGS);
  const type = required(args, '--type');
  const title = required(args, '--title');
  if (!TYPES.has(type)) fail(`invalid type: ${type}`);
  const task = await createTask({ id, type, title });
  console.log(JSON.stringify({ ok: true, task: task.id, status: task.status }));
}

async function intake(args) {
  let text = value(args, '--text');
  const inputFile = value(args, '--file');
  if (!text && inputFile) { try { text = await fs.readFile(inputFile, 'utf8'); } catch (error) { fail(`intake file not found: ${inputFile}`, EXIT.ARGS); } }
  if (!text && args.includes('--stdin')) text = await new Promise((resolve, reject) => { let data = ''; process.stdin.setEncoding('utf8'); process.stdin.on('data', (chunk) => { data += chunk; }); process.stdin.on('end', () => resolve(data)); process.stdin.on('error', reject); });
  if (!text?.trim()) fail('--text, --file, or --stdin required', EXIT.ARGS);
  const classification = classifyRequest(text);
  const id = value(args, '--id') || makeTaskId(await listTasks());
  const task = await createTask({ id, type: classification.type, title: titleFromRequest(text) });
  task.source = 'intake';
  task.intent = text.trim();
  task.confidence = classification.confidence;
  task.open_questions = classification.open_questions;
  task.intake = { matched_types: classification.matched_types, received_at: new Date().toISOString() };
  const project = await loadProjectConfig();
  if (project) { task.project = project.project.name; task.context_package = project.harness?.context_path || ''; }
  if (classification.confidence === 'low') task.next_action = 'clarify';
  await saveTask(task);
  await appendEvent(id, { event: 'intake_classified', actor: 'cg-cli', type: classification.type, confidence: classification.confidence, matched_types: classification.matched_types });
  console.log(JSON.stringify({ ok: true, task: id, type: classification.type, confidence: classification.confidence, open_questions: classification.open_questions }, null, 2));
}

async function check(id) {
  const task = await loadTask(id);
  const errors = validateTask(task);
  const events = await loadEvents(id);
  if (events.length && events.at(-1).to === undefined && task.status !== 'draft') errors.push('latest event does not record current status');
  if (errors.length) fail(JSON.stringify({ task: id, errors }));
  console.log(JSON.stringify({ ok: true, task: id, status: task.status, events: events.length }));
}

async function transition(id, args) {
  const task = await loadTask(id);
  const target = required(args, '--to');
  const reason = value(args, '--reason');
  const errors = validateTransition(task, target, reason);
  if (errors.length) fail(JSON.stringify({ task: id, errors }), EXIT.TRANSITION);
  const from = task.status;
  task.status = target;
  task.next_action = target === 'done' ? 'learn' : target;
  await saveTask(task);
  await appendEvent(id, { event: 'status_changed', actor: 'cg-cli', from, to: target, reason: reason || '' });
  console.log(JSON.stringify({ ok: true, task: id, from, to: target }));
}

async function evidence(id, args) {
  if (args[0] !== 'add') fail('evidence subcommand must be add', EXIT.ARGS);
  const task = await loadTask(id);
  const kind = required(args, '--kind');
  const acceptance = required(args, '--acceptance');
  const rawResult = required(args, '--result');
  const result = rawResult === 'failed' ? 'fail' : rawResult;
  const file = value(args, '--path');
  const command = value(args, '--command');
  const kinds = new Set(['test', 'command', 'screenshot', 'measurement', 'review', 'manual', 'file']);
  const results = new Set(['pass', 'verified', 'fail', 'failed', 'skipped', 'unavailable']);
  if (!kinds.has(kind)) fail(`invalid evidence kind: ${kind}`, EXIT.EVIDENCE);
  if (!results.has(result)) fail(`invalid evidence result: ${result}`, EXIT.EVIDENCE);
  if (!task.acceptance.some((item) => item.id === acceptance)) fail(`unknown acceptance: ${acceptance}`, EXIT.EVIDENCE);
  if (!file && !command) fail('--path or --command required', EXIT.ARGS);
  if (file) {
    try { await fs.access(file); } catch { fail(`evidence path not found: ${file}`, EXIT.EVIDENCE); }
  }
  const item = { id: `E-${Date.now()}`, kind, acceptance, result, ...(file ? { path: file } : { command }), recorded_at: new Date().toISOString() };
  task.evidence.push(item);
  await saveTask(task);
  await appendEvent(id, { event: 'evidence_recorded', actor: 'cg-cli', evidence: item });
  console.log(JSON.stringify({ ok: true, task: id, evidence: item.id }));
}

async function show(id) {
  const task = await loadTask(id);
  const accepted = new Set(task.evidence.filter((e) => ['pass', 'verified'].includes(e.result)).map((e) => e.acceptance));
  const missing = task.acceptance.filter((a) => a.id && !accepted.has(a.id)).map((a) => a.id);
  console.log(JSON.stringify({ task: id, type: task.type, title: task.title, status: task.status, acceptance: { total: task.acceptance.length, verified: accepted.size, missing }, risks: task.risks, next_action: task.next_action }, null, 2));
}

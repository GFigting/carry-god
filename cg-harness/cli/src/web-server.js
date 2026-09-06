import http from 'node:http';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { appendEvent, createTask, listTasks, loadEvents, loadTask, saveTask, taskExists } from './task-store.js';
import { classifyRequest, makeTaskId, titleFromRequest } from './intake.js';
import { initializeProject, loadProjectConfig } from './project-store.js';
import { validateTransition } from './validators.js';

const htmlPath = fileURLToPath(new URL('../../web/index.html', import.meta.url));

async function json(response, status, body) {
  response.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', 'Access-Control-Allow-Origin': '*' });
  response.end(JSON.stringify(body));
}

async function body(request) {
  let data = ''; for await (const chunk of request) data += chunk;
  try { return data ? JSON.parse(data) : {}; } catch { return null; }
}

export function startWebServer({ port = 3210, host = '127.0.0.1' } = {}) {
  const server = http.createServer(async (request, response) => {
    try {
      const url = new URL(request.url, `http://${host}:${port}`);
      if (request.method === 'GET' && url.pathname === '/') {
        const html = await fs.readFile(htmlPath, 'utf8'); response.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' }); response.end(html); return;
      }
      if (request.method === 'GET' && url.pathname === '/api/project') { await json(response, 200, { project: await loadProjectConfig() }); return; }
      if (request.method === 'POST' && url.pathname === '/api/project/init') { const input = await body(request); const config = await initializeProject(input?.path || process.cwd()); await json(response, 201, config); return; }
      if (request.method === 'POST' && url.pathname === '/api/intake') {
        const input = await body(request); if (!input?.text?.trim()) { await json(response, 400, { error: 'text required' }); return; }
        const classification = classifyRequest(input.text); const id = input.id || makeTaskId(await listTasks());
        const task = await createTask({ id, type: classification.type, title: titleFromRequest(input.text) });
        task.source = 'web'; task.intent = input.text.trim(); task.confidence = classification.confidence; task.open_questions = classification.open_questions;
        task.intake = { matched_types: classification.matched_types, received_at: new Date().toISOString() }; await saveTask(task);
        await appendEvent(id, { event: 'intake_classified', actor: 'cg-web', type: task.type, confidence: task.confidence }); await json(response, 201, task); return;
      }
      if (request.method === 'POST' && url.pathname === '/api/tasks') {
        const input = await body(request); if (!input?.id || !input?.title || !input?.type) { await json(response, 400, { error: 'id, title, and type required' }); return; }
        const task = await createTask(input); await json(response, 201, task); return;
      }
      if (request.method === 'GET' && url.pathname === '/api/tasks') {
        const tasks = await Promise.all((await listTasks()).map(async (id) => { const task = await loadTask(id); return { id: task.id, type: task.type, title: task.title, status: task.status, next_action: task.next_action, updated_at: task.updated_at }; }));
        await json(response, 200, { tasks }); return;
      }
      const match = url.pathname.match(/^\/api\/tasks\/([^/]+)(?:\/(events|transition|step|update|acceptance|evidence|learn|plan|subtask))?$/);
      if (!match) { await json(response, 404, { error: 'not found' }); return; }
      const id = decodeURIComponent(match[1]); const action = match[2]; const task = await loadTask(id);
      if (request.method === 'GET' && !action) { await json(response, 200, task); return; }
      if (request.method === 'GET' && action === 'events') { await json(response, 200, { events: await loadEvents(id) }); return; }
      if (request.method !== 'POST') { await json(response, 405, { error: 'method not allowed' }); return; }
      const input = await body(request); if (!input) { await json(response, 400, { error: 'invalid JSON' }); return; }
      if (action === 'transition') {
        const errors = validateTransition(task, input.to, input.reason); if (errors.length) { await json(response, 422, { errors }); return; }
        const from = task.status; task.status = input.to; task.next_action = input.to === 'done' ? 'learn' : input.to; await saveTask(task);
        await appendEvent(id, { event: 'status_changed', actor: 'cg-web', from, to: input.to, reason: input.reason || '' }); await json(response, 200, { ok: true, task: id, from, to: input.to }); return;
      }
      if (action === 'step') {
        const item = (task.plan_steps || []).find((step) => step.id === input.id); if (!item) { await json(response, 404, { error: 'plan step not found' }); return; }
        if (input.action === 'start') { item.status = 'in_progress'; item.started_at ||= new Date().toISOString(); }
        else if (input.action === 'done' && item.status === 'in_progress') { item.status = 'done'; item.completed_at = new Date().toISOString(); }
        else { await json(response, 422, { error: 'invalid step action or state' }); return; }
        await saveTask(task); await appendEvent(id, { event: 'plan_step_updated', actor: 'cg-web', step: item, action: input.action }); await json(response, 200, { ok: true, step: item }); return;
      }
      if (action === 'plan') {
        const steps = Array.isArray(input.steps) ? input.steps.map((text) => String(text).trim()).filter(Boolean) : [];
        if (!steps.length) { await json(response, 400, { error: 'steps required' }); return; }
        const existing = Array.isArray(task.plan_steps) ? task.plan_steps : [];
        const start = existing.length;
        const added = steps.map((text, index) => ({ id: `P${start + index + 1}`, text, status: 'pending' }));
        task.plan_steps = existing.concat(added);
        if (input.summary?.trim()) task.plan_summary = input.summary.trim();
        await saveTask(task); await appendEvent(id, { event: 'plan_updated', actor: 'cg-web', steps: added }); await json(response, 200, task); return;
      }
      if (action === 'subtask') {
        if (!input.id || !input.title) { await json(response, 400, { error: 'id and title required' }); return; }
        if (await taskExists(input.id)) { await json(response, 409, { error: `task already exists: ${input.id}` }); return; }
        const child = await createTask({ id: input.id, type: input.type || task.type, title: input.title });
        child.parent_task = id; await saveTask(child);
        task.subtasks ||= []; task.subtasks.push(input.id); await saveTask(task);
        await appendEvent(id, { event: 'subtask_added', actor: 'cg-web', subtask: input.id }); await json(response, 201, { parent: id, subtask: child }); return;
      }
      if (action === 'update') {
        for (const field of ['intent', 'owner', 'goal', 'project', 'blocker', 'unblock_condition']) if (input[field] !== undefined) task[field] = input[field];
        for (const [field, value] of Object.entries({ include: input.include, exclude: input.exclude, preserve: input.preserve, risk: input.risk, output: input.output, finding: input.finding, dependency: input.dependency })) if (value) {
          const target = field === 'include' || field === 'exclude' ? task.scope[field] : field === 'risk' ? task.risks : field === 'output' ? task.outputs : field === 'finding' ? task.findings : task.dependencies;
          for (const item of (Array.isArray(value) ? value : [value])) if (item && !target.includes(item)) target.push(item);
        }
        if (input.risk_declared) task.residual_risk_declared = true; await saveTask(task); await appendEvent(id, { event: 'task_updated', actor: 'cg-web' }); await json(response, 200, task); return;
      }
      if (action === 'acceptance') { if (!input.id || !input.text) { await json(response, 400, { error: 'id and text required' }); return; } task.acceptance.push({ id: input.id, text: input.text }); await saveTask(task); await appendEvent(id, { event: 'acceptance_added', actor: 'cg-web', acceptance: input }); await json(response, 200, task); return; }
      if (action === 'evidence') { if (!input.acceptance || !input.kind || !input.result || !input.source) { await json(response, 400, { error: 'acceptance, kind, result, and source required' }); return; } if (!task.acceptance.some((item) => item.id === input.acceptance)) { await json(response, 422, { error: 'unknown acceptance' }); return; } const item = { id: `E-${Date.now()}`, acceptance: input.acceptance, kind: input.kind, result: input.result, command: input.source, recorded_at: new Date().toISOString() }; task.evidence.push(item); await saveTask(task); await appendEvent(id, { event: 'evidence_recorded', actor: 'cg-web', evidence: item }); await json(response, 200, task); return; }
      if (action === 'learn') { if (!input.text) { await json(response, 400, { error: 'text required' }); return; } task.learnings ||= []; task.learnings.push({ text: input.text, recorded_at: new Date().toISOString() }); await saveTask(task); await appendEvent(id, { event: 'learning_recorded', actor: 'cg-web' }); await json(response, 200, task); return; }
      await json(response, 404, { error: 'not found' });
    } catch (error) { if (!response.headersSent) await json(response, error.code === 'ENOENT' ? 404 : 500, { error: error.message }); else response.end(); }
  });
  server.listen(port, host);
  return server;
}

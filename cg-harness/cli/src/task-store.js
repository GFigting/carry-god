import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { appendJsonLine, readJson, readJsonLines, writeJsonAtomic } from './json-io.js';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = process.env.CG_HARNESS_ROOT || path.resolve(here, '..', '..');
export const tasksRoot = path.join(root, 'tasks');

export function taskDir(id) { return path.join(tasksRoot, id); }
export function taskFile(id) { return path.join(taskDir(id), 'task.json'); }
export function eventsFile(id) { return path.join(taskDir(id), 'events.jsonl'); }

export async function taskExists(id) {
  try { await fs.access(taskFile(id)); return true; } catch { return false; }
}

export async function listTasks() {
  try {
    const entries = await fs.readdir(tasksRoot, { withFileTypes: true });
    return entries.filter((entry) => entry.isDirectory()).map((entry) => entry.name).sort();
  } catch { return []; }
}

export async function createTask({ id, type, title }) {
  if (await taskExists(id)) throw new Error(`task already exists: ${id}`);
  const now = new Date().toISOString();
  const task = {
    id, type, title, intent: title, status: 'draft', source: 'cli', confidence: 'high',
    project: '', goal: '', open_questions: [], decisions: [], artifacts: [],
    context_package: '', parent_task: null, subtasks: [],
    dependencies: [],
    scope: { include: [], exclude: [] }, acceptance: [], preserve: [],
    evidence: [], capabilities: [], risks: [], outputs: [], findings: [],
    owner: '', blocker: '', unblock_condition: '', residual_risk_declared: false,
    next_action: 'clarify',
    created_at: now, updated_at: now
  };
  await fs.mkdir(path.join(taskDir(id), 'evidence'), { recursive: true });
  await fs.mkdir(path.join(taskDir(id), 'artifacts'), { recursive: true });
  await writeJsonAtomic(taskFile(id), task);
  await fs.writeFile(eventsFile(id), '', 'utf8');
  await appendEvent(id, { event: 'task_created', actor: 'cg-cli', reason: 'Task initialized' });
  return task;
}

export async function loadTask(id) { return readJson(taskFile(id)); }
export async function loadEvents(id) { return readJsonLines(eventsFile(id)); }
export async function saveTask(task) {
  task.updated_at = new Date().toISOString();
  await writeJsonAtomic(taskFile(task.id), task);
  return task;
}
export async function appendEvent(id, data) {
  await appendJsonLine(eventsFile(id), {
    event_id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
    task: id, timestamp: new Date().toISOString(), ...data
  });
}

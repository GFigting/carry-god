import assert from 'node:assert/strict';
import { mkdtemp, rm, writeFile, mkdir } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import test from 'node:test';

const exec = promisify(execFile);
const script = path.resolve('scripts/check-task.mjs');

async function run(file) {
  try {
    const result = await exec(process.execPath, [script, file]);
    return { code: 0, output: `${result.stdout}${result.stderr}` };
  } catch (error) {
    return { code: error.code, output: `${error.stdout || ''}${error.stderr || ''}` };
  }
}

test('接受待处理的初始化任务', async () => {
  const dir = await mkdtemp(path.join(os.tmpdir(), 'cg-work-task-'));
  const taskDir = path.join(dir, '2026-09-10-project-initialization');
  await mkdir(taskDir);
  const file = path.join(taskDir, 'task.yaml');
  await writeFile(file, 'id: 2026-09-10-project-initialization\nstatus: pending\ngoal: Initialize\nworkflow: framework:project-initialization\ncreated_at: 2026-09-10\ndocumentation:\n  impact: none\n  not_needed_reason: Initialization only\nnext_action: Wait\n');
  const result = await run(file);
  assert.equal(result.code, 0, result.output);
  await rm(dir, { recursive: true, force: true });
});

test('完成任务前必须有审查证据', async () => {
  const dir = await mkdtemp(path.join(os.tmpdir(), 'cg-work-task-'));
  const taskDir = path.join(dir, '2026-09-10-project-initialization');
  await mkdir(taskDir);
  const file = path.join(taskDir, 'task.yaml');
  await writeFile(file, 'id: 2026-09-10-project-initialization\nstatus: done\ngoal: Initialize\nworkflow: framework:project-initialization\ncreated_at: 2026-09-10\ndocumentation:\n  impact: none\n  not_needed_reason: Initialization only\nnext_action: None\n');
  const result = await run(file);
  assert.notEqual(result.code, 0);
  assert.match(result.output, /必须填写 review_reference/);
  await rm(dir, { recursive: true, force: true });
});

test('拒绝无效的状态转换', async () => {
  const dir = await mkdtemp(path.join(os.tmpdir(), 'cg-work-task-'));
  const taskDir = path.join(dir, '2026-09-10-project-initialization');
  await mkdir(taskDir);
  const file = path.join(taskDir, 'task.yaml');
  await writeFile(file, 'id: 2026-09-10-project-initialization\nstatus: done\ngoal: Initialize\nworkflow: framework:project-initialization\ncreated_at: 2026-09-10\nstatus_history: [pending, done]\ndocumentation:\n  impact: none\n  not_needed_reason: Initialization only\nnext_action: None\n');
  const result = await run(file);
  assert.notEqual(result.code, 0);
  assert.match(result.output, /状态转换无效/);
  await rm(dir, { recursive: true, force: true });
});

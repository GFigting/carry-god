import assert from 'node:assert/strict';
import { mkdtemp, mkdir, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { collectTaskTimeErrors, timeFieldProblem } from '../scripts/task-time-fields.mjs';

async function writeTask(root, project, task, content, archived = false) {
  const dir = path.join(root, 'local', 'projects', project, 'tasks', archived ? 'archive' : '', task);
  await mkdir(dir, { recursive: true });
  await writeFile(path.join(dir, 'task.yaml'), content);
}

async function withRoot(run) {
  const root = await mkdtemp(path.join(os.tmpdir(), 'cg-work-time-'));
  try { await run(root); } finally { await rm(root, { recursive: true, force: true }); }
}

test('拒绝 created_at 占位、时区后缀与无效格式', () => {
  assert.match(timeFieldProblem('2026-10-20T00:00:00', { allowDate: true }), /T00:00:00 占位/);
  assert.match(timeFieldProblem('2026-10-20T10:00:00+08:00', { allowDate: true }), /不带时区/);
  assert.match(timeFieldProblem('2026-10-20T10:00:00Z', { allowDate: true }), /不带时区/);
  assert.match(timeFieldProblem('10/20/2026', { allowDate: true }), /格式无效/);
  assert.equal(timeFieldProblem('2026-10-20', { allowDate: true }), null);
  assert.equal(timeFieldProblem('2026-10-20T10:00:00', { allowDate: true }), null);
});

test('status_history.at 拒绝占位与时区，接受本地时间与 null', () => {
  assert.match(timeFieldProblem('2026-10-20T00:00:00'), /T00:00:00 占位/);
  assert.match(timeFieldProblem('2026-10-20'), /纯日期仅允许用于 created_at/);
  assert.match(timeFieldProblem('2026-10-20T10:00:00Z'), /不带时区/);
  assert.equal(timeFieldProblem('2026-10-20T10:00:00', { allowNull: true }), null);
  assert.equal(timeFieldProblem(null, { allowNull: true }), null);
  assert.match(timeFieldProblem(null), /不得为空/);
});

test('collectTaskTimeErrors 报告活跃任务的占位与时区问题', async () => {
  await withRoot(async (root) => {
    await writeTask(root, 'demo', 'bad-created', 'id: bad-created\ncreated_at: 2026-10-20T00:00:00\n');
    await writeTask(root, 'demo', 'bad-zone', 'id: bad-zone\ncreated_at: 2026-10-20T10:00:00+08:00\nstatus_history:\n  - status: pending\n    at: 2026-10-20T10:00:00Z\n    reason: 任务创建\n');
    await writeTask(root, 'demo', 'bad-at-date', 'id: bad-at-date\nstatus_history:\n  - status: pending\n    at: 2026-10-20\n    reason: 任务创建\n');
    await writeTask(root, 'demo', 'good', 'id: good\ncreated_at: 2026-10-20\nstatus_history:\n  - status: pending\n    at: 2026-10-20T10:00:00\n    reason: 任务创建\n  - status: in_progress\n    at: null\n    reason: 历史不可考\n');
    await writeTask(root, 'demo', 'archived-task', 'id: archived-task\ncreated_at: 2026-10-20T00:00:00\n', true);

    const errors = await collectTaskTimeErrors(root);
    assert.equal(errors.length, 4, errors.join('\n'));
    assert.ok(errors.some((line) => line.includes('bad-created') && line.includes('created_at')));
    assert.ok(errors.some((line) => line.includes('bad-zone') && line.includes('created_at')));
    assert.ok(errors.some((line) => line.includes('bad-zone') && line.includes('status_history.at')));
    assert.ok(errors.some((line) => line.includes('bad-at-date') && line.includes('status_history.at')));
    assert.ok(!errors.some((line) => line.includes('good')));
    assert.ok(!errors.some((line) => line.includes('archived-task')));
  });
});

test('解析失败或缺失 task.yaml 的任务不阻塞时间校验', async () => {
  await withRoot(async (root) => {
    await writeTask(root, 'demo', 'broken', 'id: [broken\n');
    await writeTask(root, 'demo', 'ok', 'id: ok\ncreated_at: 2026-10-20T10:00:00\n');
    const errors = await collectTaskTimeErrors(root);
    assert.deepEqual(errors, []);
  });
});

import assert from 'node:assert/strict';
import { mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import test from 'node:test';
import yaml from 'js-yaml';

const exec = promisify(execFile);
const script = path.resolve('scripts/acceptance-queue.mjs');
const projectId = 'acceptance-queue-test';

async function run(args) {
  try {
    const result = await exec(process.execPath, [script, ...args]);
    return { code: 0, output: `${result.stdout}${result.stderr}` };
  } catch (error) {
    return { code: error.code, output: `${error.stdout || ''}${error.stderr || ''}` };
  }
}

async function fixture(id, body) {
  const dir = path.resolve('local/projects', projectId, 'tasks', id);
  await mkdir(dir, { recursive: true });
  await writeFile(path.join(dir, 'task.yaml'), body);
  return { dir, file: path.join(dir, 'task.yaml') };
}

const compactReview = (id) => `id: ${id}\nstatus: review\ngoal: Acceptance queue fixture\nworkflow: framework:framework-optimization\ncreated_at: 2026-10-02\ndelivery_path: compact\nartifacts:\n  primary: ./plan.md\ndocumentation:\n  impact: none\n  reason: Fixture only\nnext_action:\n  required: true\n  action: accept-result\n  message: "请验收该夹具任务"\nstatus_history:\n  - status: pending\n    at: null\n    reason: 任务创建\n  - status: in_progress\n    at: null\n    reason: 开始实施\n  - status: review\n    at: null\n    reason: 完成实现\n`;

test('清单列出等待用户操作的任务', async () => {
  const { dir } = await fixture('2026-10-02-queue-listed', compactReview('2026-10-02-queue-listed'));
  try {
    const result = await run([]);
    assert.equal(result.code, 0, result.output);
    assert.match(result.output, /2026-10-02-queue-listed/);
    assert.match(result.output, /等待用户/);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test('清单跳过已归档任务', async () => {
  const id = '2026-10-02-queue-archived';
  const { dir } = await fixture(id, `${compactReview(id)}archived: true\n`);
  try {
    const result = await run([]);
    assert.equal(result.code, 0, result.output);
    assert.doesNotMatch(result.output, new RegExp(id));
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test('批量验收把 review 记录置为 done 并保留状态历史', async () => {
  const id = '2026-10-02-queue-accepted';
  const { dir, file } = await fixture(id, compactReview(id));
  await writeFile(path.join(dir, 'plan.md'), '# fixture\n');
  try {
    const result = await run(['--accept', id, '--note', '清单批量验收']);
    assert.equal(result.code, 0, result.output);
    assert.match(result.output, /已验收/);
    const text = await readFile(file, 'utf8');
    const task = yaml.load(text);
    assert.equal(task.status, 'done');
    assert.equal(task.status_history.at(-1).status, 'done');
    assert.match(task.status_history.at(-1).reason, /用户已验收：清单批量验收/);
    assert.equal(task.next_action.required, false);
    assert.match(task.next_action.message, /用户已验收：清单批量验收/);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

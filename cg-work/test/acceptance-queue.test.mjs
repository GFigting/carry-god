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

const compactReview = (id) => `id: ${id}\nstatus: review\ngoal: Acceptance queue fixture\nworkflow: framework:framework-optimization\ncreated_at: 2026-10-02\nartifact_profile: compact\nartifacts:\n  primary: ./plan.md\ndocumentation:\n  impact: none\n  not_needed_reason: Fixture only\ninteraction_protocol: v1\nnext_action: 等待验收\nnext_user_action:\n  required: true\n  action: accept-result\n  message: 请验收该夹具任务\nstatus_history:\n  - pending\n  - in_progress\n  - review\n`;

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
    assert.equal(task.status_history.at(-1), 'done');
    assert.equal(task.next_user_action.required, false);
    assert.match(task.next_user_action.message, /用户已验收：清单批量验收/);

    const checked = await exec(process.execPath, [path.resolve('scripts/check-task.mjs'), file])
      .then(() => 0, (error) => error.code);
    assert.equal(checked, 0, '验收后记录必须仍然通过任务校验');
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test('证据不全的记录拒绝标记完成', async () => {
  const id = '2026-10-02-queue-blocked';
  const body = `id: ${id}\nstatus: review\ngoal: Missing evidence fixture\nworkflow: framework:feature-development\ncreated_at: 2026-10-02\ndocumentation:\n  impact: none\n  not_needed_reason: Fixture only\nnext_action: 等待验收\n`;
  const { dir, file } = await fixture(id, body);
  try {
    const result = await run(['--accept', id]);
    assert.notEqual(result.code, 0);
    assert.match(result.output, /证据不全/);
    const text = await readFile(file, 'utf8');
    assert.match(text, /^status: review$/m, '拒绝时不得改动记录');
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

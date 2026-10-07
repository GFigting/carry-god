import assert from 'node:assert/strict';
import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import yaml from 'js-yaml';
import { migrateTaskMetadata } from '../scripts/migrate-task-metadata.mjs';

async function fixture() {
  const root = await mkdtemp(path.join(os.tmpdir(), 'cg-work-metadata-'));
  const dir = path.join(root, 'local', 'projects', 'fixture', 'tasks', '2026-10-01-metadata');
  await mkdir(dir, { recursive: true });
  const file = path.join(dir, 'task.yaml');
  await writeFile(file, [
    'id: 2026-10-01-metadata',
    'status: review',
    'goal: Metadata fixture',
    'workflow: framework:framework-optimization',
    'created_at: 2026-10-01',
    'documentation:',
    '  impact: update',
    '  targets:',
    '    - README.md',
    'next_action: Review',
    'status_history:',
    '  - pending',
    '  - in_progress',
    '  - review',
    '',
  ].join('\n'));
  return { root, file };
}

test('元数据迁移默认只预览', async () => {
  const { root, file } = await fixture();
  try {
    const result = await migrateTaskMetadata({ root, project: 'fixture', documentation: true, statusHistory: true });
    assert.equal(result.applied, false);
    assert.equal(result.changed.length, 1);
    const text = await readFile(file, 'utf8');
    assert.match(text, /targets:/);
    assert.match(text, /- pending/);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test('元数据迁移 apply 统一字段并保留未知历史信息', async () => {
  const { root, file } = await fixture();
  try {
    const result = await migrateTaskMetadata({ root, project: 'fixture', documentation: true, statusHistory: true, apply: true });
    assert.equal(result.changed.length, 1);
    const task = yaml.load(await readFile(file, 'utf8'));
    assert.deepEqual(task.documentation.files, ['README.md']);
    assert.equal(task.documentation.targets, undefined);
    assert.equal(task.status_history[0].status, 'pending');
    assert.equal(task.status_history[0].at, null);
    assert.match(task.status_history[0].reason, /未保存时间与原因/);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test('元数据迁移跳过已归档任务', async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), 'cg-work-metadata-archived-'));
  const dir = path.join(root, 'local', 'projects', 'fixture', 'tasks', '2026-10-01-archived');
  await mkdir(dir, { recursive: true });
  const file = path.join(dir, 'task.yaml');
  await writeFile(file, 'id: 2026-10-01-archived\nstatus: review\narchived: true\ndocumentation:\n  impact: update\n  targets:\n    - README.md\nstatus_history:\n  - review\n');
  try {
    const result = await migrateTaskMetadata({ root, project: 'fixture', documentation: true, statusHistory: true, apply: true });
    assert.equal(result.changed.length, 0);
    const text = await readFile(file, 'utf8');
    assert.match(text, /targets:/);
    assert.match(text, /- review/);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

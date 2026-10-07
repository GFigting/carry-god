import assert from 'node:assert/strict';
import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import yaml from 'js-yaml';
import { archiveTasks } from '../scripts/archive-tasks.mjs';

async function fixture(root, id, status = 'review') {
  const dir = path.join(root, 'local', 'projects', 'fixture', 'tasks', id);
  await mkdir(dir, { recursive: true });
  const file = path.join(dir, 'task.yaml');
  await writeFile(file, `id: ${id}\nstatus: ${status}\ngoal: Archive fixture\nworkflow: framework:framework-optimization\ncreated_at: 2026-10-01\nnext_action: Review\n`);
  return file;
}

test('归档默认只预览，不写入任务文件', async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), 'cg-work-archive-dry-run-'));
  const id = '2026-10-01-archive-dry-run';
  const file = await fixture(root, id);
  try {
    const result = await archiveTasks({ root, before: '2026-10-07' });
    assert.equal(result.applied, false);
    assert.equal(result.candidates.length, 1);
    assert.equal((await readFile(file, 'utf8')).includes('archived: true'), false);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test('归档 apply 移入 archive 文件夹并保留原状态和元数据', async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), 'cg-work-archive-apply-'));
  const id = '2026-10-01-archive-apply';
  const file = await fixture(root, id);
  try {
    const result = await archiveTasks({
      root,
      before: '2026-10-07',
      reason: '测试归档',
      apply: true,
      now: new Date('2026-10-07T08:00:00.000Z'),
    });
    assert.equal(result.candidates.length, 1);
    const archivedFile = path.join(root, 'local', 'projects', 'fixture', 'tasks', 'archive', id, 'task.yaml');
    const task = yaml.load(await readFile(archivedFile, 'utf8'));
    assert.equal(task.status, 'review');
    assert.equal(task.archived, true);
    assert.equal(task.archived_at, '2026-10-07T08:00:00.000Z');
    assert.equal(task.archive_reason, '测试归档');
    await assert.rejects(() => readFile(file, 'utf8'));
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test('归档按任务 ID 日期排除当天任务和非目标状态', async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), 'cg-work-archive-boundary-'));
  const oldFile = await fixture(root, '2026-10-06-archive-old');
  const todayFile = await fixture(root, '2026-10-07-archive-today');
  const doneFile = await fixture(root, '2026-10-01-archive-done', 'done');
  try {
    const result = await archiveTasks({ root, before: '2026-10-07', apply: true });
    assert.deepEqual(result.candidates.map((item) => item.id), ['2026-10-06-archive-old']);
    const archivedOldFile = path.join(root, 'local', 'projects', 'fixture', 'tasks', 'archive', '2026-10-06-archive-old', 'task.yaml');
    assert.equal(yaml.load(await readFile(archivedOldFile, 'utf8')).archived, true);
    assert.equal(yaml.load(await readFile(todayFile, 'utf8')).archived, undefined);
    assert.equal(yaml.load(await readFile(doneFile, 'utf8')).archived, undefined);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test('归档迁移可将仅被归档任务引用的需求包一并移入 archive', async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), 'cg-work-archive-requirements-'));
  const id = '2026-10-01-archive-with-requirement';
  const file = await fixture(root, id);
  const inbox = path.join(root, 'local', 'projects', 'fixture', 'requirements-inbox');
  await mkdir(inbox, { recursive: true });
  await writeFile(path.join(inbox, 'req.md'), '# Requirement\n');
  await writeFile(file, `id: ${id}\nstatus: review\ngoal: Archive fixture\nworkflow: framework:framework-optimization\ncreated_at: 2026-10-01\nrequirements_reference: ../../requirements-inbox/req.md\nnext_action: Review\n`);
  try {
    await archiveTasks({ root, before: '2026-10-07', includeRequirements: true, apply: true });
    const archivedFile = path.join(root, 'local', 'projects', 'fixture', 'tasks', 'archive', id, 'task.yaml');
    const task = yaml.load(await readFile(archivedFile, 'utf8'));
    assert.equal(task.requirements_reference, '../../../requirements-inbox/archive/req.md');
    assert.equal((await readFile(path.join(root, 'local', 'projects', 'fixture', 'requirements-inbox', 'archive', 'req.md'), 'utf8')).trim(), '# Requirement');
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test('已归档任务可单独迁移到 archive 且不重复改写元数据', async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), 'cg-work-archive-relocate-'));
  const id = '2026-10-01-already-archived';
  const file = await fixture(root, id);
  await writeFile(file, `id: ${id}\nstatus: done\narchived: true\narchived_at: 2026-10-07T08:00:00.000Z\narchive_reason: 原因\ngoal: Archive fixture\nworkflow: framework:framework-optimization\ncreated_at: 2026-10-01\nnext_action: Review\n`);
  try {
    const result = await archiveTasks({ root, before: '2026-10-07', relocateArchived: true, apply: true });
    assert.equal(result.candidates.length, 1);
    const archivedFile = path.join(root, 'local', 'projects', 'fixture', 'tasks', 'archive', id, 'task.yaml');
    const task = yaml.load(await readFile(archivedFile, 'utf8'));
    assert.equal(task.archive_reason, '原因');
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

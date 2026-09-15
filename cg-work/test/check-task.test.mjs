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

test('学习协议任务进入审查前必须有学习记录', async () => {
  const dir = await mkdtemp(path.join(os.tmpdir(), 'cg-work-task-'));
  const taskDir = path.join(dir, '2026-09-10-project-initialization');
  await mkdir(taskDir);
  await writeFile(path.join(taskDir, 'review.md'), '# Review\n');
  await writeFile(path.join(taskDir, 'verification.md'), '# Verification\n');
  const file = path.join(taskDir, 'task.yaml');
  await writeFile(file, 'id: 2026-09-10-project-initialization\nstatus: review\ngoal: Initialize\nworkflow: framework:project-initialization\ncreated_at: 2026-09-10\nlearning_protocol: v1\ndocumentation:\n  impact: none\n  not_needed_reason: Initialization only\nnext_action: Review\nreview_reference: review.md\nverification_reference: verification.md\n');
  const result = await run(file);
  assert.notEqual(result.code, 0);
  assert.match(result.output, /必须填写 learning_reference/);
  await rm(dir, { recursive: true, force: true });
});

test('学习协议任务接受存在的学习记录', async () => {
  const dir = await mkdtemp(path.join(os.tmpdir(), 'cg-work-task-'));
  const taskDir = path.join(dir, '2026-09-10-project-initialization');
  await mkdir(taskDir);
  await writeFile(path.join(taskDir, 'review.md'), '# Review\n');
  await writeFile(path.join(taskDir, 'verification.md'), '# Verification\n');
  await writeFile(path.join(taskDir, 'learning.md'), '# Learning\n');
  const file = path.join(taskDir, 'task.yaml');
  await writeFile(file, 'id: 2026-09-10-project-initialization\nstatus: review\ngoal: Initialize\nworkflow: framework:project-initialization\ncreated_at: 2026-09-10\nlearning_protocol: v1\ndocumentation:\n  impact: none\n  not_needed_reason: Initialization only\nnext_action: Review\nreview_reference: review.md\nverification_reference: verification.md\nlearning_reference: learning.md\n');
  const result = await run(file);
  assert.equal(result.code, 0, result.output);
  await rm(dir, { recursive: true, force: true });
});

test('引用原型的审查任务缺少处置记录时被拒绝', async () => {
  const dir = await mkdtemp(path.join(os.tmpdir(), 'cg-work-task-'));
  const taskDir = path.join(dir, '2026-09-10-project-initialization');
  await mkdir(taskDir);
  await writeFile(path.join(taskDir, 'review.md'), '# Review\n');
  await writeFile(path.join(taskDir, 'verification.md'), '# Verification\n');
  await writeFile(path.join(taskDir, 'prototype.html'), '<html></html>\n');
  const file = path.join(taskDir, 'task.yaml');
  await writeFile(file, 'id: 2026-09-10-project-initialization\nstatus: review\ngoal: Initialize\nworkflow: framework:project-initialization\ncreated_at: 2026-09-10\ndocumentation:\n  impact: none\n  not_needed_reason: Initialization only\nnext_action: Review\nprototype_reference: prototype.html\nreview_reference: review.md\nverification_reference: verification.md\n');
  const result = await run(file);
  assert.notEqual(result.code, 0);
  assert.match(result.output, /必须填写 prototype_disposition_reference/);
  await rm(dir, { recursive: true, force: true });
});

test('引用原型的审查任务接受存在的处置记录', async () => {
  const dir = await mkdtemp(path.join(os.tmpdir(), 'cg-work-task-'));
  const taskDir = path.join(dir, '2026-09-10-project-initialization');
  await mkdir(taskDir);
  await writeFile(path.join(taskDir, 'review.md'), '# Review\n');
  await writeFile(path.join(taskDir, 'verification.md'), '# Verification\n');
  await writeFile(path.join(taskDir, 'prototype.html'), '<html></html>\n');
  await writeFile(path.join(taskDir, 'prototype-disposition.md'), '# 原型采纳记录\n\n## 采纳结论\n\n全部采纳。\n\n## 实现映射\n\n- `prototype.html` → `src/page.ts`\n\n## 验证映射\n\n- `test/page.test.ts`\n\n## 未采纳项\n\n无。\n');
  const file = path.join(taskDir, 'task.yaml');
  await writeFile(file, 'id: 2026-09-10-project-initialization\nstatus: review\ngoal: Initialize\nworkflow: framework:project-initialization\ncreated_at: 2026-09-10\ndocumentation:\n  impact: none\n  not_needed_reason: Initialization only\nnext_action: Review\nprototype_reference: prototype.html\nprototype_disposition_reference: prototype-disposition.md\nreview_reference: review.md\nverification_reference: verification.md\n');
  const result = await run(file);
  assert.equal(result.code, 0, result.output);
  await rm(dir, { recursive: true, force: true });
});

test('引用原型的处置记录缺少映射章节时被拒绝', async () => {
  const dir = await mkdtemp(path.join(os.tmpdir(), 'cg-work-task-'));
  const taskDir = path.join(dir, '2026-09-10-project-initialization');
  await mkdir(taskDir);
  await writeFile(path.join(taskDir, 'review.md'), '# Review\n');
  await writeFile(path.join(taskDir, 'verification.md'), '# Verification\n');
  await writeFile(path.join(taskDir, 'prototype.html'), '<html></html>\n');
  await writeFile(path.join(taskDir, 'prototype-disposition.md'), '# 原型采纳记录\n\n## 采纳结论\n\n部分采纳。\n');
  const file = path.join(taskDir, 'task.yaml');
  await writeFile(file, 'id: 2026-09-10-project-initialization\nstatus: review\ngoal: Initialize\nworkflow: framework:project-initialization\ncreated_at: 2026-09-10\ndocumentation:\n  impact: none\n  not_needed_reason: Initialization only\nnext_action: Review\nprototype_reference: prototype.html\nprototype_disposition_reference: prototype-disposition.md\nreview_reference: review.md\nverification_reference: verification.md\n');
  const result = await run(file);
  assert.notEqual(result.code, 0);
  assert.match(result.output, /缺少“实现映射”章节/);
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

test('路线图任务完成前缺少关闭记录时被拒绝', async () => {
  const dir = await mkdtemp(path.join(os.tmpdir(), 'cg-work-task-'));
  const taskDir = path.join(dir, '2026-09-10-project-initialization');
  await mkdir(taskDir);
  for (const name of ['review.md', 'verification.md', 'handoff.md']) await writeFile(path.join(taskDir, name), `# ${name}\n`);
  const file = path.join(taskDir, 'task.yaml');
  await writeFile(file, 'id: 2026-09-10-project-initialization\nstatus: done\ngoal: Initialize\nworkflow: framework:project-initialization\ncreated_at: 2026-09-10\ndocumentation:\n  impact: none\n  not_needed_reason: Initialization only\nnext_action: None\nroadmap_reference: ../roadmaps/example/roadmap.yaml\nreview_reference: review.md\nverification_reference: verification.md\nhandoff_reference: handoff.md\n');
  const result = await run(file);
  assert.notEqual(result.code, 0);
  assert.match(result.output, /必须填写 closure_reference/);
  await rm(dir, { recursive: true, force: true });
});

test('拒绝指向自身的任务依赖', async () => {
  const dir = await mkdtemp(path.join(os.tmpdir(), 'cg-work-task-'));
  const taskDir = path.join(dir, '2026-09-10-project-initialization');
  await mkdir(taskDir);
  const file = path.join(taskDir, 'task.yaml');
  await writeFile(file, 'id: 2026-09-10-project-initialization\nstatus: pending\ngoal: Initialize\nworkflow: framework:project-initialization\ncreated_at: 2026-09-10\ndocumentation:\n  impact: none\n  not_needed_reason: Initialization only\nnext_action: Wait\ndepends_on:\n  - task.yaml\n');
  const result = await run(file);
  assert.notEqual(result.code, 0);
  assert.match(result.output, /不能指向任务自身/);
  await rm(dir, { recursive: true, force: true });
});

test('接受带路线图、依赖和关闭记录的已完成任务', async () => {
  const dir = await mkdtemp(path.join(os.tmpdir(), 'cg-work-task-'));
  const taskDir = path.join(dir, '2026-09-10-project-initialization');
  await mkdir(taskDir);
  for (const name of ['review.md', 'verification.md', 'handoff.md', 'roadmap.yaml', 'closure.md', 'parent-task.yaml', 'dependency-task.yaml', 'coverage.md', 'follow-up-task.yaml']) await writeFile(path.join(taskDir, name), `# ${name}\n`);
  const file = path.join(taskDir, 'task.yaml');
  await writeFile(file, 'id: 2026-09-10-project-initialization\nstatus: done\ngoal: Initialize\nworkflow: framework:project-initialization\ncreated_at: 2026-09-10\ndocumentation:\n  impact: none\n  not_needed_reason: Initialization only\nnext_action: None\nroadmap_reference: roadmap.yaml\nclosure_reference: closure.md\nparent_task_reference: parent-task.yaml\ndepends_on:\n  - dependency-task.yaml\nrequirements_coverage:\n  REQ-1: coverage.md\nfollow_up_task_references:\n  - follow-up-task.yaml\nreview_reference: review.md\nverification_reference: verification.md\nhandoff_reference: handoff.md\n');
  const result = await run(file);
  assert.equal(result.code, 0, result.output);
  await rm(dir, { recursive: true, force: true });
});

test('交互协议任务进入审查前缺少用户下一步提醒时被拒绝', async () => {
  const dir = await mkdtemp(path.join(os.tmpdir(), 'cg-work-task-'));
  const taskDir = path.join(dir, '2026-09-10-project-initialization');
  await mkdir(taskDir);
  await writeFile(path.join(taskDir, 'review.md'), '# Review\n');
  await writeFile(path.join(taskDir, 'verification.md'), '# Verification\n');
  const file = path.join(taskDir, 'task.yaml');
  await writeFile(file, 'id: 2026-09-10-project-initialization\nstatus: review\ngoal: Initialize\nworkflow: framework:project-initialization\ncreated_at: 2026-09-10\ninteraction_protocol: v1\ndocumentation:\n  impact: none\n  not_needed_reason: Initialization only\nnext_action: Review\nreview_reference: review.md\nverification_reference: verification.md\n');
  const result = await run(file);
  assert.notEqual(result.code, 0);
  assert.match(result.output, /必须填写 next_user_action/);
  await rm(dir, { recursive: true, force: true });
});

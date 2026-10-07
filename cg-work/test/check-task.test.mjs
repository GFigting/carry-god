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

test('拒绝格式错误的验收摘要和未决事项', async () => {
  const dir = await mkdtemp(path.join(os.tmpdir(), 'cg-work-task-'));
  const taskDir = path.join(dir, '2026-09-24-invalid-task-metadata');
  await mkdir(taskDir);
  const file = path.join(taskDir, 'task.yaml');
  await writeFile(file, 'id: 2026-09-24-invalid-task-metadata\nstatus: pending\ngoal: Reject invalid task metadata\nworkflow: framework:feature-development\ncreated_at: 2026-09-24\ndocumentation:\n  impact: none\n  not_needed_reason: Framework metadata only\nnext_action: Verify\nacceptance_summary: invalid\nopen_decisions:\n  - id: invalid-decision\n    question: Missing blocking flag\n');
  const result = await run(file);
  assert.notEqual(result.code, 0);
  assert.match(result.output, /acceptance_summary|open_decisions/);
  await rm(dir, { recursive: true, force: true });
});

test('接受合法的验收摘要和未决事项', async () => {
  const dir = await mkdtemp(path.join(os.tmpdir(), 'cg-work-task-'));
  const taskDir = path.join(dir, '2026-09-24-valid-task-metadata');
  await mkdir(taskDir);
  const file = path.join(taskDir, 'task.yaml');
  await writeFile(file, 'id: 2026-09-24-valid-task-metadata\nstatus: pending\ngoal: Accept task metadata\nworkflow: framework:feature-development\ncreated_at: 2026-09-24\ndocumentation:\n  impact: none\n  not_needed_reason: Framework metadata only\nnext_action: Verify\nacceptance_summary:\n  - The task has a verifiable acceptance summary\nopen_decisions:\n  - id: confirm-scope\n    question: Confirm the scope before implementation\n    blocking: true\n');
  const result = await run(file);
  assert.equal(result.code, 0, result.output);
  await rm(dir, { recursive: true, force: true });
});

test('范围变化任务必须声明独立任务决策', async () => {
  const dir = await mkdtemp(path.join(os.tmpdir(), 'cg-work-task-'));
  const taskDir = path.join(dir, '2026-09-23-independent-scope');
  await mkdir(taskDir);
  const file = path.join(taskDir, 'task.yaml');
  await writeFile(file, 'id: 2026-09-23-independent-scope\nstatus: pending\ngoal: Split a changed acceptance scope\nworkflow: framework:feature-development\ncreated_at: 2026-09-23\nscope_decision:\n  mode: independent\n  rationale: New acceptance criteria require separate evidence\ndocumentation:\n  impact: none\n  not_needed_reason: Framework metadata only\nnext_action: Start\n');
  const result = await run(file);
  assert.equal(result.code, 0, result.output);
  await rm(dir, { recursive: true, force: true });
});

test('范围延续任务必须指向前置任务并说明差异', async () => {
  const dir = await mkdtemp(path.join(os.tmpdir(), 'cg-work-task-'));
  const taskDir = path.join(dir, '2026-09-23-continuation-scope');
  await mkdir(taskDir);
  await writeFile(path.join(dir, 'parent-task.yaml'), 'id: parent\n');
  const file = path.join(taskDir, 'task.yaml');
  await writeFile(file, 'id: 2026-09-23-continuation-scope\nstatus: pending\ngoal: Continue the same acceptance scope\nworkflow: framework:feature-development\ncreated_at: 2026-09-23\nscope_decision:\n  mode: continuation\n  prior_task_reference: ../parent-task.yaml\ndocumentation:\n  impact: none\n  not_needed_reason: Framework metadata only\nnext_action: Start\n');
  const result = await run(file);
  assert.notEqual(result.code, 0);
  assert.match(result.output, /scope_decision.*rationale|范围决策.*rationale/);
  await rm(dir, { recursive: true, force: true });
});

test('接受显式 standard 执行模式并按标准任务处理', async () => {
  const dir = await mkdtemp(path.join(os.tmpdir(), 'cg-work-task-'));
  const taskDir = path.join(dir, '2026-09-21-explicit-standard');
  await mkdir(taskDir);
  const file = path.join(taskDir, 'task.yaml');
  await writeFile(
    file,
    'id: 2026-09-21-explicit-standard\nstatus: pending\ngoal: Make standard mode explicit\nworkflow: framework:feature-development\nexecution_profile: standard\ncreated_at: 2026-09-21\ndocumentation:\n  impact: none\n  not_needed_reason: Framework metadata only\nnext_action: Verify\n'
  );
  const result = await run(file);
  assert.equal(result.code, 0, result.output);
  await rm(dir, { recursive: true, force: true });
});

test('compact 任务以一个主产物替代分散证据文件', async () => {
  const dir = await mkdtemp(path.join(os.tmpdir(), 'cg-work-task-'));
  const taskDir = path.join(dir, '2026-09-27-compact-artifacts');
  await mkdir(taskDir);
  await writeFile(path.join(taskDir, 'product.md'), '# Product review\n');
  const file = path.join(taskDir, 'task.yaml');
  await writeFile(file, 'id: 2026-09-27-compact-artifacts\nstatus: review\ngoal: Keep one primary artifact\nworkflow: framework:feature-development\nartifact_profile: compact\ncreated_at: 2026-09-27\nlearning_protocol: v1\ndocumentation:\n  impact: none\n  not_needed_reason: Framework metadata only\nnext_action: User acceptance\nartifacts:\n  primary: product.md\ninteraction_protocol: v1\nnext_user_action:\n  required: true\n  action: review_result\n  message: Review the compact task artifact\n');
  const result = await run(file);
  assert.equal(result.code, 0, result.output);
  await rm(dir, { recursive: true, force: true });
});

test('compact 任务缺少主产物时被拒绝', async () => {
  const dir = await mkdtemp(path.join(os.tmpdir(), 'cg-work-task-'));
  const taskDir = path.join(dir, '2026-09-27-missing-primary-artifact');
  await mkdir(taskDir);
  const file = path.join(taskDir, 'task.yaml');
  await writeFile(file, 'id: 2026-09-27-missing-primary-artifact\nstatus: review\ngoal: Require one primary artifact\nworkflow: framework:feature-development\nartifact_profile: compact\ncreated_at: 2026-09-27\ndocumentation:\n  impact: none\n  not_needed_reason: Framework metadata only\nnext_action: User acceptance\ninteraction_protocol: v1\nnext_user_action:\n  required: true\n  action: review_result\n  message: Review the compact task artifact\n');
  const result = await run(file);
  assert.notEqual(result.code, 0);
  assert.match(result.output, /artifacts\.primary|主产物/);
  await rm(dir, { recursive: true, force: true });
});

test('拒绝把 standards_preflight 写成任务字段', async () => {
  const dir = await mkdtemp(path.join(os.tmpdir(), 'cg-work-task-'));
  const taskDir = path.join(dir, '2026-10-02-standards-preflight-field');
  await mkdir(taskDir);
  const file = path.join(taskDir, 'task.yaml');
  await writeFile(file, 'id: 2026-10-02-standards-preflight-field\nstatus: pending\ngoal: Reject a misplaced preflight section\nworkflow: framework:feature-development\ncreated_at: 2026-10-02\nstandards_preflight:\n  literals:\n    - some-literal\ndocumentation:\n  impact: none\n  not_needed_reason: Framework metadata only\nnext_action: Move it to plan.md\n');
  const result = await run(file);
  assert.notEqual(result.code, 0);
  assert.match(result.output, /standards_preflight 不是 task\.yaml 字段/);
  await rm(dir, { recursive: true, force: true });
});

test('拒绝未知执行模式并提示可用值', async () => {
  const dir = await mkdtemp(path.join(os.tmpdir(), 'cg-work-task-'));
  const taskDir = path.join(dir, '2026-09-21-invalid-profile');
  await mkdir(taskDir);
  const file = path.join(taskDir, 'task.yaml');
  await writeFile(
    file,
    'id: 2026-09-21-invalid-profile\nstatus: pending\ngoal: Reject unknown mode\nworkflow: framework:feature-development\nexecution_profile: fast\ncreated_at: 2026-09-21\ndocumentation:\n  impact: none\n  not_needed_reason: Framework metadata only\nnext_action: Verify\n'
  );
  const result = await run(file);
  assert.notEqual(result.code, 0);
  assert.match(result.output, /可选值：standard、lightweight/);
  await rm(dir, { recursive: true, force: true });
});

test('显式 standard 任务进入审查前必须记录 standards_preflight', async () => {
  const dir = await mkdtemp(path.join(os.tmpdir(), 'cg-work-task-'));
  const taskDir = path.join(dir, '2026-09-21-missing-standards-preflight');
  await mkdir(taskDir);
  await writeFile(path.join(taskDir, 'plan.md'), '# Plan\n\nImplementation details\n');
  await writeFile(path.join(taskDir, 'verification.md'), '# Verification\n\nTests passed\n');
  await writeFile(path.join(taskDir, 'review.md'), '# Review\n');
  const file = path.join(taskDir, 'task.yaml');
  await writeFile(
    file,
    'id: 2026-09-21-missing-standards-preflight\nstatus: review\ngoal: Require preflight evidence\nworkflow: framework:feature-development\nexecution_profile: standard\ncreated_at: 2026-09-21\nnext_action: Verify\ndocumentation:\n  impact: none\n  not_needed_reason: Framework metadata only\nplan_reference: plan.md\nreview_reference: review.md\nverification_reference: verification.md\n'
  );
  const result = await run(file);
  assert.notEqual(result.code, 0);
  assert.match(result.output, /standards_preflight/);
  await rm(dir, { recursive: true, force: true });
});

test('接受复用已有需求箱原始需求的任务引用', async () => {
  const dir = await mkdtemp(path.join(os.tmpdir(), 'cg-work-task-'));
  const taskDir = path.join(dir, '2026-09-10-reuse-requirement');
  const inboxDir = path.join(dir, 'requirements-inbox');
  await mkdir(taskDir);
  await mkdir(inboxDir);
  await writeFile(path.join(inboxDir, 'REQ-1.md'), '# 原始需求\n');
  const file = path.join(taskDir, 'task.yaml');
  await writeFile(file, 'id: 2026-09-10-reuse-requirement\nstatus: pending\ngoal: Implement one part of a shared requirement\nworkflow: framework:feature-development\ncreated_at: 2026-09-10\nrequirements_reference: ../requirements-inbox/REQ-1.md\ndocumentation:\n  impact: none\n  not_needed_reason: No documentation impact\nnext_action: Verify\n');
  const result = await run(file);
  assert.equal(result.code, 0, result.output);
  await rm(dir, { recursive: true, force: true });
});

test('需求包缺失且没有替代说明时被拒绝', async () => {
  const dir = await mkdtemp(path.join(os.tmpdir(), 'cg-work-task-'));
  const taskDir = path.join(dir, '2026-10-02-lost-requirement');
  await mkdir(taskDir);
  const file = path.join(taskDir, 'task.yaml');
  await writeFile(file, 'id: 2026-10-02-lost-requirement\nstatus: pending\ngoal: Reference a lost requirement package\nworkflow: framework:framework-optimization\ncreated_at: 2026-10-02\nrequirements_reference: ../requirements-inbox/lost.md\ndocumentation:\n  impact: none\n  not_needed_reason: Framework metadata only\nnext_action: Verify\n');
  const result = await run(file);
  assert.notEqual(result.code, 0);
  assert.match(result.output, /requirements_reference 指向的文件不存在/);
  await rm(dir, { recursive: true, force: true });
});

test('需求包确实不可恢复时接受替代说明', async () => {
  const dir = await mkdtemp(path.join(os.tmpdir(), 'cg-work-task-'));
  const taskDir = path.join(dir, '2026-10-02-lost-requirement-noted');
  await mkdir(taskDir);
  const file = path.join(taskDir, 'task.yaml');
  await writeFile(file, 'id: 2026-10-02-lost-requirement-noted\nstatus: pending\ngoal: Reference a lost requirement package\nworkflow: framework:framework-optimization\ncreated_at: 2026-10-02\nrequirements_reference: ../requirements-inbox/lost.md\nrequirements_reference_note: 需求包未随框架提交，本机不可恢复\ndocumentation:\n  impact: none\n  not_needed_reason: Framework metadata only\nnext_action: Verify\n');
  const result = await run(file);
  assert.equal(result.code, 0, result.output);
  await rm(dir, { recursive: true, force: true });
});

test('需求包仍然存在时不得填写替代说明', async () => {
  const dir = await mkdtemp(path.join(os.tmpdir(), 'cg-work-task-'));
  const taskDir = path.join(dir, '2026-10-02-present-requirement');
  const inboxDir = path.join(dir, 'requirements-inbox');
  await mkdir(taskDir);
  await mkdir(inboxDir);
  await writeFile(path.join(inboxDir, 'live.md'), '# 原始需求\n');
  const file = path.join(taskDir, 'task.yaml');
  await writeFile(file, 'id: 2026-10-02-present-requirement\nstatus: pending\ngoal: Reference a live requirement package\nworkflow: framework:framework-optimization\ncreated_at: 2026-10-02\nrequirements_reference: ../requirements-inbox/live.md\nrequirements_reference_note: 需求包未随框架提交，本机不可恢复\ndocumentation:\n  impact: none\n  not_needed_reason: Framework metadata only\nnext_action: Verify\n');
  const result = await run(file);
  assert.notEqual(result.code, 0);
  assert.match(result.output, /目标存在时不得填写 requirements_reference_note/);
  await rm(dir, { recursive: true, force: true });
});

test('替代说明必须是脱离引用也能自查的非空文本', async () => {
  const dir = await mkdtemp(path.join(os.tmpdir(), 'cg-work-task-'));
  const taskDir = path.join(dir, '2026-10-02-blank-note');
  await mkdir(taskDir);
  const file = path.join(taskDir, 'task.yaml');
  await writeFile(file, 'id: 2026-10-02-blank-note\nstatus: pending\ngoal: Reject a blank note\nworkflow: framework:framework-optimization\ncreated_at: 2026-10-02\nrequirements_reference: ../requirements-inbox/lost.md\nrequirements_reference_note: ""\ndocumentation:\n  impact: none\n  not_needed_reason: Framework metadata only\nnext_action: Verify\n');
  const result = await run(file);
  assert.notEqual(result.code, 0);
  assert.match(result.output, /requirements_reference_note 必须是非空字符串/);

  const soloDir = path.join(dir, '2026-10-02-solo-note');
  await mkdir(soloDir);
  const soloFile = path.join(soloDir, 'task.yaml');
  await writeFile(soloFile, 'id: 2026-10-02-solo-note\nstatus: pending\ngoal: Reject an orphan note\nworkflow: framework:framework-optimization\ncreated_at: 2026-10-02\nrequirements_reference_note: 需求包不可恢复\ndocumentation:\n  impact: none\n  not_needed_reason: Framework metadata only\nnext_action: Verify\n');
  const soloResult = await run(soloFile);
  assert.notEqual(soloResult.code, 0);
  assert.match(soloResult.output, /不能脱离 requirements_reference 单独使用/);
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

test('接受有完整任务内证据的轻量缺陷审查任务', async () => {
  const dir = await mkdtemp(path.join(os.tmpdir(), 'cg-work-task-'));
  const taskDir = path.join(dir, '2026-09-10-missing-import');
  await mkdir(taskDir);
  const file = path.join(taskDir, 'task.yaml');
  await writeFile(file, 'id: 2026-09-10-missing-import\nstatus: review\ngoal: Restore missing import\nworkflow: framework:bugfix\nexecution_profile: lightweight\ncreated_at: 2026-09-10\ndocumentation:\n  impact: none\n  not_needed_reason: Existing behavior only\nnext_action: User acceptance\nlightweight_evidence:\n  root_cause: getDictLabel was called without importing it\n  scope: One existing page module; no interface, data, permission, or external side effect\n  verification: node --test test/missing-import.test.mjs passed\n  review: Reviewed the one-line import diff\n  integration_decision: Keep in the current working tree\n');
  const result = await run(file);
  assert.equal(result.code, 0, result.output);
  await rm(dir, { recursive: true, force: true });
});

test('拒绝缺少验证证据的轻量缺陷审查任务', async () => {
  const dir = await mkdtemp(path.join(os.tmpdir(), 'cg-work-task-'));
  const taskDir = path.join(dir, '2026-09-10-missing-import');
  await mkdir(taskDir);
  const file = path.join(taskDir, 'task.yaml');
  await writeFile(file, 'id: 2026-09-10-missing-import\nstatus: review\ngoal: Restore missing import\nworkflow: framework:bugfix\nexecution_profile: lightweight\ncreated_at: 2026-09-10\ndocumentation:\n  impact: none\n  not_needed_reason: Existing behavior only\nnext_action: User acceptance\nlightweight_evidence:\n  root_cause: getDictLabel was called without importing it\n  scope: One existing page module; no interface, data, permission, or external side effect\n  review: Reviewed the one-line import diff\n  integration_decision: Keep in the current working tree\n');
  const result = await run(file);
  assert.notEqual(result.code, 0);
  assert.match(result.output, /lightweight_evidence\.verification/);
  await rm(dir, { recursive: true, force: true });
});

test('拒绝在轻量缺陷中声明学习协议', async () => {
  const dir = await mkdtemp(path.join(os.tmpdir(), 'cg-work-task-'));
  const taskDir = path.join(dir, '2026-09-10-missing-import');
  await mkdir(taskDir);
  const file = path.join(taskDir, 'task.yaml');
  await writeFile(file, 'id: 2026-09-10-missing-import\nstatus: pending\ngoal: Restore missing import\nworkflow: framework:bugfix\nexecution_profile: lightweight\ncreated_at: 2026-09-10\nlearning_protocol: v1\ndocumentation:\n  impact: none\n  not_needed_reason: Existing behavior only\nnext_action: Verify\n');
  const result = await run(file);
  assert.notEqual(result.code, 0);
  assert.match(result.output, /lightweight 任务不得声明 learning_protocol/);
  await rm(dir, { recursive: true, force: true });
});

test('轻量档适用于 bugfix 与 feature-development：功能类证据免填 root_cause', async () => {
  const dir = await mkdtemp(path.join(os.tmpdir(), 'cg-work-task-'));
  const taskDir = path.join(dir, '2026-09-10-small-feature');
  await mkdir(taskDir);
  const file = path.join(taskDir, 'task.yaml');
  await writeFile(file, 'id: 2026-09-10-small-feature\nstatus: pending\ngoal: Add a field\nworkflow: framework:feature-development\nexecution_profile: lightweight\ncreated_at: 2026-09-10\ndocumentation:\n  impact: none\n  not_needed_reason: Existing behavior only\nnext_action: Verify\n');
  const result = await run(file);
  assert.equal(result.code, 0, result.output);

  await writeFile(file, 'id: 2026-09-10-small-feature\nstatus: review\ngoal: Add a field\nworkflow: framework:feature-development\nexecution_profile: lightweight\ncreated_at: 2026-09-10\ndocumentation:\n  impact: none\n  not_needed_reason: Existing behavior only\nnext_action: User acceptance\nlightweight_evidence:\n  scope: One module entry point; no rule, migration, or external side effect\n  verification: node --test test/*.test.mjs passed\n  review: Reviewed the small diff\n  integration_decision: Keep in the current working tree\n');
  const reviewed = await run(file);
  assert.equal(reviewed.code, 0, '功能类轻量证据免填 root_cause：' + reviewed.output);
  await rm(dir, { recursive: true, force: true });
});

test('拒绝为轻量缺陷声明原型', async () => {
  const dir = await mkdtemp(path.join(os.tmpdir(), 'cg-work-task-'));
  const taskDir = path.join(dir, '2026-09-10-missing-import');
  await mkdir(taskDir);
  await writeFile(path.join(taskDir, 'prototype.html'), '<html></html>\n');
  const file = path.join(taskDir, 'task.yaml');
  await writeFile(file, 'id: 2026-09-10-missing-import\nstatus: pending\ngoal: Restore missing import\nworkflow: framework:bugfix\nexecution_profile: lightweight\ncreated_at: 2026-09-10\ndocumentation:\n  impact: none\n  not_needed_reason: Existing behavior only\nnext_action: Verify\nprototype_reference: prototype.html\n');
  const result = await run(file);
  assert.notEqual(result.code, 0);
  assert.match(result.output, /lightweight 任务不得声明 prototype_reference/);
  await rm(dir, { recursive: true, force: true });
});

test('拒绝 lightweight 与 artifact_profile: compact 同时声明', async () => {
  const dir = await mkdtemp(path.join(os.tmpdir(), 'cg-work-task-'));
  const taskDir = path.join(dir, '2026-10-07-lightweight-compact-conflict');
  await mkdir(taskDir);
  await writeFile(path.join(taskDir, 'plan.md'), '# Plan\n');
  const file = path.join(taskDir, 'task.yaml');
  await writeFile(file, 'id: 2026-10-07-lightweight-compact-conflict\nstatus: pending\ngoal: Reject combined profiles\nworkflow: framework:feature-development\nexecution_profile: lightweight\nartifact_profile: compact\nartifacts:\n  primary: plan.md\ncreated_at: 2026-10-07\ndocumentation:\n  impact: none\n  not_needed_reason: Framework metadata only\nnext_action: Verify\n');
  const result = await run(file);
  assert.notEqual(result.code, 0);
  assert.match(result.output, /lightweight 与 artifact_profile: compact 不能同时声明/);
  await rm(dir, { recursive: true, force: true });
});

test('接受 standard 与 artifact_profile: compact 组合', async () => {
  const dir = await mkdtemp(path.join(os.tmpdir(), 'cg-work-task-'));
  const taskDir = path.join(dir, '2026-10-07-standard-compact');
  await mkdir(taskDir);
  await writeFile(path.join(taskDir, 'plan.md'), '# Plan\n');
  const file = path.join(taskDir, 'task.yaml');
  await writeFile(file, 'id: 2026-10-07-standard-compact\nstatus: review\ngoal: Allow standard with compact\nworkflow: framework:framework-optimization\nexecution_profile: standard\nartifact_profile: compact\nartifacts:\n  primary: plan.md\ncreated_at: 2026-10-07\ndocumentation:\n  impact: none\n  not_needed_reason: Framework metadata only\nnext_action: User acceptance\ninteraction_protocol: v1\nnext_user_action:\n  required: true\n  action: accept-result\n  message: 请验收标准执行与 compact 组合\n');
  const result = await run(file);
  assert.equal(result.code, 0, result.output);
  await rm(dir, { recursive: true, force: true });
});

test('原型任务的计划记录缺少实现契约章节时被拒绝', async () => {
  const dir = await mkdtemp(path.join(os.tmpdir(), 'cg-work-task-'));
  const taskDir = path.join(dir, '2026-10-02-prototype-contract');
  await mkdir(taskDir);
  await writeFile(path.join(taskDir, 'plan.md'), '# Plan\n');
  await writeFile(path.join(taskDir, 'review.md'), '# Review\n\n## 原型采纳\n\n### 采纳结论\n\n### 实现映射\n\n### 验证映射\n\n### 未采纳项\n');
  await writeFile(path.join(taskDir, 'verification.md'), '# Verification\n');
  await writeFile(path.join(taskDir, 'prototype.html'), '<html></html>\n');
  const file = path.join(taskDir, 'task.yaml');
  await writeFile(file, 'id: 2026-10-02-prototype-contract\nstatus: review\ngoal: Require prototype contract\nworkflow: framework:feature-development\ncreated_at: 2026-10-02\ndocumentation:\n  impact: none\n  not_needed_reason: Framework metadata only\nnext_action: Review\nprototype_reference: prototype.html\nplan_reference: plan.md\nreview_reference: review.md\nverification_reference: verification.md\n');
  const result = await run(file);
  assert.notEqual(result.code, 0);
  assert.match(result.output, /plan\.md 缺少“原型实现契约”章节/);
  await rm(dir, { recursive: true, force: true });
});

test('接受计划记录含实现契约、评审记录含采纳章节的原型任务', async () => {
  const dir = await mkdtemp(path.join(os.tmpdir(), 'cg-work-task-'));
  const taskDir = path.join(dir, '2026-10-02-prototype-accepted');
  await mkdir(taskDir);
  await writeFile(path.join(taskDir, 'plan.md'), '# Plan\n\n## 原型实现契约\n\n### 问题与目标\n\n### 状态与场景\n\n### 视觉与响应式约束\n\n### 资源与依赖\n\n### 交互与业务规则\n\n### 验收映射\n');
  await writeFile(path.join(taskDir, 'review.md'), '# Review\n\n## 原型采纳\n\n### 采纳结论\n\n全部采纳。\n\n### 实现映射\n\n### 验证映射\n\n### 未采纳项\n\n无。\n');
  await writeFile(path.join(taskDir, 'verification.md'), '# Verification\n');
  await writeFile(path.join(taskDir, 'prototype.html'), '<html></html>\n');
  const file = path.join(taskDir, 'task.yaml');
  await writeFile(file, 'id: 2026-10-02-prototype-accepted\nstatus: review\ngoal: Require prototype sections\nworkflow: framework:feature-development\ncreated_at: 2026-10-02\ndocumentation:\n  impact: none\n  not_needed_reason: Framework metadata only\nnext_action: Review\nprototype_reference: prototype.html\nplan_reference: plan.md\nreview_reference: review.md\nverification_reference: verification.md\n');
  const result = await run(file);
  assert.equal(result.code, 0, result.output);
  await rm(dir, { recursive: true, force: true });
});

test('原型实现契约缺少子章节时被拒绝', async () => {
  const dir = await mkdtemp(path.join(os.tmpdir(), 'cg-work-task-'));
  const taskDir = path.join(dir, '2026-10-02-prototype-partial-contract');
  await mkdir(taskDir);
  await writeFile(path.join(taskDir, 'plan.md'), '# Plan\n\n## 原型实现契约\n\n### 问题与目标\n\n');
  const file = path.join(taskDir, 'task.yaml');
  await writeFile(file, 'id: 2026-10-02-prototype-partial-contract\nstatus: in_progress\ngoal: Require every contract section\nworkflow: framework:feature-development\ncreated_at: 2026-10-02\ndocumentation:\n  impact: none\n  not_needed_reason: Framework metadata only\nnext_action: Fill the contract\nprototype_reference: prototype.html\nplan_reference: plan.md\n');
  await writeFile(path.join(taskDir, 'prototype.html'), '<html></html>\n');
  const result = await run(file);
  assert.notEqual(result.code, 0);
  assert.match(result.output, /原型实现契约缺少“验收映射”章节/);
  await rm(dir, { recursive: true, force: true });
});

test('待处理的原型任务不要求契约章节', async () => {
  const dir = await mkdtemp(path.join(os.tmpdir(), 'cg-work-task-'));
  const taskDir = path.join(dir, '2026-10-02-prototype-pending');
  await mkdir(taskDir);
  await writeFile(path.join(taskDir, 'prototype.html'), '<html></html>\n');
  const file = path.join(taskDir, 'task.yaml');
  await writeFile(file, 'id: 2026-10-02-prototype-pending\nstatus: pending\ngoal: Prototype not started\nworkflow: framework:feature-development\ncreated_at: 2026-10-02\ndocumentation:\n  impact: none\n  not_needed_reason: Framework metadata only\nnext_action: Start later\nprototype_reference: prototype.html\n');
  const result = await run(file);
  assert.equal(result.code, 0, result.output);
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

test('原型任务的评审记录缺少采纳章节时被拒绝', async () => {
  const dir = await mkdtemp(path.join(os.tmpdir(), 'cg-work-task-'));
  const taskDir = path.join(dir, '2026-10-02-prototype-disposition-missing');
  await mkdir(taskDir);
  await writeFile(path.join(taskDir, 'plan.md'), '# Plan\n\n## 原型实现契约\n\n### 问题与目标\n\n### 状态与场景\n\n### 视觉与响应式约束\n\n### 资源与依赖\n\n### 交互与业务规则\n\n### 验收映射\n');
  await writeFile(path.join(taskDir, 'review.md'), '# Review\n');
  await writeFile(path.join(taskDir, 'verification.md'), '# Verification\n');
  await writeFile(path.join(taskDir, 'prototype.html'), '<html></html>\n');
  const file = path.join(taskDir, 'task.yaml');
  await writeFile(file, 'id: 2026-10-02-prototype-disposition-missing\nstatus: review\ngoal: Require adoption section\nworkflow: framework:feature-development\ncreated_at: 2026-10-02\ndocumentation:\n  impact: none\n  not_needed_reason: Framework metadata only\nnext_action: Review\nprototype_reference: prototype.html\nplan_reference: plan.md\nreview_reference: review.md\nverification_reference: verification.md\n');
  const result = await run(file);
  assert.notEqual(result.code, 0);
  assert.match(result.output, /review\.md 缺少“原型采纳”章节/);
  await rm(dir, { recursive: true, force: true });
});

test('原型采纳章节缺少映射子章节时被拒绝', async () => {
  const dir = await mkdtemp(path.join(os.tmpdir(), 'cg-work-task-'));
  const taskDir = path.join(dir, '2026-10-02-prototype-partial-adoption');
  await mkdir(taskDir);
  await writeFile(path.join(taskDir, 'plan.md'), '# Plan\n\n## 原型实现契约\n\n### 问题与目标\n\n### 状态与场景\n\n### 视觉与响应式约束\n\n### 资源与依赖\n\n### 交互与业务规则\n\n### 验收映射\n');
  await writeFile(path.join(taskDir, 'review.md'), '# Review\n\n## 原型采纳\n\n### 采纳结论\n\n部分采纳。\n');
  await writeFile(path.join(taskDir, 'verification.md'), '# Verification\n');
  await writeFile(path.join(taskDir, 'prototype.html'), '<html></html>\n');
  const file = path.join(taskDir, 'task.yaml');
  await writeFile(file, 'id: 2026-10-02-prototype-partial-adoption\nstatus: review\ngoal: Require every adoption section\nworkflow: framework:feature-development\ncreated_at: 2026-10-02\ndocumentation:\n  impact: none\n  not_needed_reason: Framework metadata only\nnext_action: Review\nprototype_reference: prototype.html\nplan_reference: plan.md\nreview_reference: review.md\nverification_reference: verification.md\n');
  const result = await run(file);
  assert.notEqual(result.code, 0);
  assert.match(result.output, /原型采纳缺少“实现映射”章节/);
  await rm(dir, { recursive: true, force: true });
});

test('拒绝已废弃的原型契约与处置字段', async () => {
  const dir = await mkdtemp(path.join(os.tmpdir(), 'cg-work-task-'));
  const taskDir = path.join(dir, '2026-10-02-prototype-legacy-fields');
  await mkdir(taskDir);
  await writeFile(path.join(taskDir, 'prototype.html'), '<html></html>\n');
  const file = path.join(taskDir, 'task.yaml');
  await writeFile(file, 'id: 2026-10-02-prototype-legacy-fields\nstatus: pending\ngoal: Reject removed prototype fields\nworkflow: framework:feature-development\ncreated_at: 2026-10-02\ndocumentation:\n  impact: none\n  not_needed_reason: Framework metadata only\nnext_action: Use the plan/review sections\nprototype_reference: prototype.html\nprototype_contract_reference: prototype-contract.md\nprototype_disposition_reference: prototype-disposition.md\n');
  const result = await run(file);
  assert.notEqual(result.code, 0);
  assert.match(result.output, /prototype_contract_reference 已废弃/);
  assert.match(result.output, /prototype_disposition_reference 已废弃/);
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
  await writeFile(file, 'id: 2026-09-10-project-initialization\nstatus: done\ngoal: Initialize\nworkflow: framework:project-initialization\ncreated_at: 2026-09-10\ndocumentation:\n  impact: none\n  not_needed_reason: Initialization only\nnext_action: None\nroadmap_reference: roadmap.yaml\nclosure_reference: closure.md\nparent_task_reference: parent-task.yaml\ndepends_on:\n  - dependency-task.yaml\nrequirements_coverage:\n  REQ-1: coverage.md\nreview_reference: review.md\nverification_reference: verification.md\nhandoff_reference: handoff.md\n');
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

test('已归档任务只需成功解析 YAML', async () => {
  const dir = await mkdtemp(path.join(os.tmpdir(), 'cg-work-task-'));
  const taskDir = path.join(dir, '2026-10-01-archived-task');
  await mkdir(taskDir);
  const file = path.join(taskDir, 'task.yaml');
  await writeFile(file, 'status: review\narchived: true\narchive_reason: Historical\n');
  const result = await run(file);
  assert.equal(result.code, 0, result.output);
  await rm(dir, { recursive: true, force: true });
});

test('接受结构化状态历史并校验原因与时间', async () => {
  const dir = await mkdtemp(path.join(os.tmpdir(), 'cg-work-task-'));
  const taskDir = path.join(dir, '2026-10-01-structured-history');
  await mkdir(taskDir);
  const file = path.join(taskDir, 'task.yaml');
  await writeFile(path.join(taskDir, 'review.md'), '# Review\n');
  await writeFile(path.join(taskDir, 'verification.md'), '# Verification\n');
  await writeFile(file, 'id: 2026-10-01-structured-history\nstatus: review\ngoal: Structured history\nworkflow: framework:framework-optimization\ncreated_at: 2026-10-01\ndocumentation:\n  impact: update\n  files:\n    - README.md\nreview_reference: review.md\nverification_reference: verification.md\nnext_action: Review\nstatus_history:\n  - status: pending\n    at: "2026-10-01T09:00:00+08:00"\n    reason: 任务创建\n  - status: in_progress\n    at: "2026-10-01T09:30:00+08:00"\n    reason: 开始实施\n  - status: review\n    at: "2026-10-01T10:00:00+08:00"\n    reason: 完成实现\n');
  const result = await run(file);
  assert.equal(result.code, 0, result.output);
  await rm(dir, { recursive: true, force: true });
});

test('拒绝 documentation 规范字段与历史别名并存', async () => {
  const dir = await mkdtemp(path.join(os.tmpdir(), 'cg-work-task-'));
  const taskDir = path.join(dir, '2026-10-01-documentation-alias-conflict');
  await mkdir(taskDir);
  const file = path.join(taskDir, 'task.yaml');
  await writeFile(file, 'id: 2026-10-01-documentation-alias-conflict\nstatus: pending\ngoal: Documentation aliases\nworkflow: framework:framework-optimization\ncreated_at: 2026-10-01\ndocumentation:\n  impact: update\n  files:\n    - README.md\n  targets:\n    - core/README.md\nnext_action: Review\n');
  const result = await run(file);
  assert.notEqual(result.code, 0);
  assert.match(result.output, /files 与 targets 不能同时填写/);
  await rm(dir, { recursive: true, force: true });
});

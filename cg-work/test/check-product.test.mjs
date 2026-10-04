import assert from 'node:assert/strict';
import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import test from 'node:test';

const exec = promisify(execFile);
const script = path.resolve('scripts/check-product.mjs');

async function run(file) {
  try {
    const result = await exec(process.execPath, [script, file]);
    return { code: 0, output: `${result.stdout}${result.stderr}` };
  } catch (error) {
    return { code: error.code, output: `${error.stdout || ''}${error.stderr || ''}` };
  }
}

function roadmap({ status = 'done', theme = 'v1', taskReference = 'task.yaml', decisionAction = '请确认' } = {}) {
  return `# 项目路线图

## 目标与边界

- 目标：可验证的交付

## 版本与主题

| 版本/主题 | 预期结果 | 时间或排序 | 依赖 | 风险 |
| --- | --- | --- | --- | --- |
| v1 | 基础能力 | 1 | - | 低 |

## 切片

| 切片 | 版本/主题 | 状态 | 优先级 | 依赖 | 需求来源 | 任务引用 | 进入 ready 的证据 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 切片A | ${theme} | ${status} | P0 | - | req.md | ${taskReference} | 用户确认；测试通过 |

## 探索区

- 想法：待验证

## 未决决策

| 决策 | 影响 | 需要的用户动作 |
| --- | --- | --- |
| 决策A | 影响A | ${decisionAction} |

## 版本验收

| 版本 | 计划 | 已交付 | 接受/拒绝与理由 | 度量就绪 | 建议 |
| --- | --- | --- | --- | --- | --- |
| v1 | 计划 | 交付 | 接受 | 就绪 | ship |
`;
}

async function fixture(content) {
  const dir = await mkdtemp(path.join(os.tmpdir(), 'cg-work-roadmap-'));
  await mkdir(path.join(dir, 'tasks', 'demo'), { recursive: true });
  await writeFile(path.join(dir, 'req.md'), '# 需求包\n');
  await writeFile(path.join(dir, 'tasks', 'demo', 'task.yaml'), 'id: 2026-10-02-demo\n');
  const file = path.join(dir, 'roadmap.md');
  await writeFile(file, content);
  return { dir, file };
}

test('接受结构完整的项目路线图', async () => {
  const { dir, file } = await fixture(roadmap({ taskReference: 'tasks/demo/task.yaml' }));
  const result = await run(file);
  assert.equal(result.code, 0, result.output);
  await rm(dir, { recursive: true, force: true });
});

test('拒绝未知切片状态与未登记的版本主题', async () => {
  const { dir, file } = await fixture(roadmap({ status: '待处理', theme: 'v9' }));
  const result = await run(file);
  assert.notEqual(result.code, 0);
  assert.match(result.output, /状态无效：待处理/);
  assert.match(result.output, /未在“版本与主题”中登记/);
  await rm(dir, { recursive: true, force: true });
});

test('done 切片缺少任务引用时被拒绝', async () => {
  const { dir, file } = await fixture(roadmap({ taskReference: '-' }));
  const result = await run(file);
  assert.notEqual(result.code, 0);
  assert.match(result.output, /状态为 done 但未填写任务引用/);
  await rm(dir, { recursive: true, force: true });
});

test('引用路径不存在时被拒绝', async () => {
  const { dir, file } = await fixture(roadmap({ taskReference: 'tasks/missing/task.yaml' }));
  const result = await run(file);
  assert.notEqual(result.code, 0);
  assert.match(result.output, /任务引用路径不存在/);
  await rm(dir, { recursive: true, force: true });
});

test('未决决策缺少用户动作时被拒绝', async () => {
  const { dir, file } = await fixture(roadmap({ decisionAction: '-' }));
  const result = await run(file);
  assert.notEqual(result.code, 0);
  assert.match(result.output, /缺少“需要的用户动作”/);
  await rm(dir, { recursive: true, force: true });
});

test('无法解析的裸任务 id 被拒绝', async () => {
  const { dir, file } = await fixture(roadmap({ taskReference: '2026-10-02-not-registered' }));
  const result = await run(file);
  assert.notEqual(result.code, 0);
  assert.match(result.output, /无法解析：2026-10-02-not-registered/);
  await rm(dir, { recursive: true, force: true });
});

test('缺少必需章节时被拒绝', async () => {
  const content = roadmap().replace(/## 探索区[\s\S]*?## 未决决策/, '## 未决决策');
  const { dir, file } = await fixture(content);
  const result = await run(file);
  assert.notEqual(result.code, 0);
  assert.match(result.output, /缺少章节：## 探索区/);
  await rm(dir, { recursive: true, force: true });
});

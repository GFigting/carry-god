import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const files = {
  submission: 'core/naming-and-submission.md',
  readme: 'README.md',
  maintenance: 'core/framework-maintenance.md',
  workflows: 'workflows/README.md',
  feature: 'workflows/feature-development.md',
  bugfix: 'workflows/bugfix.md',
};

test('原项目提交默认保留测试，授权后才允许清理并记录证据', async () => {
  const content = await readFile(files.submission, 'utf8');
  assert.match(content, /当提交目标是原项目业务仓库时/);
  assert.match(content, /测试文件默认保留，不因提交动作自动删除或排除/);
  assert.match(content, /用户或任务范围明确授权清理/);
  assert.match(content, /删除前先完成必要验证/);
  assert.match(content, /任务验证或交接记录中保存删除清单/);
  assert.match(content, /复核提交差异/);
});

test('原项目测试删除规则不扩展到 cg-work 框架测试', async () => {
  const content = await readFile(files.submission, 'utf8');
  assert.match(content, /框架自身提交：保留 `cg-work\/test\/` 中仍有保护价值的测试/);
  assert.match(content, /不适用于 `cg-work` 框架自身/);
});

test('提交规则明确测试文件识别边界', async () => {
  const content = await readFile(files.submission, 'utf8');
  assert.match(content, /test\/.*tests\/.*__tests__\/.*spec\/.*specs/);
  assert.match(content, /\.test\./);
  assert.match(content, /\.spec\./);
  assert.match(content, /测试夹具、快照、模拟数据和测试配置/);
  assert.match(content, /项目已有约定更宽时，以项目约定为准/);
});

test('入口和工作流同步提交范围与验证顺序', async () => {
  const content = await Promise.all(Object.values(files).map((file) => readFile(file, 'utf8')));
  for (const source of content) {
    assert.match(source, /原项目/);
    assert.match(source, /(?:测试文件默认保留|默认保留测试文件)/);
    assert.match(source, /明确授权/);
  }
  assert.match(content[0], /删除前先完成必要验证/);
  assert.match(content[4], /先完成验证/);
  assert.match(content[4], /记录(?:类\/方法)?删除清单/);
  assert.match(content[4], /复核提交差异/);
});

test('测试类和方法只为可观察行为或独立契约生成', async () => {
  const content = await readFile(files.submission, 'utf8');
  assert.match(content, /测试类与测试方法生成标准/);
  assert.match(content, /新的可观察行为、业务规则、边界条件、异常路径/);
  assert.match(content, /优先在已有测试类中补充/);
  assert.match(content, /不为 getter\/setter、简单映射、直通委托/);
  assert.match(content, /缺陷修复通常必须补充/);
});

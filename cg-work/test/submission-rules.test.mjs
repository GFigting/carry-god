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

test('提交政策只维护在唯一来源，其余位置只引用不复制', async () => {
  const submission = await readFile(files.submission, 'utf8');
  assert.match(submission, /## 原项目提交口径/);
  assert.match(submission, /## 测试类与测试方法生成标准/);
  // 唯一来源必须继续承载被引用的收尾正文，避免引用指向空承诺。
  assert.match(submission, /将最新 SQL 合并到正式脚本/);
  assert.match(submission, /清理与本次变更直接相关的冗余/);
  assert.match(submission, /提交后同步更新受影响的业务、架构、接口或维护文档/);
  assert.match(submission, /统一收尾顺序：新鲜验证/);
  assert.match(submission, /仅表示创建本地 Git commit，不自动推送、合并、部署/);

  const consumers = ['readme', 'maintenance', 'workflows', 'feature', 'bugfix'];
  for (const key of consumers) {
    const content = await readFile(files[key], 'utf8');
    assert.match(content, /naming-and-submission\.md/, `${key} 必须引用提交政策唯一来源`);
    assert.doesNotMatch(content, /简单映射、直通委托/, `${key} 不得复制提交政策正文`);
    assert.doesNotMatch(content, /测试文件默认保留/, `${key} 不得复制提交政策正文`);
  }
});

test('测试类和方法只为可观察行为或独立契约生成', async () => {
  const content = await readFile(files.submission, 'utf8');
  assert.match(content, /测试类与测试方法生成标准/);
  assert.match(content, /新的可观察行为、业务规则、边界条件、异常路径/);
  assert.match(content, /优先在已有测试类中补充/);
  assert.match(content, /不为 getter\/setter、简单映射、直通委托/);
  assert.match(content, /缺陷修复命中硬三类（数据不可逆、红线、真会悄悄坏的核心逻辑/);
  assert.match(content, /其余修复以人工验收为准/);
});

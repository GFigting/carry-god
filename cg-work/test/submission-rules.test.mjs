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

test('项目未规定测试处理时默认保留，授权后才允许清理并记录证据', async () => {
  const content = await readFile(files.submission, 'utf8');
  assert.match(content, /当提交目标是原项目业务仓库时/);
  assert.match(content, /测试文件默认保留，不因提交动作自动删除或排除/);
  assert.match(content, /未配置项目提交工具，或项目未规定测试处理时/);
  assert.match(content, /用户或任务范围明确授权清理/);
  assert.match(content, /删除前先完成必要验证/);
  assert.match(content, /任务验证或交接记录中保存删除清单/);
  assert.match(content, /复核提交差异/);
});

test('已配置的项目提交工具优先，清理授权限于任务范围', async () => {
  const content = await readFile(files.submission, 'utf8');
  assert.match(content, /以项目提交工具及 `submission.instructions` 为准/);
  assert.match(content, /本节通用规则仅补充项目未规定的事项/);
  assert.match(content, /不得以通用测试保留规则为由绕过项目工具/);
  assert.match(content, /替代执行方式须有用户授权/);
  assert.match(content, /按其范围先完成必要验证，再执行清理/);
  assert.match(content, /无需为同一范围重复请求确认/);
  assert.match(content, /不得扩大为清理无关历史测试或无法确认归属的改动/);
  assert.doesNotMatch(content, /工具不得自动扫描后删除/);
  const context = await readFile('core/project-context.md', 'utf8');
  assert.match(context, /按 `submission.tool` 及其说明执行/);
  assert.match(context, /naming-and-submission\.md#原项目提交口径/);
  const operating = await readFile('core/operating-model.md', 'utf8');
  assert.match(operating, /按 \[命名与提交\].*确定项目提交规则与通用规则的适用关系/);
  assert.doesNotMatch(operating, /清理全部测试/);
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

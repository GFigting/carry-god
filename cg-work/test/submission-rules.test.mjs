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

test('任何原项目提交都要求验证后删除全部测试并记录清单', async () => {
  const content = await readFile(files.submission, 'utf8');
  assert.match(content, /当提交目标是原项目业务仓库时/);
  assert.match(content, /原项目提交必须先完成必要验证，再删除原项目仓库中的全部测试文件/);
  assert.match(content, /任务验证或交接记录中保存删除清单/);
  assert.match(content, /复核提交差异中不再有测试文件/);
  assert.match(content, /不依赖用户是否使用“提交全部内容”措辞/);
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
    assert.match(source, /删除/);
  }
  assert.match(content[0], /先完成必要验证，再删除/);
  assert.match(content[4], /先完成验证，删除原项目全部测试文件，记录删除清单并复核无测试残留/);
});

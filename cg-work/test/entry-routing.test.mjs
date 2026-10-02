import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';

const read = (relativePath) => fs.readFileSync(new URL(`../${relativePath}`, import.meta.url), 'utf8');

test('入口文档只做路由，不复制规则正文', () => {
  const agents = read('AGENTS.md');
  assert.ok(agents.trimEnd().split('\n').length <= 15, 'AGENTS.md 应保持精简路由');
  assert.match(agents, /只做路由/);
  assert.match(agents, /README\.md/);
  assert.match(agents, /core\//);
  for (const clause of [
    /简单映射、直通委托/,
    /测试文件默认保留/,
    /artifact_profile/,
    /prototype_contract_reference/,
    /execution_profile/,
    /不改变业务规则、交互行为/,
  ]) {
    assert.doesNotMatch(agents, clause, 'AGENTS.md 不得复制规则正文');
  }
});

test('入口路由完整覆盖 core 规则入口与特殊操作门禁', () => {
  const agents = read('AGENTS.md');
  const readme = read('README.md');
  // 精简入口不得丢掉任一 core 入口的指向。
  for (const ruleFile of [
    'operating-model.md',
    'context-loading.md',
    'naming-and-submission.md',
    'framework-maintenance.md',
    'special-operations.md',
  ]) {
    assert.match(agents, new RegExp(ruleFile.replace('.', '\\.')), `AGENTS.md 必须保留 ${ruleFile} 的路由`);
  }
  // 特殊操作的强制触发点必须落在规则正文（README 使用顺序）里，而不只是清单式提及。
  assert.match(readme, /core\/special-operations\.md/);
  assert.match(readme, /破坏性、生产数据、认证、部署或跨会话操作/);
  assert.match(readme, /按.*场景表完成决策预检并取得用户授权/);
});

test('CLAUDE.md 只指向路由入口，不复制规则', () => {
  const claude = read('CLAUDE.md');
  assert.ok(claude.trimEnd().split('\n').length <= 6, 'CLAUDE.md 应保持单行路由');
  assert.match(claude, /AGENTS\.md|路由入口/);
});

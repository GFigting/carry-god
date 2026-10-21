import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const skillPath = path.join(root, 'skills', 'subagent-dispatch-timing', 'SKILL.md');

test('subagent dispatch timing skill exposes the framework dispatch contract', async () => {
  const content = await fs.readFile(skillPath, 'utf8');

  assert.match(content, /^---\r?\nname: subagent-dispatch-timing\r?\n/m);
  assert.match(content, /description:\s+\S+/);

  // 判据结构：总则、分阶段判据（四阶段）、派发契约、反模式、边界齐备。
  for (const section of [
    '## 总则：比例原则',
    '## 分阶段判据',
    '### 计划阶段',
    '### 实现阶段',
    '### 验证阶段',
    '### 审查收尾阶段',
    '## 派发契约',
    '## 反模式',
    '## 边界',
  ]) {
    assert.ok(content.includes(section), `missing section: ${section}`);
  }

  // 关键判据：实现类不并行、审查类可并行、比例原则默认最小交付。
  assert.match(content, /实现类子代理不并行派发/);
  assert.match(content, /审查类可并行/);
  assert.match(content, /默认最小交付/);

  // 验证阶段判据：browser-use 按 verification.profiles 派发并回写证据，声明纯浏览器验收边界。
  assert.match(content, /browser-use/);
  assert.match(content, /verification\.profiles/);
  assert.match(content, /verification\.md/);
  assert.match(content, /不能以替代检查冒充完整检查/);

  // 反模式覆盖"该派不派、过度派发、错误并行"三类偏差。
  for (const pattern of ['该派不派', '过度派发', '错误并行']) {
    assert.ok(content.includes(pattern), `missing anti-pattern: ${pattern}`);
  }

  // 边界：引用镜像技能与 core 不变量，不复制正文。
  for (const reference of [
    'subagent-driven-development',
    'dispatching-parallel-agents',
    'executing-plans',
    '../../core/operating-model.md',
    '../../core/special-operations.md',
  ]) {
    assert.ok(content.includes(reference), `missing reference: ${reference}`);
  }
});

test('workflows keep dispatch judgement as pointers only', async () => {
  const feature = await fs.readFile(path.join(root, 'workflows', 'feature-development.md'), 'utf8');
  const bugfix = await fs.readFile(path.join(root, 'workflows', 'bugfix.md'), 'utf8');
  const review = await fs.readFile(path.join(root, 'workflows', 'review.md'), 'utf8');

  for (const [name, content] of [['feature-development', feature], ['bugfix', bugfix], ['review', review]]) {
    assert.ok(content.includes('framework:subagent-dispatch-timing'), `${name} must reference the dispatch skill`);
  }

  // 判据正文已收敛：feature-development 不再保留两线审核的展开定义与"比例原则"正文。
  assert.doesNotMatch(feature, /\*\*需求审核线\*\*：/);
  assert.doesNotMatch(feature, /\*\*规范审核线\*\*：/);
  assert.doesNotMatch(feature, /沿用同一比例原则/);
});

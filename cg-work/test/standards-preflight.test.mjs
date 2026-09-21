import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';

const read = (relativePath) => fs.readFileSync(new URL(`../${relativePath}`, import.meta.url), 'utf8');

test('常量化规则在编码前置阶段定义，而不是只停留在审查清单', () => {
  const standards = read('core/project-code-standards.md');
  const workflows = read('workflows/README.md');
  const feature = read('workflows/feature-development.md');
  const bugfix = read('workflows/bugfix.md');
  const scripts = read('scripts/README.md');

  assert.match(standards, /## 常量化前置检查/);
  assert.match(standards, /计划阶段.*状态值、类型值、路由片段、接口路径、阈值/);
  assert.match(standards, /审查不应是首次发现常量化问题的环节/);
  assert.match(workflows, /`standards_preflight`/);
  assert.match(feature, /进入实现前，计划必须包含 `standards_preflight`/);
  assert.match(bugfix, /标准缺陷在编码前也必须完成 `standards_preflight`/);
  assert.match(scripts, /自动检查、当前差异人工检查和不适用项/);
});

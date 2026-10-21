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
  assert.match(workflows, /标准编码前置检查/);
  assert.match(feature, /计划与验证记录中「标准编码前置检查」的内容与写入时点以 \[标准编码前置检查\]/);
  assert.match(bugfix, /标准缺陷的「标准编码前置检查」按 \[标准编码前置检查\]/);
  assert.match(scripts, /自动检查、当前差异人工检查和不适用项/);
});

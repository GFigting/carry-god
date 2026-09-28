import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';

const read = (relativePath) => fs.readFileSync(new URL(`../${relativePath}`, import.meta.url), 'utf8');

test('项目识别协议覆盖三类分类与确认后路由', () => {
  const skill = read('skills/project-discovery/SKILL.md');
  const workflow = read('workflows/project-discovery.md');
  const context = read('core/context-loading.md');
  const onboarding = read('core/project-onboarding.md');
  const readme = read('README.md');

  for (const state of ['existing-project', 'new-project', 'needs-clarification']) assert.ok(skill.includes('`' + state + '`'));
  assert.match(skill, /一次只问一个问题/);
  assert.match(skill, /只有用户明确确认摘要后才能继续/);
  assert.match(skill, /framework:project-initialization/);
  assert.match(skill, /不得用默认值绕过确认/);
  assert.match(workflow, /framework:project-discovery/);
  assert.match(context, /先运行 `framework:project-discovery`/);
  assert.match(onboarding, /识别与初始化门禁/);
  assert.match(readme, /framework:project-discovery/);
});

test('项目识别不把需求澄清或空目录当作项目身份', () => {
  const skill = read('skills/project-discovery/SKILL.md');
  assert.match(skill, /不替代需求澄清/);
  assert.match(skill, /不要因为“新增功能”/);
  assert.match(skill, /不要因为目录为空/);
});

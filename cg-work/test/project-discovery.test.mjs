import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';

const read = (relativePath) => fs.readFileSync(new URL(`../${relativePath}`, import.meta.url), 'utf8');

test('项目识别协议覆盖三类分类与按分类路由', () => {
  const skill = read('skills/project-discovery/SKILL.md');
  const workflow = read('workflows/project-discovery.md');
  const context = read('core/project-context.md');
  const onboarding = context;
  const readme = read('README.md');

  for (const state of ['existing-project', 'new-project', 'needs-clarification']) assert.ok(skill.includes('`' + state + '`'));
  assert.match(skill, /一次只问一个问题/);
  assert.match(skill, /先自查，找不到才问/);
  assert.match(skill, /local\/projects\/\*\/project-context\.yaml/);
  assert.match(skill, /唯一匹配.*不等待用户确认/s);
  assert.match(skill, /摘要需用户明确确认后，才执行 `framework:project-initialization`/);
  assert.match(skill, /不得用默认值绕过确认/);
  assert.match(workflow, /framework:project-discovery/);
  assert.match(workflow, /唯一匹配时展示识别摘要后自动路由/);
  assert.match(context, /先运行 `framework:project-discovery`/);
  assert.match(context, /确认不作为前置门禁/);
  assert.match(onboarding, /识别与初始化门禁/);
  assert.match(readme, /framework:project-discovery/);
  assert.match(readme, /既有项目唯一匹配时展示识别摘要后直接继续/);
});

test('项目识别不把需求澄清或空目录当作项目身份', () => {
  const skill = read('skills/project-discovery/SKILL.md');
  assert.match(skill, /不替代需求澄清/);
  assert.match(skill, /不要因为“新增功能”/);
  assert.match(skill, /不要因为目录为空/);
});

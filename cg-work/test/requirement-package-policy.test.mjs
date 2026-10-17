import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';

const read = (relativePath) => fs.readFileSync(new URL(`../${relativePath}`, import.meta.url), 'utf8');

test('需求箱只允许手动添加，任务无需关联需求', () => {
  const operating = read('core/operating-model.md');
  assert.match(operating, /### 需求箱与需求引用/);
  for (const trigger of ['只允许用户手动添加', '不生成、不写入需求包', '不需要关联需求', 'requirements-inbox/archive']) {
    assert.match(operating, new RegExp(trigger), `需求箱规则必须包含：${trigger}`);
  }
  for (const file of ['workflows/bugfix.md', 'workflows/feature-development.md', 'core/project-context.md', 'README.md', 'local/README.md']) {
    const content = read(file);
    assert.doesNotMatch(content, /需求包留存判断|原始需求存入需求箱|原始需求先存入|按需生成需求包/, `${file} 不得再要求 Agent 生成需求包`);
    assert.match(content, /手动添加/, `${file} 必须说明需求箱内容只允许手动添加`);
  }
});

import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';

const read = (relativePath) => fs.readFileSync(new URL(`../${relativePath}`, import.meta.url), 'utf8');

test('需求包按需生成有唯一来源，四处不再强制每任务建包', () => {
  const operating = read('core/operating-model.md');
  assert.match(operating, /### 需求包留存判断/);
  for (const trigger of ['复杂、模糊', '拆成多个任务', '用户确认、范围边界或重要取舍', '实现记录替代原意']) {
    assert.match(operating, new RegExp(trigger), `需求包留存判断必须包含：${trigger}`);
  }
  for (const file of ['workflows/bugfix.md', 'workflows/feature-development.md', 'core/context-loading.md', 'README.md', 'local/README.md']) {
    const content = read(file);
    assert.doesNotMatch(content, /轻量任务仍须将原始需求存入需求箱|原始需求先存入/, `${file} 不得再强制先建需求包`);
    assert.match(content, /需求包留存判断/, `${file} 必须引用需求包留存判断唯一来源`);
  }
});

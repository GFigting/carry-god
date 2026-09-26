import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';

const read = (relativePath) => fs.readFileSync(new URL(`../${relativePath}`, import.meta.url), 'utf8');

test('决策预检必须展示自动判断并区分确认门禁', () => {
  const operations = read('core/special-operations.md');
  const grilling = read('skills/grilling/SKILL.md');
  const readme = read('README.md');

  for (const field of ['risk', 'assumptions', 'recommendation', 'alternatives', 'user_confirmation']) {
    assert.match(operations, new RegExp('`' + field + '`'));
  }
  assert.match(operations, /不得把自动判断藏在内部/);
  assert.match(operations, /high.*irreversible.*必须等待用户确认/s);
  assert.match(grilling, /Before starting the first grilling round/);
  assert.match(grilling, /Do not silently invoke grilling/);
  assert.match(readme, /展示决策预检简报/);
});

import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';

const read = (relativePath) => fs.readFileSync(new URL(`../${relativePath}`, import.meta.url), 'utf8');

test('轻量执行适用范围在各唯一来源中一致覆盖 bugfix 与 feature-development', () => {
  const sources = [
    ['core/operating-model.md', read('core/operating-model.md')],
    ['workflows/README.md', read('workflows/README.md')],
    ['scripts/README.md', read('scripts/README.md')],
    ['core/continuous-learning.md', read('core/continuous-learning.md')],
  ];
  for (const [name, content] of sources) {
    assert.doesNotMatch(content, /仅适用于 `framework:bugfix`|仅限 `framework:bugfix`|只适用于 `framework:bugfix`/, `${name} 不得再把轻量执行限定为 bugfix`);
    assert.match(content, /`framework:bugfix` 与 `framework:feature-development`/, `${name} 必须同时覆盖 bugfix 与 feature-development`);
  }
});

test('交付路径、升级规则和决策清单有唯一来源', () => {
  const operating = read('core/operating-model.md');
  assert.match(operating, /\*\*免记录路径\*\*（低风险变更，不进入任务状态机）→ \*\*轻量执行\*\*.*→ \*\*标准执行\*\*/);
  assert.match(operating, /### 交付路径声明/);
  assert.match(operating, /### 轻量执行决策清单/);
  assert.match(operating, /### 交付路径升级/);
  assert.match(operating, /`delivery_path` 取值决定（`lightweight` \/ `standard` \/ `compact`）/);
  // 主观条件已收敛为五项升级触发器，任一项为“是”即进入标准执行。
  for (const trigger of ['是否跨模块', '是否改变业务规则、接口、数据或权限', '是否存在迁移、删除或其他不可逆写入', '是否有未决业务决策', '是否产生外部副作用']) {
    assert.match(operating, new RegExp(trigger.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')), `决策清单必须包含：${trigger}`);
  }
  // 交付路径说明必须与 operating-model 一致：delivery_path 单枚举，无组合规则。
  assert.match(operating, /交付路径通过单一字段 `delivery_path` 取值决定（`lightweight` \/ `standard` \/ `compact`），三者天然互斥/);
  assert.match(read('scripts/README.md'), /任务字段规则（`delivery_path`/);
});

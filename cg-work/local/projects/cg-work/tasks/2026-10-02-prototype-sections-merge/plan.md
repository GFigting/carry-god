# 原型机制并入任务记录

## 问题事实

| 编号 | 事实 | 证据 |
|---|---|---|
| P1 | 机制与使用量严重不匹配 | 126 条记录中 `prototype_reference` 1 条、`prototype_contract_reference` 0 条、`prototype_disposition_reference` 0 条 |
| P2 | 门禁存在但流程从未跑通 | 唯一引用原型的任务正因缺契约而校验失败 |
| P3 | 维护成本落在文档与模板上 | 两个模板文件、6 处框架文档、5 个校验分支，服务 0～1 个使用者 |
| P4 | 任务已有承载位 | 计划记录写"进入实现前要做什么"，评审记录写"实现后是否采纳"，契约与采纳结论天然属于这两处 |

## 受影响唯一来源

| 唯一来源 | 变更 |
|---|---|
| `core/operating-model.md` | 新增"原型与任务记录"章节：唯一字段、两个章节的时机与骨架；模板与两个字段的废弃说明 |
| `scripts/check-task.mjs` | 改为按章节校验（计划记录六节、评审记录四节）；compact 查主产物；两个旧字段给出明确废弃报错；移除旧的两个引用校验函数 |
| `workflows/README.md`、`workflows/feature-development.md` | 门禁描述改为章节要求并指向唯一来源 |
| `core/framework-maintenance.md`、`README.md`、`core/README.md` | 同步描述与模板废弃说明 |
| `skills/prototype/SKILL.md` | 第 7 条改为写入 `plan.md` 的契约章节与 `review.md` 的采纳章节 |
| `core/prototype-implementation-contract.template.md`、`core/prototype-disposition.template.md` | 转为废弃说明（保留章节骨架，历史引用不断链） |
| `test/check-task.test.mjs` | 5 个旧原型测试重写为 6 个新用例（含时机门禁与废弃字段两条） |
| `VERSION` | 2.21.0 → 2.22.0 |

## 非目标

- 不删除两个模板文件：历史任务记录仍引用它们，按框架维护规则保留替代说明。
- 不代填那条唯一原型任务的契约内容；该记录继续按预期失败，直到该任务自己补齐。
- 不为原型新增任何字段或文件类型；改动方向是减少而非增加。
- 不改 compact 任务的产物模型：章节写进已有主产物。

## 兼容性判断

- 唯一使用原型字段的记录本就不合规（缺契约），改后仍不合规，但失败原因从"缺字段"变为"计划记录缺少章节"，不产生新的失败。
- 两个旧字段从"可选引用"变为"明确报错"，无任何合规记录使用它们，因此无破坏面。
- 章节标题层级放宽为 `##`/`###` 两级匹配，既可写在独立章节（旧模板形态），也可作为计划/评审记录的子章节。
- 模板文件保留并保留原章节骨架，历史任务记录中的链接仍可解析。

## 验证范围

1. `npm test` 通过，含新增 6 例：契约缺失、契约子节缺失、采纳缺失、采纳子节缺失、待处理阶段不要求、废弃字段被拒。
2. `npm run check` 与 `node scripts/check-skills.mjs` 通过（含新增锚点 `#原型与任务记录`）。
3. 129 条任务记录全量复校验，失败数不得高于改动前（3 条）。
4. 全框架检索：除说明性文本与历史记录外，不再出现"要求填写 `prototype_contract_reference`"的规则。

## 实施清单

- [x] 校验器改为章节门禁并拒绝废弃字段
- [x] 规则正文新增"原型与任务记录"章节（含骨架与锚点）
- [x] 工作流、维护规则、技能与脚本说明同步
- [x] 两个模板转为废弃说明并保留骨架
- [x] 测试重写为 6 例
- [x] 版本号提升
- [x] 全量复校验并写回结论

## 验证结论

执行日期：2026-10-02。

| 验证项 | 命令 | 结果 |
|---|---|---|
| 框架回归测试 | `npm test` | 66 通过 / 0 失败 |
| 框架全量校验 | `npm run check` | 通过（含新锚点 `operating-model.md#原型与任务记录`） |
| 技能镜像 | `node scripts/check-skills.mjs` | `skill mirrors match sources` |
| 记录全量复校验 | 逐条 `node scripts/check-task.mjs` | 129 条中失败 3 条，与改动前一致 |
| 唯一原型记录 | `2026-09-11-overseas-tax-foundation-exchange-rate-permissions` | 仍失败，原因变为"plan.md 缺少原型实现契约章节"（该任务自己的真实工作，未代填） |
| 残留检索 | 全框架 grep | 规则性文本中不再要求两个废弃字段；仅存说明性提及、测试与历史记录 |

## 审查结论

自查：门禁强度未降——六节、四节与两个时机点全部保留，只是承载位置从独立文件改为既有记录；compact 任务不被逼迫新增文件；旧字段给出可执行的替代说明而非静默忽略；两个模板保留骨架，历史引用不断链。唯一原型记录仍未通过，这是有意为之：补契约属于该业务的真实工作，编造一份会让门禁变成形式。

## 交接与集成决策

状态：`review`，等待用户验收。建议与前四项（`artifact-and-field-simplification`、`acceptance-queue-channel`、`retire-initialization-report`、`check-skills-line-ending-tolerant`、`localized-skill-registration`）一并按版本 2.22.0 提交；lasen 那条原型记录的契约补齐建议单独立项。

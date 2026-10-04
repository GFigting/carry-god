# 产物与字段简化（第 3 项）

## 问题事实

| 编号 | 事实 | 证据（126 条任务记录） |
|---|---|---|
| P1 | 两个字段从未被使用 | `child_task_references` 0 条、`follow_up_task_references` 0 条 |
| P2 | 同一事实三种字段名 | `acceptance_summary` 46 条、`acceptance_criteria` 7 条、`acceptance` 4 条 |
| P3 | 同一事实两个位置且已漂移 | `standards_preflight` 应为 `plan.md`/`verification.md` 段落（框架正文明确"不新增任务 YAML 字段"），实际有 5 条写成 `task.yaml` 字段 |
| P4 | 冗余目录 marker | 需求箱同时强制 `README.md` 与 `.gitkeep`；README 已保证目录非空 |

## 受影响唯一来源

| 唯一来源 | 变更 |
|---|---|
| `scripts/check-task.mjs` | 移除两个零使用字段的校验与轻量档禁列；新增"`standards_preflight` 不是任务字段"的明确报错 |
| `scripts/check-all.mjs` | 需求箱只要求 `README.md`；同步忽略规则断言 |
| `.gitignore` | 移除需求箱 `.gitkeep` 例外（README.md 例外保留） |
| `core/operating-model.md` | 元数据摘要补"`standards_preflight` 不是任务字段" |
| `scripts/README.md` | 同一条位置规则写入校验脚本说明 |
| `local/README.md` | 目录结构去掉 `.gitkeep`；字段清单去掉两个零使用字段；说明 marker 变化 |
| `skills/project-initialization/SKILL.md` | 需求箱只写 `README.md` |
| `skills/large-task-decomposition/SKILL.md` | 子任务字段清单去掉零使用字段 |
| 11 条任务记录 | `acceptance`/`acceptance_criteria` → `acceptance_summary`（值原样） |
| 5 条任务记录 | `standards_preflight` YAML 字段迁入 `plan.md`（必要时含 `verification.md`），内容原样 |
| `VERSION` | 2.19.1 → 2.20.0（字段词汇表变化） |

## 非目标

- 不新增"未知字段一律拒绝"的严格模式：会让大量历史业务记录一次性失败，属追溯性门禁。
- 不删除已存在的 `.gitkeep` 文件（含已跟踪的 cg-work 需求箱 marker），只停止强制要求。
- 不改写任何字段值或证据内容；迁移仅为改名与搬移。
- 不改历史任务记录中的既有陈述（如 `2026-09-11-add-requirements-inbox` 里对旧 marker 规则的描述）。

## 兼容性判断

- 删除的两个字段无任何记录使用，删除不产生迁移需求。
- 11 条改名为同义字段，值类型均为字符串列表，与 `acceptance_summary` 校验一致。
- 5 条 preflight 迁移保留原文，只是在正确的文件里出现；校验器只检查该关键词是否出现在计划/验证记录中。
- 新增的报错只影响"把段落写成字段"这一种错误写法，不涉及历史合规记录。

## 验证范围

1. 126 条任务记录全量复校验：失败数不得增加（迁移前 3 条，迁移后应仍为 3 条）。
2. `npm test` 通过，含新增"拒绝把 standards_preflight 写成任务字段"用例。
3. `npm run check` 与 `node scripts/check-skills.mjs` 通过。
4. 全框架检索：两个零使用字段不再出现在校验器、文档与技能正文中。

## 实施清单

- [x] 校验器与文档移除两个零使用字段
- [x] `standards_preflight` 位置定死并加报错
- [x] 需求箱 `.gitkeep` 强制要求停用
- [x] 11 条 acceptance 命名归正
- [x] 5 条 preflight 字段迁入计划/验证记录
- [x] 版本号提升
- [x] 全量复校验并写回结论

## 验证结论

执行日期：2026-10-02。

| 验证项 | 命令 | 结果 |
|---|---|---|
| 任务记录全量复校验 | 逐条 `node scripts/check-task.mjs` | 126 条中失败 3 条，与迁移前一致（均为需各自补真实证据的记录：原型契约、`verification.md`、`documentation` 评估） |
| 迁移条目复校验 | 11 条改名 + 5 条迁移记录 | 全部通过 |
| 框架回归测试 | `npm test` | 61 通过 / 0 失败 |
| 框架全量校验 | `npm run check` | 通过 |
| 技能镜像 | `node scripts/check-skills.mjs` | `skill mirrors match sources` |
| 残留检索 | 全框架 grep | 两个零使用字段已不在校验器、文档、技能正文中出现 |

## 审查结论

自查：迁移脚本只做两类操作——顶层字段改名、YAML 块原样搬移并附来源说明；运行后逐条复校验，没有把任何通过记录变成失败。新增报错只针对错误写法，未对历史合规记录施加新约束。未采用"未知字段严格模式"，避免一次性制造大量追溯性失败。已存在的 `.gitkeep` 与历史任务记录中的旧描述按非目标保留。

## 交接与集成决策

状态：`review`，等待用户验收。建议与 `2026-10-02-retire-initialization-report`、`2026-10-02-check-skills-line-ending-tolerant`、`2026-10-02-localized-skill-registration` 合并为版本 2.20.0 的框架提交；11 条业务项目记录的字段改名与 5 条迁移属本地数据，保持本地不提交。

# 审查记录

## 审查基线

- 需求与方案：`plan.md`（含计划审核结论：通过；执行中两项范围调整——"先只迁移不校验"、"只迁 FMS 存量双轨"——均经用户决策）。
- 验证证据：`verification.md`（TC-001~TC-005 全部 PASS，`npm run check` 全绿，`npm test` 45/45）。
- 结构对照：`core/operating-model.md`「大任务主从拆分」、`core/templates/parent-plan.template.md`、`skills/large-task-decomposition/SKILL.md`。

## 审查结论

实现符合方案与计划，逐项核对：

1. **结构与字段**：`role: parent` 与 `parent_reference` 已文档化进 `operating-model.md` 字段摘要（含与 `role: parent` 互斥、`roadmap_reference` 废弃说明）；按用户决策未建脚本校验器，字段有效性由文档约定 + 残留扫描兜底。
2. **FMS 迁移**：容器型主任务 `2026-10-19-async-download-center` 承载原三件套全部内容——`task.yaml` 记录 4 项决策（均标 `confirmed_by`/`confirmed_at`），`plan.md` 含需求覆盖与拆分 9 行（含 optimization、estimation-calibration 两个后补任务）、排除范围 4 项、依赖关系、遗留与后续（含原统一验收约定）；6 个活跃子任务 `roadmap_reference` 全部改写为 `parent_reference`（原型任务 2026-10-12-async-download-management 原本无引用，不涉及）；`roadmaps/2026-10-12-async-download-center/` 三件套文件已删除。
3. **文档与模板同步**：`README.md`（使用顺序第 7 条、第 38/40 行）、`core/operating-model.md`（大任务章节重写、next_action 段）、`core/project-context.md`、`local/README.md`（目录树与主任务说明）、`core/README.md`、`core/templates/README.md`、`core/templates/project-roadmap.template.md`、`skills/product-management/SKILL.md` 共 11 处引用改写；`decomposition.template.md` 更名为 `parent-plan.template.md` 并重写为四章节骨架；`large-task-decomposition/SKILL.md` 全文重写为主从拆分流程（含决策分级、存量双轨说明、常见错误）。
4. **撞名消解**：框架正文术语统一为「大任务主从拆分」，`roadmaps`/`roadmap_reference` 仅在存量说明与废弃标注中出现；项目路线图机制（`product.roadmap_path`、`check-product.mjs`）未改动。
5. **版本与验证**：`VERSION` 2.28.0 → 2.29.0（结构重组，次版本升级）；全量验证与残留扫描结果见证据。

## 审查中发现与处理

| 问题 | 严重性 | 处理结论 |
|---|---|---|
| 计划假设的 `check-task.mjs` 封闭 schema 校验器在 9ecc318（2.28.0）已删除 | 高（前提偏差） | 经用户决策调整为"先只迁移不校验"，plan 范围与测试用例同步改写，不推翻 2.28.0 的降级决策 |
| 空目录 `local/projects/fms/roadmaps/` 删除被安全策略拒绝 | 低 | 三件套文件已删，仅剩空壳；不绕过策略，记录为遗留待用户处理 |
| `task.yaml` 的 `documentation.files` 含计划阶段预估路径（`package.json`、`scripts/check-*.mjs`、旧模板名）与实际改动不一致 | 低 | 已在收尾时改写为实际受影响文件 |

## 集成决定

- 删除清单：`local/projects/fms/roadmaps/2026-10-12-async-download-center/{roadmap.yaml,coverage.md,closure.md}`（业务项目本地数据，不入 git）；`core/templates/decomposition.template.md`（git 追踪，改名体现为删除 + 新增）。
- 保留：lasen、job-hunt×2、cg-work 共 4 个存量路线图双轨保留；归档任务历史文本不改写。
- 集成方式：本地 commit（框架规则，不推送），待用户验收后按 review 阶段规则合并提交。

## 遗留风险

1. `local/projects/fms/roadmaps/` 空目录待用户手动移除或明确授权（删除动作曾被安全策略拒绝）。
2. 无字段校验兜底：新任务误写 `roadmap_reference` 或错误 `parent_reference` 路径不会被脚本拦截，依赖文档约定与 review 人工核对；若后续复发可另立任务恢复最小校验。
3. lasen、job-hunt、cg-work 共 4 个存量路线图迁移为后续独立任务，迁移前新旧结构双轨并存。

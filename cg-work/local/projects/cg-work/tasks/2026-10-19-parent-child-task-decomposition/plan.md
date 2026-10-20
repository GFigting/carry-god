# 大任务主从扁平结构改造实施计划

## 目标

把大任务拆分从「roadmaps 三件套索引」改为「主任务 + 子任务」扁平结构：不再新建 `roadmaps/` 目录与 `roadmap.yaml`/`coverage.md`/`closure.md`，拆分清单、需求覆盖与决策全部归宿到主任务的 `task.yaml` 与 `plan.md`，消除索引双写与腐烂问题；本次迁移 FMS 存量路线图并同步模板与文档，其余 3 个项目存量路线图双轨保留、后续另立任务迁移。

## 范围

### 包含

- task.yaml 字段规则以文档约定新增 `role`（`parent`）与 `parent_reference`；`roadmap_reference` 标记废弃不再使用（**不建脚本校验**——2.28.0 已移除 task 字段脚本校验，本任务延续该决策，用户确认"先只迁移不校验"）。
- 主任务 plan 承载原三件套内容：`## 决策`（原 roadmap.decisions）、`## 需求覆盖与拆分`（原 coverage.md，每条原始需求标注子任务 / 已决策 / 延期 / 排除，不得写「待处理」）、遗留与后续（原 closure.md，主任务 `review` 阶段写入审查记录）。
- 拆分流程分级：决策已清楚直接记录并拆片；决策模糊才走 `framework:wayfinder`，票据结论回填主任务 `decisions` 后拆片；不再要求前置全套 wayfinder。
- 新建任务挂 `parent_reference` 即完成挂靠，主任务 plan 覆盖章节补行，无索引回写。
- FMS 存量迁移：新建容器型主任务承载原路线图内容，6 个活跃子任务（原型任务无引用不涉及）改写引用，删除 `roadmaps/2026-10-12-async-download-center/`。
- 文档与模板：`skills/large-task-decomposition/SKILL.md` 重写、`core/operating-model.md` 大任务章节与字段 schema 段、`README.md` 相关段落、模板更名与骨架更新、`local/README.md` 同步。
- 框架版本号升级。

### 不包含

- **task 字段脚本校验**：不新建校验器、不拒收 `roadmap_reference`——2.28.0 已将任务字段校验降级为文档约定，本任务不推翻该决策；字段有效性靠文档规则 + 残留扫描测试兜底（用户选择"先只迁移不校验"）。
- **存量双轨路线图迁移**：lasen 海外税务一期、job-hunt 两个、cg-work governance 共 4 个存量路线图原样保留可继续使用；新任务一律用主从结构、不再新建 `roadmaps/`，后续为各项目另立迁移任务。
- `framework:wayfinder` 镜像技能正文不改写（仅本地 `large-task-decomposition` 引用侧调整）。
- `core/templates/project-roadmap.template.md` 项目路线图机制不动（`product.roadmap_path`、`check-product.mjs` 保持现状）。
- `framework:product-management` 技能不动。
- 命名统一到 decomposition 之外的其他备选（roadmap 撞名问题由扁平化自然消解，不另做全局改名）。
- FMS 各子任务的业务实现与验收（`download-center-integration` 推进、`estimation-calibration` 验收等仍按各自任务进行）。

## 需求与验收

- 需求来源：用户对话决策——四项痛点（索引维护成本高、拆分流程太重、撞名混淆、组织方式不对）全选，选定「主任务 + 子任务（扁平）」，主任务两种角色都支持，覆盖记录写主任务 plan，保留并优化决策环节。
- 验收标准：
  - [ ] `npm run check` 全绿、`npm test` 全绿
  - [ ] 活跃（非归档）task.yaml 无 `roadmap_reference` 残留；FMS `roadmaps/` 目录已删除
  - [ ] FMS 主任务 plan 含完整决策、覆盖映射（8 条含后补任务）与遗留项；6 个子任务引用改写完成
  - [ ] `skills/large-task-decomposition/SKILL.md`、`operating-model.md`、`README.md` 与新结构一致，且明确"存量 4 个路线图双轨保留、不再新建"
  - [ ] 框架版本号已升级

## 测试用例

```
| 用例编号 | 所属模块 | 用例标题 | 前置条件 | 测试步骤 | 预期结果 | 优先级 | 测试层级 |
|----------|----------|----------|----------|----------|----------|--------|----------|
| TC-001 | 全仓残留扫描 | 活跃任务无 roadmap_reference | 迁移完成 | 遍历 local/projects/*/tasks/（排除 archive）task.yaml，grep roadmap_reference | 零命中 | P0 | data |
| TC-002 | 目录扫描 | FMS roadmaps 目录已删除 | 迁移完成 | 检查 local/projects/fms/roadmaps/ 不存在（其余项目存量双轨保留） | fms 下无 roadmaps，其他 3 个项目保留 | P0 | data |
| TC-003 | 文档一致性 | 新字段文档化 | 文档同步完成 | grep operating-model.md 含 role/parent_reference，README 与 SKILL 无"新建 roadmaps/"指引 | 规则与新结构一致 | P1 | data |
| TC-004 | check-all | 全仓框架校验通过 | 全部改动完成 | npm run check | 全绿（含链接与锚点） | P0 | data |
| TC-005 | test | 全量测试通过 | 全部改动完成 | npm test | 全绿 | P0 | runtime |
```

## 影响范围

- 文件、模块、接口或数据：
  - `core/operating-model.md`、`README.md`、`local/README.md`
  - `skills/large-task-decomposition/SKILL.md`
  - `core/templates/decomposition.template.md` → 更名为主任务 plan 章节骨架
  - `package.json` 版本号
  - `local/projects/fms/roadmaps/2026-10-12-async-download-center/`（删除）
  - `local/projects/fms/tasks/` 下 6 个任务的 `roadmap_reference` → `parent_reference` + 新建主任务
- 调用方和依赖方：所有后续任务的 task.yaml 字段书写；历史归档任务不改写；其余 3 个项目 4 个存量路线图双轨保留。

## 实施步骤

1. FMS 迁移：`task-stamp create` 建容器型主任务 → plan 写入决策、覆盖映射（8 条）、遗留项 → 6 个子任务 `roadmap_reference` 改写为 `parent_reference` → 确认内容搬移完整后删除 `roadmaps/2026-10-12-async-download-center/`。
2. 模板与文档：`decomposition.template.md` 重写为父任务 plan 章节骨架并更名；`large-task-decomposition/SKILL.md` 重写；`operating-model.md` 大任务章节与字段 schema 段、`README.md` 相关段落、`local/README.md` 同步（含存量 4 个路线图双轨保留说明）。
3. 版本号升级 + `npm run check`、`npm test` 全量验证 + 残留扫描（TC-001~TC-003）。
4. `review` 阶段统一收尾：冗余清理、文档同步核对、集成决策。

## 计划审核

- 需求覆盖：完整——四项痛点对应结构、流程、命名、组织四个层面的设计均已确认；执行中两项范围调整（不建校验器、只迁 FMS）已经用户决策。
- 范围边界：无越界——项目路线图机制、wayfinder 镜像正文、其余 3 个项目存量路线图明确排除。
- 依赖与顺序：FMS 迁移（搬内容 → 改引用 → 删旧目录，删除前人工核对完整性）→ 文档模板 → 全量验证，串行推进。
- 验收与验证：`npm run check` / `npm test` / 残留扫描可客观判定；FMS 主任务覆盖 8 条完整性人工核对。
- 风险与回滚：FMS 路线图属业务项目本地数据不入 git，删除不可回滚——以"先搬全、核对后再删"缓解；无校验器兜底，字段写法靠文档约定，错误引用需 review 阶段人工核对。
- 审核结论：通过
- 审核意见来源：用户决定（三段设计逐段确认 + 两项执行中范围调整）

## standards_preflight

- 项目自动检查：`npm run check`（框架结构、链接锚点、工作流引用）与 `npm test`（45 项），实施完成后在验证阶段全量执行。
- 当前差异人工检查：本次差异为框架文档、模板、任务记录与 YAML 数据结构，不含业务代码；人工核对全部 `roadmap_reference`/`roadmaps/` 引用点逐处改写或标注双轨保留，FMS 三件套内容与主任务记录逐项对照。
- 不适用项：框架文档任务无 Java/前端构建与运行时检查；浏览器验收不适用（无界面行为变更）。

## 验证

- 自动化测试：`npm test`
- 静态检查或构建：`npm run check`；单文件 `node scripts/check-project.mjs local/projects/cg-work/project-context.yaml`
- 页面、接口或用户验收：用户验收主任务（结构变更属跨模块，适用验收门禁）

## 风险与交付

- 风险和环境限制：schema 拒收是即时生效的破坏性变更，迁移与校验器必须同批提交；归档任务若含 `roadmap_reference` 需确认校验是否豁免归档路径。
- 集成方式：本地 commit，按框架规则合并为单个或两个 commit，不推送。

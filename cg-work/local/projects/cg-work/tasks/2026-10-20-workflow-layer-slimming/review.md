# 审查记录 — workflows 层减薄（方案 A）

## 变更范围

- `workflows/large-task-decomposition.md`：整文按主从口径重写（决策分级 → 建主任务 → to-tickets 生成子任务 → 推进与关闭），移除全部旧 roadmaps 三件套流程，尾段保留存量三件套双轨说明。
- `workflows/README.md`：阶段契约表、compact 段、原型门禁段、执行模式段压缩为指针；删除「standard 与 compact 可同时声明」矛盾句；两处旧「路线图」措辞改主从口径；**保留** §标准编码前置检查为唯一来源。
- `workflows/feature-development.md`、`workflows/bugfix.md`：需求箱、原型门禁、轻量执行、standards_preflight 复述正文改指针；「路线图」措辞改主从口径。
- `workflows/low-risk-change.md`：与 `core/operating-model#低风险变更` 近逐字重复段改指针，仅保留本层独有的一条执行要求。
- `VERSION`：2.30.0 → 2.31.0（语义化版本，规则文本结构变更升次版本）。
- `test/standards-preflight.test.mjs`、`test/requirement-package-policy.test.mjs`：断言随正文减薄同步——保持断言意图（规则有唯一来源、禁止生成需求包），把「复述正文」检查改为「指针引用」检查。

## 审查结论

1. **旧口径清零**：`workflows/` 下 grep `路线图|closure.md|coverage.md|next_user_action|roadmap_reference|可同时声明` 全部零命中（TC-001~003）。
2. **不丢规则**：被删段落逐条在 `core/operating-model.md` 找到唯一来源承接（verification.md TC-006 比对表），本层独有内容（技能调度、计划审核双线、测试处理、标准编码前置检查）全部保留。
3. **矛盾消除**：`delivery_path` 组合声明表述已删除，与 core 单一枚举口径一致（曾以 32 个存量 task.yaml 均为单值枚举作事实核验）。
4. **新鲜验证**：`npm run check` 全绿（锚点/引用有效）；`npm test` 49 项全绿。
5. **冗余清理**：仅限本任务直接相关的测试断言冗余同步，未扩展到其他文件。

## 文档同步

规则唯一来源本就在 `core/`，本次是 workflows 向 core 对齐，无需反向改 core；`AGENTS.md`/根 `README.md` 已是新口径，不动。

## 文件重命名（用户验收时追加）

- `git mv` 三处，保留历史：`workflows/large-task-decomposition.md` → `workflows/parent-child-decomposition.md`；`skills/large-task-decomposition/` → `skills/parent-child-decomposition/`（`name:` 同步改为 `parent-child-decomposition`）；`core/templates/project-roadmap.template.md` → `core/templates/product-roadmap.template.md`（与 `product.roadmap_path` 字段、`product-management` 技能对齐，也与已废弃的 `roadmaps/` 三件套区分）。
- 同步更新全部活跃引用：根 `README.md`（3 处）、`core/README.md`、`core/project-context.md`、`core/special-operations.md`、`core/templates/README.md`、`core/templates/parent-plan.template.md`、`workflows/README.md`、`workflows/feature-development.md`（frontmatter + 正文链接）、`workflows/parent-child-decomposition.md` frontmatter、`skills/README.md`（含一句旧口径描述改为主从措辞）、`skills/product-management/SKILL.md`、`local/README.md`。
- `local/` 下历史与归档任务记录中的旧文件名保留原样（历史事实，不回写）。
- 复核：框架内容 grep `large-task-decomposition|project-roadmap.template` 零命中；`npm run check`、`npm test`（49 项）全绿。

## 提交决策（待用户确认）

- 本任务 commit 暂存范围（含重命名后扩展）：`workflows/`（含重命名为 `parent-child-decomposition.md`）、`skills/`（重命名目录 + `README.md` + `product-management/SKILL.md`）、`core/README.md`、`core/templates/README.md`、`core/templates/parent-plan.template.md`、根 `README.md`、`local/README.md`、`test/`（2 个断言文件）、`VERSION`、任务目录。
- **混合文件注意**：`core/project-context.md`、`core/special-operations.md` 同时含早前 core 深查修正与本次重命名引用；`core/operating-model.md` 只含在途时间字段说明。提交时这 3 个 core 文件若纳入，属于「core 深查 + 重命名」混合内容，需与用户确认是否并入本 commit 或用 `git add -p` 拆分。
- **不混入**：`scripts/*` 在途改动、`scripts/task-time-fields.mjs`、`test/task-time-fields.test.mjs`、`core/framework-maintenance.md`、3 个存量 task.yaml 时间修复、`2026-10-20-task-time-field-check/`、`.codegraph/`。
- 集成方式：本地 commit 留在 main，推送需单独授权。

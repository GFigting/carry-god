# 实施方案：core 规则文件优化分类（方案二）

## 背景

core/ 现有 14 个文件，存在索引漏项、字段职责三处重复、项目接入链四文件职责交织、framework-maintenance 复制已有路径规则等问题。用户确认按方案二执行：去重 + 合并接入链。

## 变更清单

1. **合并接入链**：`project-onboarding.md` + `project-context-fields.md` + `context-loading.md` → `core/project-context.md`，按「识别门禁 → 接入与初始化 → 字段规范 → 加载规则」四节线性排列，14 → 12 个文件。
2. **字段职责唯一来源**：`documentation`/`runtime`/`verification` 等字段职责正文只留在 `project-context.md`；`documentation-standards.md` 第 3 节重复的字段清单改指针。
3. **framework-maintenance 去冗余**：删除第 19–25 行复制自 README/operating-model 的原型、路线图、设计产物路径规则，改为指针。
4. **README 索引重写**：按分组（生命周期 / 项目上下文 / 项目侧标准 / 仓库边界 / 经验闭环 / 框架治理 / 模板）排列，补上此前漏列的 `plan.template.md`。
5. **引用同步**：更新 README.md、AGENTS.md、workflows/、skills/、scripts/README.md、core 内部互链与锚点；归档任务引用属审计记录不改写；活跃任务引用按需更新。

## 执行顺序

1. 盘点全仓库对 `context-loading`、`project-onboarding`、`project-context-fields` 的引用与锚点
2. 合并生成 `core/project-context.md`，删除原三文件
3. 修 documentation-standards、framework-maintenance 重复正文
4. 重写 core/README.md 索引，同步根 README/AGENTS 及 workflows、skills、scripts 引用
5. `npm run check` 校验链接与锚点，逐个修复断链

## standards_preflight

- 项目自动检查：`npm run check`（框架结构、链接与锚点、受管任务记录）
- 当前差异人工检查：三份被合并文件的正文全部进入新文件或改为指针，无内容丢失；字段职责重复段仅指针化不删除规则
- 不适用项：业务仓库提交检查（本任务不触碰业务仓库）

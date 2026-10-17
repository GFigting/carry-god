# 审查记录

## 结论

按方案二完成 core/ 文件优化分类，实现与计划一致，等待用户验收。

## 变更结果

1. **合并接入链**：`project-onboarding.md`（识别门禁与不变量）、`project-context-fields.md`（字段规范）、`context-loading.md`（加载规则）合并为 `core/project-context.md`，按「识别与初始化门禁 → 项目关联不变量 → 字段规范 → 加载规则」四节线性排列，与 Agent 实际阅读顺序一致。core/ 由 15 项减至 13 项。
2. **字段职责唯一来源**：`documentation` 子类别清单、`path`/`load` 语义、`required_context` 废弃口径的正文收敛到 `project-context.md`；`documentation-standards.md` 第 3 节重复段改为指向 project-context.md 的指针。
3. **framework-maintenance 去冗余**：删除复制自 README/operating-model 的任务记录、设计产物、路线图位置与原型章节正文（原 4 段），压缩为单一来源指引段，保留路线图字段可选性这一本文件独有的演进约束。
4. **core/README.md 索引重写**：按「生命周期与流程 / 项目上下文 / 项目侧标准 / 仓库与框架治理 / 现行模板」五组分类，补上此前漏列的 `plan.template.md`、`project-context-fields.md`（合并后为 project-context.md 一项）。
5. **引用同步**：AGENTS.md、根 README 无需改路径的保持原样；`core/operating-model.md`、`scripts/README.md`、`workflows/project-initialization.md`、`skills/project-initialization/SKILL.md`、受管上下文 `local/projects/cg-work/project-context.yaml`、三个测试文件全部更新到 `project-context.md`，锚点链接经 `npm run check` 校验无断链。

## 审查意见

- 合并未压缩语义：`project-context.md` 中每条规则可追溯到原三文件对应段落，无删除性改写；新增的只有文件开头一句导航说明。
- 指针化段落均保留了唯一来源的可读入口，未出现"引用指向空承诺"（引用目标均含被引正文）。
- 遗留项：`test/check-project.test.mjs` 2 个存量失败与工作区中前序任务（时间戳工具化、冗余字段删除）的未提交改动不属于本任务范围，不混入本任务提交。

## 集成决定

本地 commit，暂存本任务涉及的 13 个文件与新增 `core/project-context.md`、删除的三文件；不推送。受管项目 `local/projects/cg-work/` 任务记录与规则改动分开提交。

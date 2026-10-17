# 实施方案：移除业务项目登记路径的绝对路径强制校验

## 背景

`check-project.mjs` 在 e321c32 引入 `allowRelativePaths = projectId === 'cg-work'`，要求除框架自身外所有项目的登记路径（`requirements.inbox_path`、文档字段、运行入口、SQL 目录等）必须是绝对路径，否则报错。但这些路径本来就能无歧义地相对 `project.root_path` 解析，该强制校验没有实际收益，且导致两个测试夹具（`接受登记项目仓库内原型路径和入口`、`接受相对 project.root_path 的项目路径`）与规则长期脱节（`npm test` 持续 2 个失败）。用户确认移除该校验。

## 变更清单

1. **校验器** `scripts/check-project.mjs`：
   - 删除 `allowRelativePaths` 开关，相对路径一律相对 `project.root_path` 解析并检查存在性；
   - 删除 `requirements.inbox_path` 的绝对路径强制（保留 basename=`requirements-inbox` 与存在性检查）；
   - `checkAbsolutePaths` 无 `base` 可解析时（如 `submission.instructions`）仍要求绝对路径；
   - 保留有意义的绝对路径要求：`project.root_path`（或 `.`）、`repositories[].root_path`。
2. **规则文档同步**（保持唯一来源自洽）：
   - `core/project-context.md`：字段规范优化规则、需求箱不变量、加载规则段、原型登记段；
   - `core/documentation-standards.md`：路径登记质量要求；
   - `core/project-context.template.yaml`：路径注释；
   - `skills/project-initialization/SKILL.md`：初始化步骤 8/9；
   - `README.md`：`skills.paths` 登记说明。
3. **验证**：`node --test test/check-project.test.mjs` 11/11；`npm test` 45/45；`npm run check` 全绿。

## standards_preflight

- 项目自动检查：`npm run check`、`npm test`
- 当前差异人工检查：仅放宽相对路径解析，`project.root_path` 与 `repositories[].root_path` 的绝对路径约束保留；被合并删除的规则语句全部同步为指针/新表述，无文档残留「除 cg-work 外必须绝对路径」
- 不适用项：业务仓库提交检查（不触碰业务仓库）

# 实施计划

1. 保留现有 `framework:bugfix` 的 `execution_profile: lightweight`，用于根因明确且只恢复既有行为的小型缺陷；该路径仍保留简短 task 证据。
2. 在 `core/operating-model.md` 定义低风险变更：仅文案、样式、静态布局或等效可访问性标记调整；明确其禁止范围和最低验证。
3. 新增 `workflows/low-risk-change.md`，仅要求 `framework:verification-before-completion`，并明确不创建需求箱、task 或自动化测试。
4. 更新 `AGENTS.md`、`README.md`、`core/context-loading.md`、`workflows/README.md`、`workflows/feature-development.md` 和 `workflows/bugfix.md`，使入口在创建 task 前先路由低风险变更。
5. 将版本从 `2.8.0` 升至兼容性新增对应的 `2.9.0`，运行框架结构校验和框架测试；记录无关的既有校验问题。

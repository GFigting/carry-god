---
type: core-rule
id: CGHN-CORE-002
---

# 上下文加载协议

## 渐进式加载

| 场景 | 先读 | 按需读取 |
|---|---|---|
| 新任务 | `AGENTS.md`、工作模型 | 对应流程和模板 |
| 项目注册或首次接入 | `workflow/project-initialization.md`、项目关联表 | 项目自身约定、能力地图、模块索引和 CodeGraph 状态 |
| 需求不清 | `capabilities/clarify-and-brainstorm.md` | 领域资料 |
| 架构设计 | `workflow/software-delivery.md` | `design-deep-modules.md`、按自动路由选择角色文件 |
| 编码实现 | 任务记录、项目约定 | `implement-with-tdd.md`、`code-implementation-standards.md`、按自动路由选择角色文件 |
| Bug 或回归 | 症状和现有测试 | `diagnose-bugs.md` |
| 重构 | 当前结构、影响范围和回归风险 | `workflow/bugfix-and-refactor.md`、`design-deep-modules.md` |
| 审查 | 变更范围和验收标准 | `review-code.md`、按自动路由选择角色文件 |
| 收尾 | 验收标准和验证结果 | `verify-before-completion.md`、`compound-learning.md` |
| 术语或业务规则不清 | 需求、接口和数据定义 | `domain-modeling.md`、项目词汇表 |
| 复杂重构或架构优化 | 当前结构和影响证据 | `architecture-report.md`、Markdown 报告模板 |
| 大型任务 | 目标和关键未知 | `plan-and-dependencies.md`、`triage-and-wayfinding.md` |
| 发布或复盘 | 交付风险和实际结果 | `release-and-retro.md` |
| 代码结构探索 | 项目路径和架构入口 | `adapters/codex/codegraph.md` |
| 下一步判断 | 当前状态、依赖和剩余工作 | `workflow/next-action.md` |

## 加载规则

1. 先加载当前阶段的唯一主流程。
2. 仅在触发条件满足时加载能力模块。
3. 若多个文件重复规定同一行为，以 `core/` 和 `workflow/` 为准。
4. 项目约定优先于通用建议，但不能违反用户明确要求。
5. 发现规则冲突时，记录决策、采用的规则和被舍弃的替代方案。
6. 角色由主会话依据用户意图和当前阶段自动选择；不要求用户输入角色名。
7. 项目索引存在 `required_context` 时，先根据任务范围匹配 `trigger`，读取对应 `documents`，再进入代码修改。
8. `required_context` 中的文档属于编码前置条件；未读取匹配文档时，只允许调查和分析，不得修改项目代码。

## 项目上下文

涉及项目代码时，先读取框架 `registry/project-context.yaml` 中的项目背景、路径、启动入口和健康检测，再读取与任务匹配的 `required_context.documents`，最后按需读取其他 `business_docs`。项目业务规则、词汇表、接口说明和项目专属规范在项目自身 `docs/` 下维护；框架关联表只保存背景、加载触发条件和工作定位信息。项目代码、项目文档、数据库目录和部署目录必须登记为绝对路径。涉及业务概念时，优先使用项目词汇表中的标准术语；发现新术语或歧义时先登记，不在接口和任务中混用同义词。

框架内部能力文件可以使用相对路径；项目关联字段不得使用相对路径、工作目录占位符或依赖当前会话目录的路径。

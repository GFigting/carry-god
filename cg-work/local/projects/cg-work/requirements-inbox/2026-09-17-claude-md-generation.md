# 需求：生成 CLAUDE.md 框架入口说明

- 来源：用户直接指令（2026-09-17）
- 归类：框架优化（framework-optimization）
- 原文：「框架优化：生成一份CLAUD.md文件」

## 诉求

为 `cg-work` 框架补充一份 `CLAUDE.md`，作为 Claude 及兼容 Agent 的自动加载说明，
使这类 Agent 在仓库根目录被加载时能按照框架约定工作。

## 方案确认（2026-09-17 追加）

用户意见「要不然CLAUDE直接引用AGENT.md？」已采纳：`CLAUDE.md` 收敛为**纯路由薄指针**，
只指向 `AGENTS.md` / `README.md` / `core/`，不复制任何规则；同时登记 `scripts/check-all.mjs`
固定文件名白名单与 `core/naming-and-submission.md` 命名约定。

## 约束

- `CLAUDE.md` 是框架自有入口文档，内容须与 `AGENTS.md` / `README.md` / `core/` 一致，
  不引入框架外的规则，不复制项目业务数据或密钥。
- 完整规则以 `AGENTS.md` 与 `README.md` 为准，深层约束指向 `core/`；`CLAUDE.md` 只做浓缩与路由。
- 框架内容默认提交；本文件属于 `cg-work/` 框架内容。
- 不接受用户验收前不得创建 Git 提交（框架维护规则要求验收后提交）。

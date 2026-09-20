# 计划：生成 CLAUDE.md

## 变更地图

- **问题事实**：`cg-work` 当前仅有 `AGENTS.md` 作为 Agent 指令入口；Claude 系 Agent 自动加载的是 `CLAUDE.md`，
  框架缺少该入口，导致此类 Agent 进入仓库时无法直接按框架约定工作。
- **受影响唯一来源**：新增根目录 `CLAUDE.md`（用户两次收敛后最终定为**最小薄指针**：只指向 `AGENTS.md`，不复制规则、不列其他路由）；
  同步登记 `scripts/check-all.mjs` 固定文件名白名单与 `core/naming-and-submission.md` 命名约定。不修改 `AGENTS.md` / `README.md` / 工作流与技能。
- **非目标**：不重写框架规则，不新增工作流/技能，不改动项目业务代码。
- **兼容性**：`CLAUDE.md` 仅做浓缩与路由，全部规则指向既有文件，无破坏性变更。
- **迁移/替代**：无。原 `AGENTS.md` 仍为完整指令来源，`CLAUDE.md` 为其自动加载摘要。

## 实施步骤

1. 以 `AGENTS.md`、`README.md`、`core/operating-model.md`、`core/context-loading.md`、
   `core/special-operations.md`、`core/naming-and-submission.md` 为事实来源，提炼 `CLAUDE.md`。
2. 覆盖：读取顺序、项目上下文唯一来源、任务状态机、工作流选择、目录边界、特殊操作授权、命名与提交、规则优先级、验证诚实性。
3. 创建任务记录与需求箱记录（本任务已建 `task.yaml` 与 `requirements-inbox` 文件）。

## 验证范围

- `node scripts/check-task.mjs` 校验任务记录结构。
- `node scripts/check-all.mjs` 确认未破坏框架结构（CLAUDE.md 不属被校验对象，但需确认无连带错误）。
- 人工核对 `CLAUDE.md` 与 `AGENTS.md` / `README.md` 口径一致。

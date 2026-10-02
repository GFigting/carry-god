# cg-work Agent 说明

本文件只做路由，不复制规则；规则正文以 `README.md` 和 `core/` 为唯一来源。

1. 先读 `README.md`，按其「使用顺序」执行：项目识别门禁 → 项目上下文检查 → 低风险变更判断 → 需求包与任务记录 → 工作流与必需技能 → `review` 阶段统一收尾。
2. 需要规则细节时读 `core/`：`operating-model.md`（对象、状态机、档位、证据生命周期的规则正文）、`context-loading.md`（上下文加载与产物生成）、`naming-and-submission.md`（命名与提交政策正文）、`framework-maintenance.md`（框架自身维护与演进约束）、`special-operations.md`（外部、破坏性、生产、认证、部署或跨会话操作的授权边界）。
3. 任务记录创建或更新后运行 `npm run check`；只校验单个文件时使用 `node scripts/check-task.mjs <task.yaml>` 或 `node scripts/check-project.mjs <project-context.yaml>`。
4. 规则优先级：用户明确要求 > 项目自身规则 > `core/` > `workflows/` > 原始 `skills/` 建议。

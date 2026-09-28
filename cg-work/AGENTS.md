# cg-work Agent 说明

1. 读取 `README.md`，了解框架入口。
2. 读取 `core/operating-model.md` 和 `core/context-loading.md`。
3. 检查 `local/projects/<project-id>/project-context.yaml` 是否存在且有效；否则运行 `framework:project-initialization` 并等待确认。
4. 在创建需求箱或任务前，先按 `core/operating-model.md` 判断是否为低风险变更；符合条件时使用 `framework:low-risk-change`，不创建需求箱、task 或自动化测试，只完成受影响范围的必要验证。
5. 非低风险变更先将原始需求包存入 `local/projects/<project-id>/requirements-inbox/`，再创建或更新 `local/projects/<project-id>/tasks/<task-id>/task.yaml`，初始状态为 `pending`。
6. 从 `workflows/` 选择匹配的工作流，并加载其中声明的所有必需技能。
7. 标准任务在任务记录中保存计划、审查、验证和交接引用；满足 `workflows/bugfix.md` 轻量条件的缺陷以 `task.yaml` 内的精简证据替代这些独立文件。
8. 执行新鲜验证，解决审查发现的问题后，再将任务标记为 `done`。
9. 创建或更新任务记录后，运行 `node scripts/check-task.mjs <path-to-task.yaml>`。
10. 集成前读取 `core/special-operations.md`，了解外部、破坏性、生产、认证、部署或跨会话操作的要求。

用户指令和项目规则优先于框架建议。

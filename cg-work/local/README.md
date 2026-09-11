# 本地项目工作区

本目录保存真实项目上下文、任务、报告、设计和运行产物。`projects/` 下只有 `.gitkeep` 提交到 Git；项目目录中的真实数据不提交。

每个项目使用 `projects/<project-id>/`，任务产物固定放在：

```text
projects/<project-id>/
├── project-context.yaml
├── initialization-report.md
└── tasks/<task-id>/
    ├── task.yaml
    ├── plan.md
    ├── review.md
    └── verification.md
```

初始化报告用于记录探测事实和缺口；任务不需要的产物可以省略，但已有产物必须使用上述固定名称。不要在此目录保存密钥、令牌、密码或生产数据。

任务记录的最小字段：

- `task.yaml`：`id`、`status`、`goal`、`workflow`、`created_at`、`next_action`。
- `plan.md`：范围、验收标准、涉及文件、实施步骤、风险和验证方案。
- `review.md`：审查基线、问题、严重性、处理结论和遗留风险。
- `verification.md`：验证命令、执行时间、结果、证据和未验证项。

任务状态使用 `pending`、`in_progress`、`review`、`done`、`blocked` 或 `cancelled`。计划、审查和验证正文只保存在这里；项目自己的用户文档仍放在项目仓库的 `docs/` 目录。

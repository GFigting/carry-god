# 本地项目工作区

本目录保存真实项目上下文、任务、报告、设计和运行产物。除 `projects/cg-work/` 外，`projects/` 下的真实项目数据不提交；`cg-work` 是框架自身的受管项目，其上下文、任务和框架维护产物可以随框架提交。

无论项目归属如何，`requirements-inbox/` 中的真实需求包、附件和原文都保持本地忽略；只有需求箱的 `README.md` 与 `.gitkeep` 可以提交。`tools/` 保存本机工具副本，也保持本地忽略。

每个项目使用 `projects/<project-id>/`，任务产物固定放在：

```text
projects/<project-id>/
├── project-context.yaml
├── initialization-report.md
├── requirements-inbox/
│   ├── README.md
│   ├── .gitkeep
│   └── <requirement-package>/
├── tasks/<task-id>/
    ├── task.yaml
    ├── plan.md
    ├── review.md
    ├── verification.md
    └── learning.md
└── roadmaps/<roadmap-id>/
    ├── roadmap.yaml
    ├── coverage.md
    └── closure.md
```

初始化报告用于记录探测事实和缺口；任务不需要的产物可以省略，但已有产物必须使用上述固定名称。不要在此目录保存密钥、令牌、密码或生产数据。

`requirements-inbox/` 是原始需求的唯一入口：保存尚未拆分的需求包、附件、原文和澄清材料。一个需求包可以拆分为多个 `tasks/<task-id>/`；任务记录、计划、审查和验证证据不得写回需求箱。需求箱的 `README.md` 和 `.gitkeep` 可以提交，真实需求内容保持本地忽略。

任务记录的最小字段：

- `task.yaml`：`id`、`status`、`goal`、`workflow`、`created_at`、`next_action`；新任务还必须声明 `learning_protocol: v1` 与 `interaction_protocol: v1`。后者配套 `next_user_action.required`、`action`、`message`，用于向用户说明是否需要操作及具体动作。
- `plan.md`：范围、验收标准、涉及文件、实施步骤、风险和验证方案。
- `review.md`：审查基线、问题、严重性、处理结论和遗留风险。
- `verification.md`：验证命令、执行时间、结果、证据和未验证项。
- `learning.md`：执行过程中的候选经验、审查结论、证据、适用范围和沉淀去向；使用学习协议的任务在 `review` 或 `done` 时必须由 `learning_reference` 引用它。

任务状态使用 `pending`、`in_progress`、`review`、`done`、`blocked` 或 `cancelled`。计划、审查和验证正文只保存在这里；项目自己的用户文档仍放在项目仓库的 `docs/` 目录。

`roadmaps/` 仅用于复杂需求的项目级编排：记录从决策地图到研发任务的覆盖、依赖和关闭结论。它不替代 `tasks/`，也不保存原始需求副本。任务可以通过 `roadmap_reference`、`parent_task_reference`、`depends_on`、`requirements_coverage`、`follow_up_task_references` 与 `closure_reference` 建立可选关联；所有路径相对 `task.yaml` 解析。带 `roadmap_reference` 的任务进入 `done` 时必须引用路线图的 `closure.md`。路线图也要维护 `next_user_action`：不能继续推进时明确请求用户决定，可继续时告知下一项由 Agent 推进的任务。

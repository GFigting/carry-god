# 本地项目工作区

本目录保存真实项目上下文、任务、报告、设计和运行产物。除 `projects/cg-work/` 外，`projects/` 下的真实项目数据不提交；`cg-work` 是框架自身的受管项目，其上下文、需求包、任务和框架维护产物随框架提交。

`projects/<业务项目>/requirements-inbox/` 中的需求包、附件和原文保持本地忽略，只有需求箱的 `README.md` 可以提交；`projects/cg-work/requirements-inbox/` 属于框架内容，随框架提交，但不得摘录业务项目真实数据——来源于业务项目的需求包必须留在该项目自己的需求箱。`tools/` 保存本机工具副本，也保持本地忽略。

每个项目使用 `projects/<project-id>/`，任务产物固定放在：

```text
projects/<project-id>/
├── project-context.yaml
├── requirements-inbox/
│   ├── README.md
│   ├── <requirement-package>/
│   └── archive/<requirement-package>/
├── tasks/<task-id>/
    ├── task.yaml
    ├── plan.md
    ├── review.md
    ├── verification.md
    └── learning.md
├── tasks/archive/<task-id>/
│   └── 原任务目录中的完整证据
└── roadmaps/<roadmap-id>/     # 存量双轨保留，不再新建；新大任务用主任务结构
    ├── roadmap.yaml
    ├── coverage.md
    └── closure.md
```

**项目路线图不放在框架本地**：它属于项目文档，存放在原项目仓库内（惯例 `docs/roadmap.md`），路径登记在项目上下文的可选字段 `product.roadmap_path`，格式见 `core/templates/project-roadmap.template.md`，由 `framework:product-management` 维护。框架本地单个大需求的拆分记录在主任务（`role: parent`）自身的 `task.yaml` 与 `plan.md` 中（格式见 `core/templates/parent-plan.template.md`），不是项目路线图。

`initialization-report.md` 自 2026-10-02 起废弃：探测范围、事实来源、缺口和待确认项改记在项目的初始化任务记录（`tasks/<task-id>/`）中，耐久事实写入 `project-context.yaml`。历史报告文件保留原样，不再新增，也不强制迁移。任务不需要的产物可以省略，但已有产物必须使用上述固定名称。不要在此目录保存密钥、令牌、密码或生产数据。

`requirements-inbox/` 是原始需求的唯一入口：保存尚未拆分的需求包、附件、原文和澄清材料，**内容只允许用户手动添加**，Agent 不生成需求包（规则正文见 [需求箱与需求引用](../core/operating-model.md#需求箱与需求引用)）。任务不需要关联需求，需求原文、范围和取舍直接写入任务 `plan.md` 或决策记录；用户已放入对应需求包时可用 `requirements_reference` 复用，一个需求包可以拆分为多个 `tasks/<task-id>/`；任务记录、计划、审查和验证证据不得写回需求箱。业务项目的需求内容保持本地忽略，仅需求箱的 `README.md` 可提交（它同时保证目录非空，不再需要 `.gitkeep`）；框架受管项目 `cg-work` 的需求包随框架提交。

任务记录的最小字段：

- `task.yaml`：`id`、`status`、`goal`、`workflow`、`created_at`、`next_action`；`next_action` 为 `required`、`action`、`message` 对象，用于向用户说明是否需要操作及具体动作。学习记录按需在 `artifacts.learning` 引用，轻量执行任务不得引用。
- `plan.md`：范围、验收标准、涉及文件、实施步骤、风险和验证方案。
- `review.md`：审查基线、问题、严重性、处理结论和遗留风险。
- `verification.md`：验证命令、执行时间、结果、证据和未验证项。
- `learning.md`：执行过程中的候选经验、审查结论、证据、适用范围和沉淀去向；在 `artifacts.learning` 引用了它的任务必须保证文件真实存在。

任务状态使用 `pending`、`in_progress`、`review`、`done`、`blocked` 或 `cancelled`。计划、审查和验证正文只保存在这里；项目自己的用户文档仍放在项目仓库的 `docs/` 目录。

大任务的拆分记录在主任务中：主任务 `task.yaml` 声明 `role: parent` 并以 `decisions` 保存决策，`plan.md` 保存需求覆盖、排除范围、依赖与遗留（格式见 `core/templates/parent-plan.template.md`）；子任务通过 `parent_reference` 挂靠，所有路径相对 `task.yaml` 解析，集合以该反向关系为准。主任务也维护 `next_action`：不能继续推进时明确请求用户决定，可继续时告知下一项由 Agent 推进的子任务；全部子任务终态并完成集成核对后主任务才进入验收关闭，关闭不删除子任务证据。存量 `roadmaps/` 三件套（lasen、job-hunt、cg-work 项目）双轨保留可继续读写，但不再新建，迁移按项目另立任务进行。

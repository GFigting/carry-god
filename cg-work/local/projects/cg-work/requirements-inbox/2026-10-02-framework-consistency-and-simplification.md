# 需求包：框架一致性收敛与简化

- 日期：2026-10-02
- 来源：用户指令「优化简化」，基于 2026-10-02 框架体检结论
- 状态：原始需求，未拆分

## 原始诉求

用户先要求评估当前框架需要优化的地方，在收到体检结论后指令「优化简化」，即按体检结论修复框架内部矛盾，并降低规则重复与流程叙述的复杂度。

## 体检事实（需求依据）

1. 入口文档漂移：`AGENTS.md` 与 `README.md`、`core/context-loading.md` 不一致——缺 `framework:project-discovery` 门禁；需求箱写成"每次新建"而非"复用优先"；`done` 前缺 review 统一收尾口径；缺 compact 产物档、原型门禁、`next_user_action`、路线图和 documentation 门禁；校验入口只提 `check-task.mjs`。
2. 同一提交政策在 6 个文件中重复（README、framework-maintenance、naming-and-submission、workflows/README、feature-development、bugfix），措辞已漂移，违反 `core/README.md` 声明的唯一来源原则；`test/submission-rules.test.mjs` 反而把该重复固化为断言。
3. 提交与忽略策略三方矛盾：README 说 `local/projects/` 任务不提交；`.gitignore` 允许提交 `local/projects/cg-work/**`；framework-maintenance 说不得把 `local/projects/` 任务记录混入提交。同时 `.gitignore` 注释声明 cg-work 需求箱保持本地，但已有 2 个需求包被追踪并推送。
4. 校验缺口（实测）：120 个任务记录中 14 个校验失败，其中 8 个是随框架提交的 cg-work 任务，`requirements_reference` 指向的需求包从未提交、本机也不存在；lasen 6 个为本地业务项目记录。
5. `check-project.mjs` 要求 `root_path` 绝对，但框架自身上下文是提交进仓库的，内含某台机器的绝对路径，无法跨机使用；该脚本在 `root_path` 无效时输出误导性报错。
6. 文档自身缺陷：`core/context-loading.md` 整段重复；`core/README.md` 索引不全；`README.md` 使用顺序编号重复。

## 约束

- 框架内容不得混入业务项目真实数据；业务项目的 `local` 记录保持本地。
- 历史任务不迁移、不删除，保留替代说明。
- 框架变更需用户验收后才提交。

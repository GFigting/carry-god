# 技能索引

本目录包含三类技能：框架自有技能、框架本地化技能和原始技能镜像。原始镜像的内容和附属资源不在 `cg-work` 中修改；镜像同步检查使用 `scripts/check-skills.mjs`，不属于日常框架检查。

框架自有技能包括 `project-initialization`、`framework-optimization` 与 `large-task-decomposition`，由本框架维护，不参与镜像哈希校验。`large-task-decomposition` 只定义本地路线图与归档约定，分别引用原始镜像技能 `wayfinder` 和 `to-tickets`，不复制其正文。

框架本地化技能包括 `baoyu-design`。它复用上游设计方法，但其目录与任务记录规则由 cg-work 维护，因此不参与 `scripts/check-skills.mjs` 的镜像哈希校验。

## 核心技能

核心技能用于日常开发闭环，按工作流声明加载：

`brainstorming`、`writing-plans`、`codebase-design`、`domain-modeling`、`research`、`test-driven-development`、`systematic-debugging`、`code-review`、`verification-before-completion`、`requesting-code-review`、`receiving-code-review`、`using-git-worktrees`。

## 特殊技能

特殊技能只在特定场景主动触发：

`improve-codebase-architecture`、`grilling`、`grill-with-docs`、`handoff`、`to-questionnaire`、`wayfinder`、`to-spec`、`to-tickets`、`large-task-decomposition`、`resolving-merge-conflicts`、`prototype`、`baoyu-design`、`dispatching-parallel-agents`、`subagent-driven-development`、`executing-plans`、`writing-skills`、`gstack-review`、`qa-only`、`finishing-a-development-branch`。

## 来源快照

本次镜像来源均来自当前仓库，来源快照提交为 `5997d6fbf0f34317c9d800afce90563e3180220e`。具体映射和校验规则见 `scripts/check-skills.mjs`；新增或同步技能时只更新该映射和本节快照信息，不修改镜像内容。

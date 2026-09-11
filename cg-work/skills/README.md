# 技能索引

本目录包含两类技能：框架自有技能和原始技能镜像。原始镜像的内容和附属资源不在 `cg-work` 中修改；镜像同步检查使用 `scripts/check-skills.mjs`，不属于日常框架检查。

框架自有技能目前只有 `project-initialization`，由本框架维护，不参与镜像哈希校验。

## 核心技能

核心技能用于日常开发闭环，按工作流声明加载：

`brainstorming`、`writing-plans`、`codebase-design`、`domain-modeling`、`research`、`test-driven-development`、`systematic-debugging`、`code-review`、`verification-before-completion`、`requesting-code-review`、`receiving-code-review`、`using-git-worktrees`。

## 特殊技能

特殊技能只在特定场景主动触发：

`improve-codebase-architecture`、`grilling`、`grill-with-docs`、`handoff`、`to-questionnaire`、`wayfinder`、`to-spec`、`to-tickets`、`resolving-merge-conflicts`、`prototype`、`dispatching-parallel-agents`、`subagent-driven-development`、`executing-plans`、`writing-skills`、`gstack-review`、`qa-only`、`finishing-a-development-branch`。

## 来源快照

本次镜像来源均来自当前仓库，来源快照提交为 `5997d6fbf0f34317c9d800afce90563e3180220e`。具体映射和校验规则见 `scripts/check-skills.mjs`；新增或同步技能时只更新该映射和本节快照信息，不修改镜像内容。

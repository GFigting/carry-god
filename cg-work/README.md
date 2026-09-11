# cg-work

`cg-work` 是内部 AI 软件开发框架的唯一推荐入口。它提供核心规则、按开发意图选择的工作流、原始技能镜像、项目上下文和结构校验。框架自有说明使用中文；镜像技能保持上游原样。

## 使用顺序

1. 读取 `AGENTS.md` 和本文件。
2. 检查 `local/projects/<project-id>/project-context.yaml`；缺失或失效时先执行项目初始化并等待确认。
3. 创建 `local/projects/<project-id>/tasks/<task-id>/task.yaml`，初始状态为 `pending`。
4. 从 `workflows/` 选择功能、缺陷、重构或审查流程。
5. 按流程声明加载 `skills/` 中的 required skills。
6. 在同一任务目录保存计划、审查、验证证据、风险和下一步行动。
7. 通过新鲜验证和审查后，再确定集成方式并将任务标记为 `done`。
8. 运行 `scripts/check-all.mjs`，确认框架结构和工作流引用有效；任务或项目上下文更新后分别运行 `scripts/check-task.mjs` 和 `scripts/check-project.mjs`；维护技能镜像时另行运行 `scripts/check-skills.mjs`。

工作流使用 `framework:<skill-name>` 引用框架技能，使用 `project:<skill-name>` 引用项目技能。项目技能目录由项目上下文的 `skills.paths` 指定，并相对于项目根路径解析。

## 目录边界

| 目录 | 唯一职责 |
|---|---|
| `core/` | 核心对象、上下文、命名、提交和维护规则 |
| `workflows/` | 按开发意图的流程和技能引用 |
| `skills/` | 框架自有技能与原始技能镜像；镜像不作本地改写 |
| `scripts/` | 结构、命名、链接和镜像一致性校验 |
| `local/` | 项目上下文和本地产物，不提交真实数据 |

## 提交规则

`cg-work/` 内框架内容默认全部提交；只有 `local/projects/` 下的真实项目数据、任务、报告和运行产物不提交。项目业务规则、密钥和生产数据不得写入框架。

项目上下文只有一个来源：`local/projects/<project-id>/project-context.yaml`。不要在工作流、技能或其他目录复制一份项目上下文。

## 规则优先级

用户明确要求 > 项目自身规则 > `core/` > `workflows/` > 原始 `skills/` 建议。

旧 `cg-harness` 和 `cg-harness-new` 保留为 legacy，不再新增功能。

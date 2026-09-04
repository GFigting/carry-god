---
type: template
id: TPL-TASK-FEATURE
title: 功能开发任务模板
aliases: [Feature Task]

tags:
  - type/template
created: 2026-05-24
---

# 功能开发任务模板

> 基于 [[.obsidian/templates/tpl-task|通用任务模板]]，适用于新功能开发场景。

使用方式：复制下方 frontmatter 到新任务文件，填入具体内容。

```yaml
---
type: task
task_id: ""
title: ""
status: draft
work_type: "[[WT-新功能开发]]"
process: "[[PROC-需求到上线]]"
task_nature: delivery
progress_policy: milestone_only

creator: ""
assignee: ""
reviewer: ""

depends_on: []
blocks: []
parent_task: ""

priority: P2
estimated_hours: 0
actual_hours: 0
due_date: ""
sprint: ""

summary: ""
acceptance_criteria: []
artifacts: []

tags:
  - type/task
  - status/draft
  - work/development
---
```

## 任务性质字段

| 字段 | 可选值 | 用途 |
|------|--------|------|
| `task_nature` | `delivery` / `integration_revision` / `investigation` / `review` / `test_data` | 区分主交付、持续集成修订、调研、审核、测试数据等不同任务性质 |
| `progress_policy` | `milestone_only` / `change_log_allowed` | 控制任务进度是否只由里程碑推进，还是允许通过修订日志累积追踪 |

默认规则：
- 主任务使用 `task_nature: delivery` + `progress_policy: milestone_only`，只有主验收标准或阶段里程碑满足时才推进完成度。
- TL/asNormal 的小修、联调补丁、测试数据修正使用 `task_nature: integration_revision` + `progress_policy: change_log_allowed`，记录修订但不自动推进主任务完成度。
- 测试数据准备或修订如用于验证主流程，使用 `task_nature: test_data`，并在验证通过后由 TL 决定是否影响阶段状态。

## TL 直接修订记录

> TL 或 asNormal 在职责范围内直接完成的小修、小补充、联调修正，必须记录在这里。此记录默认不推进主任务完成度，除非明确关联到某个验收标准或阶段里程碑。

```markdown
### YYYY-MM-DD — {修订主题}

- 任务性质：integration_revision
- 修订范围：{涉及项目/模块/文件}
- 修订原因：{触发原因或用户反馈}
- 修订内容：
  - {改了什么}
- 影响判断：{不影响主进度 / 满足某验收标准 / 解除某阻塞}
- 验证结果：{编译/测试/页面验证/未验证原因}
- 后续动作：{无需派发 / 派发审核 / 派发测试数据 / 派发测试验证}
```

## TL 派发决策记录

> TL 判断需要独立视角、测试数据、验证或专业角色介入时，在这里记录派发决策。未派发也应记录理由，避免后续追溯时无法判断当时取舍。

```markdown
### YYYY-MM-DD — {派发主题}

- 触发来源：{问题记录 / 计划调整 / 独立审核 / 测试数据 / 验证}
- TL 判断：{为什么需要或不需要派发}
- 派发角色：{代码审核员/系统架构师/后端开发工程师/测试工程师/无}
- 上下文包：{任务文件、产物工件、代码路径、验收标准}
- 验收标准：{本次派发完成的判定}
- 状态：{待派发/已派发/已回收/无需派发}
```

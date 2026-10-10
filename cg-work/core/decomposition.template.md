# 路线图模板

大任务的路线图只在其唯一位置 `local/projects/<project-id>/roadmaps/<roadmap-id>/` 保存三个文件。本文件是三者唯一的格式来源。

## `roadmap.yaml`

```yaml
id: <roadmap-id>
status: active
destination: <完成后可交付或可决策的结果>
requirements_reference: <相对 requirements-inbox 的原始需求包路径>
decisions:
  confirmed: []
  open: []
  out_of_scope: []
task_references: []
dependencies: []
coverage_reference: coverage.md
closure_reference: null
next_user_action:
  required: false
  action: <用户需要执行的动作；无操作时为 continue_progress>
  message: <面向用户的一句明确提示>
```

## `closure.md`

```markdown
# 路线图关闭记录

## 完成结论

说明目标是否达成；未达成时明确原因。

## 需求覆盖

链接 `coverage.md`，并说明未覆盖或延后条目。

## 任务与依赖状态

列出已完成、取消、阻塞或转交的任务及依赖处置。

## 遗留与后续

记录风险、后续任务引用与责任边界；没有则明确写“无”。

## 归档索引

列出决策地图、原始需求包和关键交付证据的引用。
```

`coverage.md` 为每条可验收需求指定一个结果：子任务、已关闭决策、明确延期或排除；不得用“待处理”作为关闭结论。流程见 [大任务拆分与关闭](../skills/large-task-decomposition/SKILL.md) 与 [工作模型的路线图](operating-model.md#大任务路线图)。

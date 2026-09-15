---
name: large-task-decomposition
description: Use when a confirmed multi-session requirement must be converted from Wayfinder decisions into a local cg-work roadmap, independently verifiable child tasks, coverage evidence, and a durable closure record.
---

# 大任务拆分与关闭

## 目的

本技能只定义 `cg-work` 的本地落盘和转换约定；决策地图的方法由原始镜像技能 `framework:wayfinder` 定义，纵向研发切片的方法由 `framework:to-tickets` 定义。不得复制或改写这两个镜像技能的正文。

## 何时使用

在以下条件同时成立时使用：长期范围已由用户确认；`wayfinder` 的关键决策已关闭或明确延后；需求仍包含多个可独立验收的研发切片。

若关键决策未明确，返回 `framework:wayfinder`；若只剩一个可独立验收的任务，直接创建普通任务，不创建路线图。

## 目录与引用

在 `local/projects/<project-id>/roadmaps/<roadmap-id>/` 创建：

| 文件 | 职责 |
| --- | --- |
| `roadmap.yaml` | 目标、需求入口、已决策/待决策项、任务清单和依赖 |
| `coverage.md` | 原始需求条目到任务、决策或延后项的覆盖映射 |
| `closure.md` | 关闭结论、完成度、遗留与后续索引 |

以 `core/roadmap.template.yaml` 创建 `roadmap.yaml`；以 `core/roadmap-closure.template.md` 创建关闭记录。原始需求仍只存于 `requirements-inbox/`，研发证据仍只存于 `tasks/<task-id>/`。

## 转换规则

1. 在 `roadmap.yaml` 写入 destination、原始需求引用、已确认决策、仍未明确的范围和排除项。每个决策保留 Wayfinder 票据名称与其本地或外部引用。
2. 在 `coverage.md` 为每条可验收需求指定一个结果：子任务、已关闭决策、明确延期或排除。不得用“待处理”作为关闭结论。
3. 为每个研发切片创建独立 `tasks/<task-id>/task.yaml`，使用相应研发工作流。子任务可写入 `roadmap_reference`、`parent_task_reference`、`depends_on`、`requirements_coverage` 与 `follow_up_task_references`；所有路径相对任务记录解析。
4. 依赖只表达真实前置条件。任务不得依赖自身；任务与路线图引用必须存在。
5. 关闭路线图前核对所有覆盖条目和依赖；在 `closure.md` 记录完成结论、未完成项、后续任务和证据索引。已完成的路线图关联任务须在 `task.yaml` 以 `closure_reference` 指向该记录。
6. 每次前沿任务变化后更新 `next_user_action`。若需用户决策、验收或外部输入，写 `required: true` 和一个明确动作；若无需操作，写 `required: false` 并明确 Agent 将继续推进的任务。不得仅保留内部 `next_action` 而不向用户说明。

## 常见错误

- 把 Wayfinder 决策票据当研发任务：决策不明时应继续探索，而非创建实现任务。
- 把任务目录移动到 `roadmaps/`：任务路径是历史证据的稳定地址，路线图只引用它。
- 只列子任务、不标原始需求覆盖：无法判断“做完了什么”是否等于“需求是否完成”。
- 用关闭记录掩盖未完成内容：遗留项应保留并创建后续任务引用或明确取消理由。

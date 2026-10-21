---
name: parent-child-decomposition
description: Use when a confirmed multi-session requirement must be split into a parent task that carries decisions and requirement coverage in its own records, independently verifiable child tasks linked by parent_reference, and a durable closeout inside the parent's review.
---

# 大任务主从拆分与关闭

## 目的

本技能定义 `cg-work` 大任务的主从扁平结构约定：大任务是一个**主任务**，拆分清单、需求覆盖与决策全部归宿在主任务自身的 `task.yaml` 与 `plan.md`，子任务通过 `parent_reference` 挂靠，不建立独立索引目录。决策地图的方法由原始镜像技能 `framework:wayfinder` 定义，纵向研发切片的方法由 `framework:to-tickets` 定义；不得复制或改写这两个镜像技能的正文。

## 何时使用

在以下条件同时成立时使用：长期范围已由用户确认；需求仍包含 **2 个以上**可独立验收的研发切片；且无法作为单个任务验收（跨模块、跨会话或验收边界分散）。

只剩一个切片时直接创建普通任务，不建主任务。关键决策模糊时先按下方「决策分级」处理，不必等决策全部关闭才拆。

## 结构

主任务与其他任务一样放在 `tasks/<task-id>/`，通过两个字段声明结构：

- 主任务 `task.yaml` 声明 `role: parent`；配合 `scope_decision` 区分**可验收型**（自己承担集成/验收工作，走完整状态机）与**容器型**（仅分组，全部子任务终态并完成集成核对后关闭）。
- 子任务 `task.yaml` 声明 `parent_reference: ../<main-task-id>/task.yaml`，相对任务记录解析。子任务集合以 `parent_reference` 反向关系为准，**不维护第二份任务清单**。

主任务 `plan.md` 承载原三件套索引的全部内容：

| 章节 | 职责 |
| --- | --- |
| `## 需求覆盖与拆分` | 每条原始需求 → 子任务、已关闭决策、明确延期或排除；不得用「待处理」作结论 |
| `## 排除范围` | 明确不做的边界（原 out_of_scope） |
| `## 依赖关系` | 子任务间真实前置条件；状态不在此复制，以各 `task.yaml` 实时状态为准 |
| `## 遗留与后续` | 主任务 `review` 阶段写入完成结论、未完成项、后续任务与证据索引 |

已确认决策写入主任务 `task.yaml` 的 `decisions` 字段（`name`/`detail` 必填，可选 `confirmed_by`/`confirmed_at`）。

## 决策分级

1. **决策已清楚**：直接在主任务 `decisions` 记录结论，plan 写覆盖章节，随即创建子任务；跳过 wayfinder。
2. **决策模糊**（多方案取舍、范围不清、影响面大）：先用 `framework:wayfinder` 探索，票据结论回填主任务 `decisions` 后再拆。wayfinder 票据不落盘为长期索引，**决策结论以主任务记录为唯一归宿**，在 `detail` 中注明来源。
3. **实施中发现新切片**：直接创建任务挂 `parent_reference`，主任务 plan 覆盖章节补一行；不新建任何索引文件。

## 推进与关闭

1. 每次前沿子任务变化后更新主任务 `next_action`。存在子任务等待验收、停滞或需要范围确认时必须 `required: true` 并给出明确动作，不得静默等待；无需用户操作时写明 Agent 将继续推进哪个子任务。
2. 全部子任务进入终态（`done`/`cancelled`）后，主任务完成集成核对并进入 `review`，在审查记录写完成结论、遗留与后续。
3. 关闭主任务不删除、不移动子任务证据；子任务完成不自动关闭主任务。
4. 原始需求仍只存于 `requirements-inbox/`（用户手动添加），研发证据仍只存于各自 `tasks/<task-id>/`。

## 存量说明

框架存量路线图（`roadmaps/<roadmap-id>/` 三件套）双轨保留、可继续读写，但**不再新建**；新大任务一律使用本结构。存量迁移按项目另立任务逐个进行。

## 常见错误

- 把 Wayfinder 决策票据当研发任务：决策不明时应继续探索，而非创建实现任务。
- 在主任务 plan 复制子任务状态：状态快照会腐烂，只在覆盖表写任务名与分工，状态以子任务 `task.yaml` 为准。
- 只列子任务、不标原始需求覆盖：无法判断"做完了什么"是否等于"需求是否完成"。
- 用关闭结论掩盖未完成内容：遗留项应保留并创建后续任务引用或明确取消理由。
- 为子任务再建中间索引目录：主任务已是唯一索引，`parent_reference` 反向关系即任务集合。

---
type: workflow
id: CGHN-WF-002
---

# 任务生命周期

```text
draft -> awaiting_confirmation -> ready -> in_progress -> review -> done
                                  |          |              |
                                blocked   blocked         revision
                                  |                         |
                               cancelled <------------------+
```

## 状态要求

| 状态 | 进入条件 | 必填信息 |
|---|---|---|
| `draft` | 想法或问题刚记录 | 背景、目标 |
| `awaiting_confirmation` | 需要计划且计划已输出，等待人工确认 | 计划、默认判断、待确认决策、复核结果（如适用） |
| `ready` | 范围和验收标准清楚，计划已人工确认，且每条 `AC-*` 已映射到切片和验证方式 | 负责人、依赖、确认记录、计划、需求追踪基线 |
| `in_progress` | 已开始执行 | 当前步骤、变更记录 |
| `blocked` | 外部条件阻止继续 | 阻塞原因、解除条件 |
| `review` | 产出已完成，追踪表已回填 | 证据、需求追踪表、待审查项 |
| `revision` | 审查发现需要返工 | 审查意见、修复范围 |
| `done` | 验收标准满足且已完成对应 Git 提交（无文件变更除外） | 验证结果、风险、产出、提交标题 |
| `cancelled` | 任务不再需要或无法继续 | 取消原因 |

`blocked` 表示外部阻碍，`revision` 表示质量或需求不满足。不得用 `done` 掩盖未验证状态。

`awaiting_confirmation` 的允许活动和实施门禁以 `workflow/software-delivery.md` 为准。无需计划的小范围任务可从 `draft` 直接进入 `ready`，但仍须记录采用的默认判断和待确认事项。

## 下一步行动

每次状态变化都必须更新下一步行动。下一步不是泛泛的“继续处理”，而是一个可执行动作：

| 当前情况 | 下一步示例 |
|---|---|
| `draft` | 补充验收标准并确认范围 |
| `awaiting_confirmation` | 获取人工确认或按反馈修订计划 |
| `ready` | 执行第一个计划切片 |
| `in_progress` | 完成当前切片并运行覆盖测试 |
| `blocked` | 获取缺失接口文档，解除阻塞 |
| `review` | 由质量角色检查变更并返回发现 |
| `revision` | 按审查意见修复并重新验证 |
| `done` | 发布、同步文档或沉淀经验 |

每条下一步记录必须说明：`动作`、`负责人`、`前置条件`、`产出`、`完成标准`和`预计顺序`。

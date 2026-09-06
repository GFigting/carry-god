---
type: workflow
id: CGHN-WF-002
---

# 任务生命周期

```text
draft -> ready -> in_progress -> review -> done
                         |          |
                       blocked   revision
                         |          |
                      cancelled <-+
```

## 状态要求

| 状态 | 进入条件 | 必填信息 |
|---|---|---|
| `draft` | 想法或问题刚记录 | 背景、目标 |
| `ready` | 范围和验收标准清楚 | 负责人、依赖、计划 |
| `in_progress` | 已开始执行 | 当前步骤、变更记录 |
| `blocked` | 外部条件阻止继续 | 阻塞原因、解除条件 |
| `review` | 产出已完成 | 证据、待审查项 |
| `revision` | 审查发现需要返工 | 审查意见、修复范围 |
| `done` | 验收标准满足 | 验证结果、风险、产出 |
| `cancelled` | 任务不再需要或无法继续 | 取消原因 |

`blocked` 表示外部阻碍，`revision` 表示质量或需求不满足。不得用 `done` 掩盖未验证状态。

# 工作模型

核心对象为 Goal、Task、Context、Plan、Evidence、Artifact、Decision 和 NextAction。

任务状态为：

```text
pending -> in_progress -> review -> done
```

异常状态为 `blocked` 和 `cancelled`。验证失败或审查发现问题时回到 `in_progress`，不新增 `revision` 状态。

状态门禁：

- `pending`：目标、范围和验收标准已记录，尚未开始实施。
- `in_progress`：已满足执行前置条件，正在设计、编码或测试。
- `review`：实现已完成，必须有审查记录和新鲜的验证证据。
- `done`：验证通过、审查结论已处理、用户接受结果，并已确定保留、合并、推送或暂缓集成方式。
- `blocked`：缺少信息、权限、环境或外部依赖；记录阻塞原因和解除条件。
- `cancelled`：用户明确取消；记录取消原因和已有产物位置。

允许的状态转移：

| 当前状态 | 可转移到 |
|---|---|
| `pending` | `in_progress`、`blocked`、`cancelled` |
| `in_progress` | `review`、`blocked`、`cancelled` |
| `review` | `in_progress`、`done`、`blocked`、`cancelled` |
| `blocked` | `pending`、`in_progress`、`cancelled` |
| `done` | 无；后续变更创建新任务 |
| `cancelled` | 无；重新开始时创建新任务 |

不得跳过 `review` 直接进入 `done`。`done` 和 `cancelled` 是终态。

小任务使用最小充分流程；跨模块、不确定或高风险任务增加计划、审查或专门技能，但不改变状态机。用户确认和项目规则优先，技能不能自行改变状态。

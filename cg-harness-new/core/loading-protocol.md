---
type: core-rule
id: CGHN-CORE-002
---

# 上下文加载协议

## 渐进式加载

| 场景 | 先读 | 按需读取 |
|---|---|---|
| 新任务 | `AGENTS.md`、工作模型 | 对应流程和模板 |
| 需求不清 | `capabilities/clarify-and-brainstorm.md` | 领域资料 |
| 架构设计 | `workflow/software-delivery.md` | `design-deep-modules.md`、角色文件 |
| 编码实现 | 任务记录、项目约定 | `implement-with-tdd.md` |
| Bug 或回归 | 症状和现有测试 | `diagnose-bugs.md` |
| 审查 | 变更范围和验收标准 | `review-code.md` |
| 收尾 | 验收标准和验证结果 | `verify-before-completion.md`、`compound-learning.md` |

## 加载规则

1. 先加载当前阶段的唯一主流程。
2. 仅在触发条件满足时加载能力模块。
3. 若多个文件重复规定同一行为，以 `core/` 和 `workflow/` 为准。
4. 项目约定优先于通用建议，但不能违反用户明确要求。
5. 发现规则冲突时，记录决策、采用的规则和被舍弃的替代方案。

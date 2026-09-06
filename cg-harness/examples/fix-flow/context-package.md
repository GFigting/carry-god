# Context Package Example

```yaml
context_package:
  project:
    name: order-ui
    path: "example/project"
    tech_stack: [TypeScript, React]
  task:
    goal: GOAL-EXAMPLE
    task: TASK-FIX-001
    intent: "修复订单详情页保存后金额显示未更新的问题"
  scope:
    include: ["金额状态刷新", "回归测试"]
    exclude: ["金额计算规则"]
  architecture:
    entrypoints: ["订单详情页"]
    relevant_files: ["src/pages/order-detail/amount.ts", "src/pages/order-detail/amount.test.ts"]
    dependencies: ["保存接口"]
  rules:
    preserve: ["金额计算规则", "接口结构"]
    forbidden_changes: ["其他订单模块"]
    operational_constraints: ["不修改数据库"]
  decisions: ["在保存成功回调刷新状态"]
  evidence:
    source_paths: ["examples/fix-flow/task.yaml"]
  gaps: []
```

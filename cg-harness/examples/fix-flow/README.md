# CG Fix Flow Example

这是一个 `/cg-fix` 的完整任务记录示例，展示自有技能链、证据分类和外部能力降级。

## Flow

```text
cg.intake -> cg.reproduce -> cg.diagnose -> cg.implement -> cg.verify -> cg.learn
```

## Key Rules

- 用户请求的是错误行为修复，因此不能路由为 refactor。
- 外部调查能力不可用时，使用 `cg.diagnose` 的内置最低流程。
- `done` 只能在复现、根因、修复和回归证据齐备后设置。
- 示例中的路径和命令是演示数据，不代表已经在真实项目执行。

## Evidence Summary

| Stage | Evidence | Result |
|---|---|---|
| Intake | expected/actual behavior in task record | recorded |
| Reproduce | minimal reproduction steps | passed |
| Diagnose | call-chain log and rejected hypothesis | recorded |
| Implement | changed file list and patch reference | recorded |
| Verify | regression test and rerun reproduction | passed |
| Learn | reusable validation rule | captured |

## Fallback Summary

```yaml
fallback:
  requested: gstack:investigate
  selected: cg.diagnose
  mode: builtin
  reason: "external adapter unavailable in this environment"
  capability_gap: "No automated browser/session investigation"
```

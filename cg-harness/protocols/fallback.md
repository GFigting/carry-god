# Capability Fallback

External capabilities improve execution but do not own task semantics.

## Resolution Order

1. Use the requested CG Harness skill contract.
2. Select the preferred installed adapter.
3. If unavailable, select an equivalent adapter.
4. If no adapter exists, execute the skill's built-in minimum procedure.
5. If the minimum procedure cannot run, return `unavailable` and keep the task record.

## Required Record

```yaml
fallback:
  requested: superpowers:systematic-debugging
  selected: cg.diagnose
  mode: equivalent | builtin | unavailable
  reason: "provider not installed"
  capability_gap: "No automated trace collection"
```

## Prohibited Behavior

- Never claim a missing provider ran.
- Never silently change the task type because a provider is missing.
- Never mark a task done solely because a provider returned text.
- Never discard the original requested capability or fallback reason.

## Quality Rule

A fallback may reduce depth or automation, but it must preserve scope, output shape, evidence classification, and completion gates.

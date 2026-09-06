# Context Package

A context package is the smallest sufficient bundle an Agent needs to act without rediscovering project rules.

## Required Sections

```yaml
context_package:
  project:
    name: ""
    path: ""
    tech_stack: []
  task:
    goal: GOAL-XXX
    task: TASK-XXX
    intent: ""
  scope:
    include: []
    exclude: []
  architecture:
    entrypoints: []
    relevant_files: []
    dependencies: []
  rules:
    preserve: []
    forbidden_changes: []
    operational_constraints: []
  decisions: []
  evidence:
    source_paths: []
  gaps: []
```

## Loading Rules

1. Load project identity and local instructions first.
2. Load only files relevant to the task surface.
3. Keep inferred facts under `gaps` or `open_questions` until confirmed.
4. Record source paths for architecture and policy claims.
5. Refresh the package when scope, project, or assumptions change.

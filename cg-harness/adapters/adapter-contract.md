# Adapter Contract

Adapters connect optional external capabilities to CG Harness. They do not own Task state.

## Input

```json
{
  "task": "TASK-001",
  "capability": "cg-debug",
  "context": [],
  "acceptance": []
}
```

## Output

```json
{
  "capability": "cg-debug",
  "provider": "optional-provider/name",
  "result": "completed | failed | unavailable | fallback",
  "artifacts": [],
  "evidence": [],
  "risks": [],
  "fallback": null
}
```

Adapters may read project files and invoke their provider, but all evidence must be registered through the CG CLI. They must never write `task.json` status directly or claim `done`. When a provider is unavailable, return `unavailable` or `fallback` with the replacement capability and reason.

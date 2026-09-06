# Skill Contract

## Contract Identity

Every CG Harness skill has a stable `id` and `version`. The skill owns its procedure, but the harness owns task state and evidence semantics.

## Required Input Envelope

```yaml
skill_id: cg.verify
skill_version: 1
run_id: RUN-XXX
task:
  id: TASK-XXX
  type: work | fix | refactor | optimize | prototype | review
  status: in_progress
context:
  package_ref: path/to/context.md
acceptance: []
prior_evidence: []
constraints: []
```

## Required Output Envelope

```yaml
skill_id: cg.verify
run_id: RUN-XXX
result: passed | failed | partial | blocked | unavailable
outputs: []
evidence: []
changed_files: []
remaining_risk: []
next_action: ""
```

## Runtime Compatibility

The CLI machine truth remains the existing JSON task model:

- `acceptance[]` items use `{ id, text }`.
- `evidence[]` items use `{ id, kind, path, acceptance, result }`.
- The richer Markdown task template may group evidence by category, but adapters and the CLI must flatten it into the JSON shape before validation.
- `criterion` in the Markdown template maps to CLI `text`.
- Category names such as `verification` map to CLI `kind` values such as `test`, `command`, `manual`, `screenshot`, or `measurement`.

This keeps the new skill contracts compatible with `task.json`, `schemas/*.schema.json`, and the existing CLI tests.

## Rules

- A skill may update only its declared output and allowed side effects.
- A skill must report unavailable capabilities instead of fabricating execution.
- A provider response is an input or observation, not completion evidence by itself.
- Every output must be traceable to the task and run id.
- Skills may request a status transition but may not silently perform one that violates the status protocol.

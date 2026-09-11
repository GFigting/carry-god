# cg-work Agent Instructions

1. Read `README.md` for the framework entrypoint.
2. Read `core/operating-model.md` and `core/context-loading.md`.
3. Check whether `local/projects/<project-id>/project-context.yaml` exists and is valid; otherwise run `framework:project-initialization` and wait for confirmation.
4. Create or update `local/projects/<project-id>/tasks/<task-id>/task.yaml` with status `pending`.
5. Select the matching workflow from `workflows/` and load every required skill declared by it.
6. Keep the plan, review, verification evidence, and handoff references in that task record.
7. Run fresh verification, resolve review findings, and only then mark the task `done`.
8. Run `node scripts/check-task.mjs <path-to-task.yaml>` after creating or updating a task record.
9. Before integration, read `core/special-operations.md` for external, destructive, production, authentication, deployment, or cross-session operations.

User instructions and project rules take precedence over framework suggestions.

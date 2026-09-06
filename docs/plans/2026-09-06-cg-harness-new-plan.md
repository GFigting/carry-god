# cg-harness-new Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a self-contained, host-neutral software development framework based on a simplified GGFrame governance model and selected reusable engineering skills from the other repository folders.

**Architecture:** GGFrame remains the source of truth for goals, tasks, roles, workflow gates, artifacts, and metadata. Mature skills from `skills`, `superpowers`, and `compound-engineering-plugin` are rewritten as focused capability modules and attached to workflow stages. The new directory is independent of all source directories and provides a Codex-first loading adapter.

**Tech Stack:** Markdown, YAML, plain-text registry files; no runtime dependencies or installer in v1.

---

### Task 1: Define the compact framework contract

**Files:**
- Create: `cg-harness-new/README.md`
- Create: `cg-harness-new/AGENTS.md`
- Create: `cg-harness-new/core/operating-model.md`
- Create: `cg-harness-new/core/loading-protocol.md`

**Steps:**
1. Define the framework purpose, boundaries, and default Tech Lead behavior.
2. Define progressive context loading so agents do not preload every document.
3. Define the distinction between governance rules, workflow stages, and optional capabilities.
4. Verify that the contract contains no project-specific paths or source-directory dependencies.

### Task 2: Add the GGFrame-derived workflow model

**Files:**
- Create: `cg-harness-new/workflow/software-delivery.md`
- Create: `cg-harness-new/workflow/task-lifecycle.md`
- Create: `cg-harness-new/workflow/quality-gates.md`
- Create: `cg-harness-new/templates/task-feature.md`
- Create: `cg-harness-new/templates/task-bugfix.md`
- Create: `cg-harness-new/templates/task-research.md`

**Steps:**
1. Encode the path from requirement intake through release and learning capture.
2. Keep the task state machine compact: draft, ready, in_progress, blocked, review, done, cancelled.
3. Define required task fields, acceptance criteria, blockers, decisions, evidence, and outputs.
4. Attach the appropriate quality gates to design, implementation, review, testing, and completion.

### Task 3: Add roles and collaboration rules

**Files:**
- Create: `cg-harness-new/roles/README.md`
- Create: `cg-harness-new/roles/tech-lead.md`
- Create: `cg-harness-new/roles/architect.md`
- Create: `cg-harness-new/roles/developer.md`
- Create: `cg-harness-new/roles/quality.md`
- Create: `cg-harness-new/roles/operations.md`
- Create: `cg-harness-new/roles/delegation.md`

**Steps:**
1. Preserve GGFrame's Tech Lead as the context owner and integrator.
2. Define role responsibilities and handoff contracts without reproducing verbose role files.
3. Define when work stays with the lead and when an independent agent is appropriate.
4. Require explicit output paths, decisions, evidence, and review status for delegated work.

### Task 4: Integrate selected engineering capabilities

**Files:**
- Create: `cg-harness-new/capabilities/README.md`
- Create: `cg-harness-new/capabilities/clarify-and-brainstorm.md`
- Create: `cg-harness-new/capabilities/design-deep-modules.md`
- Create: `cg-harness-new/capabilities/implement-with-tdd.md`
- Create: `cg-harness-new/capabilities/diagnose-bugs.md`
- Create: `cg-harness-new/capabilities/review-code.md`
- Create: `cg-harness-new/capabilities/verify-before-completion.md`
- Create: `cg-harness-new/capabilities/compound-learning.md`
- Create: `cg-harness-new/registry/capabilities.yaml`

**Steps:**
1. Extract the reusable behavior from the mature engineering skills.
2. Remove host-specific commands, marketing language, project-specific integrations, and duplicate instructions.
3. Register each capability with trigger, inputs, outputs, dependencies, and workflow stage.
4. Make verification evidence a mandatory completion requirement.

### Task 5: Add Codex-first adapter and migration notes

**Files:**
- Create: `cg-harness-new/adapters/codex/README.md`
- Create: `cg-harness-new/adapters/codex/AGENTS.md`
- Create: `cg-harness-new/registry/source-map.yaml`
- Create: `cg-harness-new/migration/excluded-content.md`
- Create: `cg-harness-new/migration/validation-checklist.md`

**Steps:**
1. Define the Codex entrypoint and the minimum loading sequence.
2. Record which source families contributed reusable concepts.
3. Record excluded project, historical, Obsidian, experimental, and host-specific material.
4. Validate internal links, registry paths, required files, and the absence of prohibited dependencies.

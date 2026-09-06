# CG Harness Core Skill Contracts Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Establish a self-owned skill and protocol layer for `cg-harness`, so all six user commands share stable inputs, outputs, evidence, status, and fallback behavior.

**Architecture:** Keep `cg-harness` as the source of truth for orchestration contracts. Define reusable core and work-type skills under `cg-harness/skills/`, define cross-cutting rules under `cg-harness/protocols/`, and make each command file compose skills rather than bind directly to external providers. External projects remain optional adapters.

**Tech Stack:** Markdown documentation, YAML task records, GGFrame-compatible status and evidence terminology.

---

### Task 1: Add the skill catalog

**Files:**
- Create: `cg-harness/skills/*/SKILL.md`

**Steps:**
1. Create one contract document for each core and work-type skill.
2. Give every skill the same sections: purpose, inputs, procedure, outputs, completion gate, adapter hooks.
3. Keep execution rules concise and provider-neutral.
4. Verify every command-referenced skill has a matching file.

### Task 2: Add cross-cutting protocols

**Files:**
- Create: `cg-harness/protocols/skill-contract.md`
- Create: `cg-harness/protocols/context-package.md`
- Create: `cg-harness/protocols/evidence-model.md`
- Create: `cg-harness/protocols/status-transition.md`
- Create: `cg-harness/protocols/fallback.md`

**Steps:**
1. Define the common skill input/output contract.
2. Define task context packaging and evidence categories.
3. Reconcile CG Harness and GGFrame statuses with explicit mappings.
4. Define provider fallback and unavailable-capability reporting.
5. Link the protocols from the harness README.

### Task 3: Align task records and command routes

**Files:**
- Modify: `cg-harness/templates/task.yaml`
- Modify: `cg-harness/commands/work.md`
- Modify: `cg-harness/commands/fix.md`
- Modify: `cg-harness/commands/refactor.md`
- Modify: `cg-harness/commands/optimize.md`
- Modify: `cg-harness/commands/prototype.md`
- Modify: `cg-harness/commands/review.md`

**Steps:**
1. Add context, evidence categories, fallback, and completion-gate fields to the task template.
2. Express each command as a self-owned skill chain.
3. Require command-specific acceptance and evidence gates.
4. Preserve external capability references only as adapters.

### Task 4: Add one end-to-end example

**Files:**
- Create: `cg-harness/examples/fix-flow/task.yaml`
- Create: `cg-harness/examples/fix-flow/README.md`

**Steps:**
1. Show a realistic bug intake.
2. Show reproduction, diagnosis, implementation, regression, and verification evidence.
3. Show a provider fallback without claiming an unavailable capability ran.
4. Check that the example follows the task template and status protocol.

### Task 5: Verify consistency

**Steps:**
1. Search command files for skill ids without matching `SKILL.md` files.
2. Search protocol and template references for stale field names.
3. Review the README as the user-facing entry point.
4. Report remaining implementation gaps separately from contract completion.

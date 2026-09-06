# CG Harness Normal Flow Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Make the CG Harness normal task lifecycle usable end to end from the CLI.

**Architecture:** Extend the existing JSON task store and CLI with explicit task-field and acceptance-item commands. Keep the current task model as the machine truth, and enforce documented lifecycle guards in validators without introducing a second state machine.

**Tech Stack:** Node.js ES modules, built-in `node:test`, JSON and JSONL persistence.

---

### Task 1: Add task editing commands

**Files:**
- Modify: `cg-harness/cli/src/main.js`
- Modify: `cg-harness/cli/src/task-store.js`
- Test: `cg-harness/tests/core.test.js`

Add commands to update task intent, scope, acceptance, preserve rules, risks, and owner. Validate task existence and persist an event for each update.

### Task 2: Enforce lifecycle guards

**Files:**
- Modify: `cg-harness/cli/src/validators.js`
- Test: `cg-harness/tests/core.test.js`

Require executable task metadata before `ready`, declared outputs and a verification attempt before `under_review`, blocker metadata for `blocked`, findings for `revision`, and residual-risk declaration plus acceptance evidence before `done`.

### Task 3: Verify the complete happy path

**Files:**
- Modify: `cg-harness/tests/core.test.js`

Cover CLI-only creation, metadata setup, acceptance evidence, all normal lifecycle transitions, archival, and event-log consistency.

### Task 4: Update user-facing usage

**Files:**
- Modify: `cg-harness/README.md`

Document the new task setup and lifecycle commands with a complete example.


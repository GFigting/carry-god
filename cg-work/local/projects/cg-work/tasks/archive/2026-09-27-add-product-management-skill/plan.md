# Product Management Framework Skill Implementation Plan

> **For agentic workers:** Implement this plan task-by-task with a fresh verification checkpoint after each task.

**Goal:** Add a framework-owned `framework:product-management` skill that turns ambiguous product input into traceable requirements, product artifacts, prioritization, and acceptance evidence without forcing product ceremony onto ordinary development tasks.

**Architecture:** Add one self-contained Markdown skill under `skills/product-management/`. Keep the skill explicit and read-mostly, with clear handoff boundaries to `to-spec`, `to-tickets`, and `feature-development`. Synchronize only the framework indexes and root entry documentation, then protect the skill contract with a focused Node test.

**Tech Stack:** Markdown skill metadata and instructions, Node.js ECMAScript modules, Node built-in test runner.

**Spec:** `local/projects/cg-work/design/product-management-skill/2026-09-27-design.md`

## Global Constraints

- The skill is framework-owned; do not add it to `scripts/check-skills.mjs` mirror mappings.
- Do not copy or modify `GGFrame` or `compound-engineering-plugin` source files.
- Do not auto-load the skill in `feature-development`; it remains an explicit product capability.
- Do not write project business data, credentials, external tracker changes, or runtime code.
- Keep user-confirmed decisions and task evidence under `local/projects/cg-work/`.

## Standards Preflight

- Skill invocation name: `framework:product-management` is a stable identifier and must remain kebab-case.
- Required product artifact section names are stable contract labels: `Problem`, `Users and goals`, `User stories`, `Functional requirements`, `Acceptance criteria`, `Non-functional requirements`, `Measurement`, `Prioritization`, `Roadmap and backlog`, and `Release acceptance`.
- Handoff target names are stable references: `framework:to-spec`, `framework:to-tickets`, and `framework:feature-development`.
- Version target `2.13.0` is a release value, not a runtime configuration; it may remain in `VERSION` only.
- One-time instructional examples and Given-When-Then keywords are allowed literals in the Markdown skill and tests.

### Task 1: Add the framework-owned product management skill

**Files:**
- Create: `skills/product-management/SKILL.md`
- Modify: `skills/README.md`

**Interfaces:**
- Consumes: user product request, repository/project context, existing requirements references, and confirmed decisions.
- Produces: a structured product definition with the required sections and explicit handoff guidance.

- [ ] **Step 1: Write the contract test for the skill shape**

Add a test that reads `skills/product-management/SKILL.md` and asserts the frontmatter name, a non-empty description, each required artifact section, the read-only/external-side-effect boundary, and all three handoff references.

- [ ] **Step 2: Run the focused test and verify it fails**

Run: `node --test test/product-management-skill.test.mjs`

Expected: FAIL because `skills/product-management/SKILL.md` does not exist yet.

- [ ] **Step 3: Write the minimal skill content**

Create the skill with:

1. YAML frontmatter using `name: product-management`, an invocation-safe description, and no external tool requirements.
2. A scope and boundary section stating that it defines product intent and acceptance, stays read-mostly, and never silently changes code, data, or external trackers.
3. An intake sequence that identifies the problem, user, business goal, evidence, constraints, and unresolved decisions one question at a time.
4. A product artifact contract containing the ten stable section names from `standards_preflight`.
5. Rules for INVEST user stories, Given-When-Then acceptance criteria, measurable outcomes, non-functional requirements, telemetry, and evidence-based prioritization.
6. A handoff section distinguishing product definition from `framework:to-spec`, `framework:to-tickets`, and `framework:feature-development`.
7. A completion checklist that rejects unverifiable requirements and records open decisions rather than inventing business answers.

- [ ] **Step 4: Run the focused test and verify it passes**

Run: `node --test test/product-management-skill.test.mjs`

Expected: PASS.

- [ ] **Step 5: Register the skill in the skills index**

Add `product-management` to the special framework skills list in `skills/README.md`, preserving the existing categories and mirror explanation.

- [ ] **Step 6: Re-run the focused test**

Run: `node --test test/product-management-skill.test.mjs`

Expected: PASS with the skill file and index present.

### Task 2: Synchronize the framework entry documentation and version

**Files:**
- Modify: `README.md`
- Modify: `VERSION`

**Interfaces:**
- Consumes: the finalized skill contract from Task 1.
- Produces: discoverable framework-level guidance and the compatible minor version `2.13.0`.

- [ ] **Step 1: Add a concise README entry**

Document when to invoke `framework:product-management`, what it produces, and that it hands confirmed product definitions to `to-spec` or `to-tickets` without replacing them.

- [ ] **Step 2: Update the semantic version**

Change `VERSION` from `2.12.2` to `2.13.0` because this is a backward-compatible capability addition.

- [ ] **Step 3: Check documentation links and wording**

Run: `node scripts/check-all.mjs`

Expected: PASS with no broken local Markdown links or invalid names.

### Task 3: Run full verification and record evidence

**Files:**
- Create: `test/product-management-skill.test.mjs`
- Modify: `local/projects/cg-work/tasks/2026-09-27-add-product-management-skill/task.yaml`
- Create: `local/projects/cg-work/tasks/2026-09-27-add-product-management-skill/review.md`
- Create: `local/projects/cg-work/tasks/2026-09-27-add-product-management-skill/verification.md`

**Interfaces:**
- Consumes: implementation and documentation from Tasks 1-2.
- Produces: fresh automated verification, review evidence, and a task record ready for user acceptance.

- [ ] **Step 1: Run the framework structure checks**

Run: `node scripts/check-all.mjs` and `node scripts/check-skills.mjs`.

Expected: both commands pass; mirror verification must remain unchanged because the new skill is framework-owned.

- [ ] **Step 2: Run the full test suite**

Run: `npm test`

Expected: all tests pass, including `test/product-management-skill.test.mjs`.

- [ ] **Step 3: Perform the current-diff standards check**

Inspect the diff for accidental mirror edits, hard-coded workflow references outside the declared contract, broken Markdown links, and unrelated changes. Record this as a manual static review because the repository has no formatter for Markdown.

- [ ] **Step 4: Write review and verification evidence**

Record implementation review findings, command outputs, any environment limitations, and the decision that no business-document update beyond the framework README is required.

- [ ] **Step 5: Update task state for user acceptance**

Set `status: review`, add `review_reference` and `verification_reference`, and set `next_user_action` to request user acceptance. Do not mark the task `done` before acceptance and an integration decision.

## Plan Review

- **Requirements coverage:** Task 1 covers the standalone skill and handoff boundaries; Task 2 covers framework discoverability and versioning; Task 3 covers regression tests, structure checks, and evidence.
- **Scope:** No workflow auto-loading, external integrations, source mirror changes, or project business behavior are included.
- **Dependencies:** Task 2 depends on Task 1's final skill contract; Task 3 depends on both.
- **Risks:** The main risk is accidentally turning a product skill into a mandatory development ceremony. The plan prevents this by keeping all workflow references informational and explicit.
- **Acceptance:** The skill contract test, framework checks, mirror check, full test suite, and manual diff review must all pass before review.

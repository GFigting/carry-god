# CG Harness Foundation Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement the plan task-by-task.

**Goal:** Absorb the strongest workflow practices from the repository's companion folders into a self-owned project initializer and natural-language intake flow.

**Architecture:** Keep `cg-harness` as the source of truth. Add a project store for `.cg/project.json`, deterministic intake classification with explicit confidence and clarification questions, and richer task metadata while preserving the current JSON task and lifecycle model.

**Tech Stack:** Node.js ES modules, built-in `node:test`, JSON and JSONL files.

---

### Task 1: Project initialization

Add `cg init --project [--path PATH]` to detect the project root, read common instruction files, infer a small technology stack, and write `.cg/project.json` plus standard directories.

### Task 2: Natural-language intake

Add `cg intake --text TEXT [--id TASK-ID]` with deterministic type classification, confidence, ambiguity questions, and a draft task record. Do not force a type when signals conflict.

### Task 3: Enrich task records

Add project, goal, source, confidence, open questions, decisions, artifacts, context package, parent task, and subtasks fields while preserving existing CLI compatibility.

### Task 4: End-to-end tests and documentation

Cover project initialization, intake for clear and ambiguous requests, generated IDs, and existing lifecycle behavior. Document both flows in the Harness README.


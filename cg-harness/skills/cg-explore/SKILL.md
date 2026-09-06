# cg-explore

## Purpose
Build the minimum reliable context needed to change or verify a codebase.

## Trigger
Execution requires understanding files, symbols, dependencies, data flow, or runtime behavior.

## Inputs
Task scope, project path, architecture notes, and search tools.

## Procedure
1. Locate the affected entry points.
2. Trace callers, callees, data boundaries, and tests.
3. Record relevant conventions and constraints.
4. Stop when the change boundary is supported by evidence.

## Outputs
Context note, affected-file list, dependency map, and discovered risks.

## Evidence
Paths, symbol references, commands, or traces used to establish the boundary.

## Failure Handling
Report missing code, stale indexes, or inaccessible environments; do not guess implementation details.

## Forbidden Behavior
Do not edit files while only exploring or claim full impact from a partial search.

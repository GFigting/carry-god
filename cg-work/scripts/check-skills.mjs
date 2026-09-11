import crypto from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const frameworkRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const workspaceRoot = path.resolve(frameworkRoot, '..');

export const mirrors = [
  ['superpowers/skills/brainstorming', 'brainstorming'],
  ['superpowers/skills/writing-plans', 'writing-plans'],
  ['superpowers/skills/test-driven-development', 'test-driven-development'],
  ['superpowers/skills/systematic-debugging', 'systematic-debugging'],
  ['superpowers/skills/verification-before-completion', 'verification-before-completion'],
  ['superpowers/skills/requesting-code-review', 'requesting-code-review'],
  ['superpowers/skills/receiving-code-review', 'receiving-code-review'],
  ['superpowers/skills/using-git-worktrees', 'using-git-worktrees'],
  ['superpowers/skills/finishing-a-development-branch', 'finishing-a-development-branch'],
  ['superpowers/skills/dispatching-parallel-agents', 'dispatching-parallel-agents'],
  ['superpowers/skills/subagent-driven-development', 'subagent-driven-development'],
  ['superpowers/skills/executing-plans', 'executing-plans'],
  ['superpowers/skills/writing-skills', 'writing-skills'],
  ['skills/skills/engineering/codebase-design', 'codebase-design'],
  ['skills/skills/engineering/domain-modeling', 'domain-modeling'],
  ['skills/skills/engineering/research', 'research'],
  ['skills/skills/engineering/prototype', 'prototype'],
  ['skills/skills/engineering/code-review', 'code-review'],
  ['skills/skills/engineering/improve-codebase-architecture', 'improve-codebase-architecture'],
  ['skills/skills/engineering/resolving-merge-conflicts', 'resolving-merge-conflicts'],
  ['skills/skills/engineering/wayfinder', 'wayfinder'],
  ['skills/skills/engineering/to-spec', 'to-spec'],
  ['skills/skills/engineering/to-tickets', 'to-tickets'],
  ['skills/skills/engineering/grill-with-docs', 'grill-with-docs'],
  ['skills/skills/productivity/grilling', 'grilling'],
  ['skills/skills/productivity/handoff', 'handoff'],
  ['skills/skills/productivity/to-questionnaire', 'to-questionnaire'],
  ['gstack/review', 'gstack-review'],
  ['gstack/qa-only', 'qa-only'],
];

async function files(root, current = root) {
  const result = [];
  for (const entry of await fs.readdir(current, { withFileTypes: true })) {
    const target = path.join(current, entry.name);
    if (entry.isDirectory()) result.push(...await files(root, target));
    else result.push(path.relative(root, target).replaceAll(path.sep, '/'));
  }
  return result.sort();
}

async function hash(file) {
  return crypto.createHash('sha256').update(await fs.readFile(file)).digest('hex');
}

export async function verifyMirrors() {
  const errors = [];
  for (const [source, target] of mirrors) {
    const sourceRoot = path.join(workspaceRoot, source);
    const targetRoot = path.join(frameworkRoot, 'skills', target);
    let sourceFiles;
    let targetFiles;
    try {
      [sourceFiles, targetFiles] = await Promise.all([files(sourceRoot), files(targetRoot)]);
    } catch (error) {
      errors.push(`unreadable skill mirror: ${target} (${error.message})`);
      continue;
    }
    if (sourceFiles.join('\n') !== targetFiles.join('\n')) {
      errors.push(`skill file list differs: ${target}`);
      continue;
    }
    for (const relative of sourceFiles) {
      if (await hash(path.join(sourceRoot, relative)) !== await hash(path.join(targetRoot, relative))) {
        errors.push(`skill content differs: ${target}/${relative}`);
      }
    }
  }
  return errors;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const errors = await verifyMirrors();
  if (errors.length) {
    console.error(errors.join('\n'));
    process.exitCode = 1;
  } else {
    console.log('skill mirrors match sources');
  }
}

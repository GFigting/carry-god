import crypto from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const frameworkRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const workspaceRoot = path.resolve(frameworkRoot, '..');

// Only raw upstream mirrors belong here. Framework-owned and framework-localized
// skills (for example baoyu-design) intentionally use cg-work rules and are excluded.
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
  // code-review、grilling 与 prototype 是框架本地化技能：正文声明了本地调整与上游来源，不登记为原始镜像。
  ['skills/skills/engineering/improve-codebase-architecture', 'improve-codebase-architecture'],
  ['skills/skills/engineering/resolving-merge-conflicts', 'resolving-merge-conflicts'],
  ['skills/skills/engineering/wayfinder', 'wayfinder'],
  ['skills/skills/engineering/to-spec', 'to-spec'],
  ['skills/skills/engineering/to-tickets', 'to-tickets'],
  ['skills/skills/engineering/grill-with-docs', 'grill-with-docs'],
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

// 哈希前统一按 LF 归一化：Windows 工作副本会因 core.autocrlf 把 cg-work 镜像转成 CRLF，
// 而镜像源目录多由 .gitattributes 固定为 LF，直接比字节会把换行符差异误报成内容漂移。
// 含 NUL 字节的文件视为二进制，按原字节比较。
async function hash(file) {
  const buffer = await fs.readFile(file);
  const content = buffer.includes(0)
    ? buffer
    : Buffer.from(buffer.toString('utf8').replace(/\r\n/g, '\n'), 'utf8');
  return crypto.createHash('sha256').update(content).digest('hex');
}

export async function compareMirror(sourceRoot, targetRoot, label) {
  const errors = [];
  let sourceFiles;
  let targetFiles;
  try {
    [sourceFiles, targetFiles] = await Promise.all([files(sourceRoot), files(targetRoot)]);
  } catch (error) {
    return [`unreadable skill mirror: ${label} (${error.message})`];
  }
  if (sourceFiles.join('\n') !== targetFiles.join('\n')) {
    return [`skill file list differs: ${label}`];
  }
  for (const relative of sourceFiles) {
    if (await hash(path.join(sourceRoot, relative)) !== await hash(path.join(targetRoot, relative))) {
      errors.push(`skill content differs: ${label}/${relative}`);
    }
  }
  return errors;
}

export async function verifyMirrors() {
  const errors = [];
  for (const [source, target] of mirrors) {
    errors.push(...await compareMirror(
      path.join(workspaceRoot, source),
      path.join(frameworkRoot, 'skills', target),
      target,
    ));
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

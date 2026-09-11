import assert from 'node:assert/strict';
import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import test from 'node:test';

const exec = promisify(execFile);
const script = path.resolve('scripts/check-project.mjs');

async function run(file) {
  try {
    const result = await exec(process.execPath, [script, file]);
    return { code: 0, output: `${result.stdout}${result.stderr}` };
  } catch (error) {
    return { code: error.code, output: `${error.stdout || ''}${error.stderr || ''}` };
  }
}

test('接受有效的项目上下文', async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), 'cg-work-project-'));
  const contextDir = await mkdtemp(path.join(os.tmpdir(), 'cg-work-context-'));
  const projectDir = path.join(contextDir, 'sample-project');
  await import('node:fs/promises').then(({ mkdir }) => mkdir(projectDir));
  const file = path.join(projectDir, 'project-context.yaml');
  await writeFile(file, `project:\n  id: sample-project\n  root_path: ${root}\ntechnology:\n  stack: []\ninstructions:\n  files: []\ndocuments:\n  business: []\n  architecture: []\n  api: []\nruntime:\n  entrypoints: []\n  health_checks: []\nvocabulary:\n  glossary: null\nskills:\n  paths: []\nrequired_context: []\n`);
  const result = await run(file);
  assert.equal(result.code, 0, result.output);
  await rm(root, { recursive: true, force: true });
  await rm(contextDir, { recursive: true, force: true });
});

test('拒绝重复的 YAML 键', async () => {
  const dir = await mkdtemp(path.join(os.tmpdir(), 'cg-work-context-'));
  const projectDir = path.join(dir, 'sample-project');
  await import('node:fs/promises').then(({ mkdir }) => mkdir(projectDir));
  const file = path.join(projectDir, 'project-context.yaml');
  await writeFile(file, 'project:\n  id: sample-project\nproject:\n  id: duplicate\n');
  const result = await run(file);
  assert.notEqual(result.code, 0);
  assert.match(result.output, /重复键|duplicated mapping key|duplicate/i);
  await rm(dir, { recursive: true, force: true });
});

test('拒绝相对项目根路径', async () => {
  const dir = await mkdtemp(path.join(os.tmpdir(), 'cg-work-context-'));
  const projectDir = path.join(dir, 'sample-project');
  await import('node:fs/promises').then(({ mkdir }) => mkdir(projectDir));
  const file = path.join(projectDir, 'project-context.yaml');
  await writeFile(file, 'project:\n  id: sample-project\n  root_path: ../project\n');
  const result = await run(file);
  assert.notEqual(result.code, 0);
  assert.match(result.output, /project\.root_path 必须是绝对路径/);
  await rm(dir, { recursive: true, force: true });
});

import assert from 'node:assert/strict';
import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { compareMirror } from '../scripts/check-skills.mjs';

async function fixture(files) {
  const dir = await mkdtemp(path.join(os.tmpdir(), 'cg-work-mirror-'));
  const source = path.join(dir, 'source');
  const target = path.join(dir, 'target');
  await mkdir(source);
  await mkdir(target);
  for (const [relative, content] of Object.entries(files.source)) {
    await mkdir(path.dirname(path.join(source, relative)), { recursive: true });
    await writeFile(path.join(source, relative), content);
  }
  for (const [relative, content] of Object.entries(files.target)) {
    await mkdir(path.dirname(path.join(target, relative)), { recursive: true });
    await writeFile(path.join(target, relative), content);
  }
  return { dir, source, target };
}

test('镜像比较容忍换行符差异，避免 Windows 工作副本假阳性', async () => {
  const { dir, source, target } = await fixture({
    source: { 'SKILL.md': '# skill\n\nbody\n' },
    target: { 'SKILL.md': '# skill\r\n\r\nbody\r\n' },
  });
  assert.deepEqual(await compareMirror(source, target, 'sample'), []);
  await rm(dir, { recursive: true, force: true });
});

test('镜像比较仍报告真实内容差异', async () => {
  const { dir, source, target } = await fixture({
    source: { 'SKILL.md': '# skill\n\nbody\n' },
    target: { 'SKILL.md': '# skill\n\nchanged\n' },
  });
  assert.deepEqual(await compareMirror(source, target, 'sample'), ['skill content differs: sample/SKILL.md']);
  await rm(dir, { recursive: true, force: true });
});

test('镜像比较仍报告文件清单差异与不可读镜像', async () => {
  const { dir, source, target } = await fixture({
    source: { 'SKILL.md': '# skill\n', 'extra.md': '# extra\n' },
    target: { 'SKILL.md': '# skill\n' },
  });
  assert.deepEqual(await compareMirror(source, target, 'sample'), ['skill file list differs: sample']);
  const missing = await compareMirror(source, path.join(dir, 'absent'), 'sample');
  assert.match(missing[0], /unreadable skill mirror: sample/);
  await rm(dir, { recursive: true, force: true });
});

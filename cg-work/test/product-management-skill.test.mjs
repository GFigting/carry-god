import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const skillPath = path.join(root, 'skills', 'product-management', 'SKILL.md');

test('product management skill exposes the framework product contract', async () => {
  const content = await fs.readFile(skillPath, 'utf8');

  assert.match(content, /^---\r?\nname: product-management\r?\n/m);
  assert.match(content, /description:\s+\S+/);
  for (const section of [
    'Problem',
    'Users and goals',
    'User stories',
    'Functional requirements',
    'Acceptance criteria',
    'Non-functional requirements',
    'Measurement',
    'Prioritization',
    'Roadmap and backlog',
    'Release acceptance',
  ]) {
    assert.match(content, new RegExp(`^## ${section}$`, 'm'));
  }
  assert.match(content, /read-mostly|read-only/i);
  assert.match(content, /(?:do not|does not|never).*external/i);
  for (const handoff of ['framework:to-spec', 'framework:to-tickets', 'framework:feature-development']) {
    assert.match(content, new RegExp(handoff.replaceAll(':', '\\:')));
  }
});

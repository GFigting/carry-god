import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';

const root = await fs.mkdtemp(path.join(os.tmpdir(), 'cg-harness-'));
process.env.CG_HARNESS_ROOT = root;
const { createTask, loadTask, loadEvents } = await import('../cli/src/task-store.js');
const { validateTask, validateTransition } = await import('../cli/src/validators.js');
const { main } = await import('../cli/src/main.js');
const { startWebServer } = await import('../cli/src/web-server.js');

async function task(id = 'TASK-001') {
  return createTask({ id, type: 'fix', title: '修复测试问题' });
}

test('creates an independent task snapshot and event log', async () => {
  const created = await task();
  assert.equal(created.status, 'draft');
  assert.deepEqual(validateTask(created), []);
  const events = await loadEvents(created.id);
  assert.equal(events.length, 1);
  assert.equal(events[0].event, 'task_created');
});

test('rejects illegal lifecycle transitions', async () => {
  const created = await task('TASK-002');
  assert.match(validateTransition(created, 'done', 'finish').join('\n'), /illegal transition/);
  await main(['acceptance', created.id, 'add', '--id', 'A1', '--text', '范围明确']);
  await main(['update', created.id, '--include', 'src']);
  await main(['transition', created.id, '--to', 'ready', '--reason', '范围已明确']);
  const current = await loadTask(created.id);
  assert.equal(current.status, 'ready');
  assert.equal((await loadEvents(created.id)).at(-1).to, 'ready');
});

test('requires acceptance-linked evidence before done', async () => {
  const created = await task('TASK-003');
  created.acceptance = [{ id: 'A1', text: '回归测试通过' }];
  const taskFile = path.join(root, 'tasks', created.id, 'task.json');
  await fs.writeFile(taskFile, JSON.stringify(created, null, 2));
  assert.match(validateTransition(created, 'done', 'verified').join('\n'), /illegal transition/);
  await main(['update', created.id, '--include', 'src']);
  await main(['transition', created.id, '--to', 'ready', '--reason', '范围已明确']);
  await main(['transition', created.id, '--to', 'in_progress', '--reason', '开始执行']);
  await main(['update', created.id, '--output', 'candidate.patch']);
  await fs.writeFile(path.join(root, 'failed-proof.txt'), 'not yet');
  await main(['evidence', created.id, 'add', '--kind', 'test', '--path', path.join(root, 'failed-proof.txt'), '--acceptance', 'A1', '--result', 'failed']);
  await main(['transition', created.id, '--to', 'under_review', '--reason', '实现完成，进入验证']);
  const reviewTask = await loadTask(created.id);
  assert.match(validateTransition(reviewTask, 'done', 'verified').join('\n'), /evidence required/);
  await fs.writeFile(path.join(root, 'proof.txt'), 'passed');
  await fs.writeFile(taskFile, JSON.stringify(reviewTask, null, 2));
  await main(['evidence', created.id, 'add', '--kind', 'test', '--path', path.join(root, 'proof.txt'), '--acceptance', 'A1', '--result', 'pass']);
  const withEvidence = await loadTask(created.id);
  await main(['update', created.id, '--risk-declared']);
  const withRisk = await loadTask(created.id);
  assert.deepEqual(validateTransition(withRisk, 'done', 'verified'), []);
});

test('check reports a valid task without external providers', async () => {
  const created = await task('TASK-004');
  await main(['check', created.id]);
  assert.equal((await loadTask(created.id)).id, 'TASK-004');
});

test('lists task summaries and rejects invalid evidence references', async () => {
  const created = await task('TASK-006');
  await main(['list']);
  await assert.rejects(() => main(['evidence', created.id, 'add', '--kind', 'test', '--command', 'npm test', '--acceptance', 'A404', '--result', 'pass']), /unknown acceptance/);
});

test('records unavailable capability results without changing task status', async () => {
  const created = await task('TASK-007');
  const resultFile = path.join(root, 'adapter-result.json');
  await fs.writeFile(resultFile, JSON.stringify({
    task: created.id,
    capability: 'cg.diagnose',
    provider: 'gstack:investigate',
    result: 'unavailable',
    artifacts: [],
    evidence: [],
    risks: ['未执行自动 trace 收集'],
    fallback: { requested: 'gstack:investigate', selected: 'cg.diagnose', mode: 'builtin', reason: 'provider not installed', capability_gap: 'No automated trace collection' }
  }));
  await main(['capability', created.id, 'record', '--path', resultFile]);
  const current = await loadTask(created.id);
  assert.equal(current.status, 'draft');
  assert.equal(current.capabilities[0].result, 'unavailable');
  assert.equal(current.fallback.mode, 'builtin');
});

test('imports an external skill into a CG contract', async () => {
  const sourceFile = path.join(root, 'external-skill', 'SKILL.md');
  await fs.mkdir(path.dirname(sourceFile), { recursive: true });
  await fs.writeFile(sourceFile, '---\nname: sample-debug\ndescription: Diagnose failures\n---\n# Sample\n');
  await main(['skill', 'import', '--path', sourceFile]);
  const imported = path.join(root, 'skills', 'imported', 'sample-debug', 'SKILL.md');
  const content = await fs.readFile(imported, 'utf8');
  assert.match(content, /cg\.sample-debug/);
  assert.match(content, /Diagnose failures/);
});

test('absorbs procedure and completion sections when merging skills', async () => {
  const sourceDir = path.join(root, 'learned');
  const first = path.join(sourceDir, 'one', 'SKILL.md');
  const second = path.join(sourceDir, 'two', 'SKILL.md');
  await fs.mkdir(path.dirname(first), { recursive: true });
  await fs.mkdir(path.dirname(second), { recursive: true });
  await fs.writeFile(first, '---\nname: ce-debug\ndescription: Root cause first\n---\n## Procedure\n1. Reproduce\n## Completion Contract\nEvidence recorded\n');
  await fs.writeFile(second, '---\nname: diagnosing-bugs\ndescription: Diagnose loop\n---\n## Workflow\n2. Test hypothesis\n## Output\nRisk declared\n');
  await main(['skill', 'import-dir', '--path', sourceDir]);
  const merged = await fs.readFile(path.join(root, 'skills', 'imported', 'diagnose', 'SKILL.md'), 'utf8');
  assert.match(merged, /Reproduce/);
  assert.match(merged, /Test hypothesis/);
  assert.match(merged, /Risk declared/);
});

test('imports skills from the four bundled external folders', async () => {
  const folders = [
    path.resolve('..', '..', 'superpowers/skills'),
    path.resolve('..', '..', 'skills/skills'),
    path.resolve('..', '..', 'gstack'),
    path.resolve('..', '..', 'compound-engineering-plugin/skills')
  ];
  for (const folder of folders) await main(['skill', 'import-dir', '--path', folder]);
  const index = JSON.parse(await fs.readFile(path.join(root, 'skills', 'imported', 'INDEX.json'), 'utf8'));
  assert.ok(index.length >= 4);
  for (const folder of folders) assert.ok(index.some((item) => item.sources.some((source) => source.toLowerCase().startsWith(folder.toLowerCase()))), folder);
  assert.ok(index.some((item) => item.id === 'cg.diagnose'));
  assert.ok(index.some((item) => item.id === 'cg.clarify'));
  const diagnose = index.find((item) => item.id === 'cg.diagnose');
  assert.ok(diagnose.quality.source_count >= 2);
  assert.ok(['high', 'medium'].includes(diagnose.quality.confidence));
  assert.match(await fs.readFile(diagnose.destination, 'utf8'), /冲突处理/);
});

test('lists and shows learned capabilities', async () => {
  await main(['skill', 'list']);
  await main(['skill', 'show', '--id', 'cg.diagnose']);
});

test('completes the normal lifecycle using CLI task setup', async () => {
  const created = await task('TASK-005');
  await main(['update', created.id, '--include', 'src', '--output', 'fix.patch', '--risk-declared']);
  await main(['acceptance', created.id, 'add', '--id', 'A1', '--text', '回归测试通过']);
  await main(['transition', created.id, '--to', 'ready', '--reason', '范围已明确']);
  await main(['transition', created.id, '--to', 'in_progress', '--reason', '开始执行']);
  await fs.writeFile(path.join(root, 'proof-005.txt'), 'passed');
  await main(['evidence', created.id, 'add', '--kind', 'test', '--path', path.join(root, 'proof-005.txt'), '--acceptance', 'A1', '--result', 'pass']);
  await main(['update', created.id, '--output', 'fix.patch']);
  await main(['transition', created.id, '--to', 'under_review', '--reason', '实现完成']);
  await main(['transition', created.id, '--to', 'done', '--reason', '验收通过']);
  await main(['transition', created.id, '--to', 'archived', '--reason', '归档']);
  assert.equal((await loadTask(created.id)).status, 'archived');
});

test('initializes a project registry and standard harness directories', async () => {
  const project = await fs.mkdtemp(path.join(root, 'project-'));
  await fs.writeFile(path.join(project, 'package.json'), '{}');
  await fs.writeFile(path.join(project, 'AGENTS.md'), '# rules');
  await main(['init', '--project', '--path', project]);
  const config = JSON.parse(await fs.readFile(path.join(project, '.cg', 'project.json'), 'utf8'));
  assert.deepEqual(config.project.tech_stack, ['Node.js']);
  assert.deepEqual(config.project.instructions, ['AGENTS.md']);
  await fs.access(path.join(project, '.cg', 'knowledge'));
});

test('intake classifies clear and ambiguous natural-language requests', async () => {
  await main(['intake', '--text', '修复登录后页面报错']);
  const clear = await loadTask('TASK-20260906-001');
  assert.equal(clear.source, 'intake');
  assert.equal(clear.type, 'fix');
  assert.equal(clear.confidence, 'high');

  await main(['intake', '--id', 'TASK-AMBIGUOUS', '--text', '优化订单页面并重构查询模块']);
  const ambiguous = await loadTask('TASK-AMBIGUOUS');
  assert.equal(ambiguous.confidence, 'low');
  assert.equal(ambiguous.open_questions.length, 1);
  assert.equal(ambiguous.next_action, 'clarify');
});

test('creates context, plan, artifact, learning, subtask, and resume records', async () => {
  const created = await task('TASK-008');
  await main(['acceptance', created.id, 'add', '--id', 'A1', '--text', '完成实现']);
  await main(['update', created.id, '--include', 'src', '--goal', '未使用']);
  await main(['context', created.id, 'create']);
  await main(['plan', created.id, 'create', '--text', '先实现再验证']);
  const artifactPath = path.join(root, 'artifact.md'); await fs.writeFile(artifactPath, '# report');
  await main(['artifact', created.id, 'add', '--path', artifactPath]);
  await main(['learn', created.id, 'add', '--text', '验收证据必须绑定标准']);
  await main(['subtask', created.id, 'add', '--id', 'TASK-008-1', '--title', '实现子任务']);
  await main(['resume', created.id]);
  const current = await loadTask(created.id);
  assert.ok(current.context_package);
  assert.equal(current.artifacts.length, 2);
  assert.equal(current.subtasks[0], 'TASK-008-1');
  assert.equal(current.learnings.length, 1);
});

test('accepts intake from a file and records dependencies and plan steps', async () => {
  const request = path.join(root, 'request.md'); await fs.writeFile(request, '新增导出功能');
  await main(['intake', '--file', request, '--id', 'TASK-009']);
  await main(['update', 'TASK-009', '--depends-on', 'TASK-001', '--depends-on', 'TASK-002']);
  await main(['plan', 'TASK-009', 'create', '--text', '实现导出', '--step', '定义接口', '--step', '补充测试']);
  await main(['step', 'TASK-009', 'start', '--id', 'P1']);
  await main(['step', 'TASK-009', 'done', '--id', 'P1']);
  const current = await loadTask('TASK-009');
  assert.equal(current.type, 'work');
  assert.deepEqual(current.dependencies, ['TASK-001', 'TASK-002']);
  assert.deepEqual(current.plan_steps.map((step) => step.text), ['定义接口', '补充测试']);
  assert.equal(current.plan_steps[0].status, 'done');
});

test('serves task data and lifecycle actions over the local web API', async () => {
  const created = await task('TASK-010');
  await main(['acceptance', created.id, 'add', '--id', 'A1', '--text', '页面操作']);
  await main(['update', created.id, '--include', 'src']);
  const server = startWebServer({ port: 0 });
  await new Promise((resolve) => server.once('listening', resolve));
  const port = server.address().port;
  const response = await fetch(`http://127.0.0.1:${port}/api/tasks/${created.id}`);
  assert.equal(response.status, 200);
  assert.equal((await response.json()).id, created.id);
  const transition = await fetch(`http://127.0.0.1:${port}/api/tasks/${created.id}/transition`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ to: 'ready', reason: '页面操作' }) });
  assert.equal(transition.status, 200);
  await new Promise((resolve) => server.close(resolve));
});

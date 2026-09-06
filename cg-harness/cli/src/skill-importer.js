import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = process.env.CG_HARNESS_ROOT || path.resolve(fileURLToPath(new URL('../../', import.meta.url)));

async function resolveSourcePath(sourcePath) {
  const candidates = [path.resolve(sourcePath)];
  const relativeFromCwd = path.relative(process.cwd(), path.resolve(sourcePath));
  if (relativeFromCwd && !relativeFromCwd.startsWith(`..${path.sep}`) && relativeFromCwd !== '..') {
    candidates.push(path.resolve(process.cwd(), relativeFromCwd));
  }
  let cursor = process.cwd();
  for (let i = 0; i < 5; i += 1) {
    candidates.push(path.resolve(cursor, sourcePath));
    if (relativeFromCwd && !relativeFromCwd.startsWith(`..${path.sep}`) && relativeFromCwd !== '..') candidates.push(path.resolve(cursor, relativeFromCwd));
    const parent = path.dirname(cursor);
    if (parent === cursor) break;
    cursor = parent;
  }
  for (const candidate of [...new Set(candidates)]) {
    try { await fs.access(candidate); return candidate; } catch { /* try next ancestor */ }
  }
  return path.resolve(sourcePath);
}

function frontmatter(source) {
  const match = source.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  const values = {};
  for (const line of match?.[1]?.split(/\r?\n/) || []) {
    const item = line.match(/^([A-Za-z0-9_-]+):\s*(.*)$/);
    if (item) values[item[1]] = item[2].replace(/^['"]|['"]$/g, '');
  }
  return values;
}

function sections(source) {
  const result = {};
  const matches = [...source.matchAll(/^##+\s+(.+)\r?\n([\s\S]*?)(?=^##+\s+|(?![\s\S]))/gmi)];
  for (const match of matches) result[match[1].trim().toLowerCase()] = match[2].trim();
  return result;
}

function slug(value) { return value.toLowerCase().replace(/[^a-z0-9._-]+/g, '-').replace(/^-|-$/g, '') || 'imported-skill'; }

function mergeKey(name) {
  const raw = slug(name);
  if (raw === 'ce-plan') return 'ce-plan';
  let key = raw.replace(/^(ce|cg|gstack|superpowers|skills)[._-]+/, '');
  if (/^(systematic-)?debug(ging)?$/.test(key) || key === 'investigate' || key === 'diagnosing-bugs') return 'diagnose';
  if (key === 'brainstorm' || key === 'brainstorming' || key === 'grill-me' || key === 'grill-with-docs') return 'clarify';
  if (key === 'verification-before-completion' || key === 'verify' || key === 'test') return 'verify';
  return key;
}

function quality(item) {
  const coverage = [item.when_to_use.length, item.procedures.length, item.completions.length].filter(Boolean).length;
  return { source_count: item.sources.length, coverage, confidence: item.sources.length > 1 && coverage >= 2 ? 'high' : coverage ? 'medium' : 'low', priority: ['clarify', 'diagnose', 'verify'].includes(item.merge_key) ? 'core' : 'supporting' };
}

export async function importSkill(sourcePath) {
  sourcePath = await resolveSourcePath(sourcePath);
  const source = await fs.readFile(sourcePath, 'utf8');
  const meta = frontmatter(source);
  const parts = sections(source);
  const name = meta.name || path.basename(path.dirname(sourcePath));
  const id = `cg.${mergeKey(name)}`;
  const description = meta.description || 'Imported external skill';
  const destination = path.join(root, 'skills', 'imported', slug(name), 'SKILL.md');
  const document = `# ${id}\n\n## Purpose\n\n${description}\n\n## Source\n\n- Provider skill: ${name}\n- Imported from: ${path.resolve(sourcePath)}\n\n## Procedure\n\nFollow the provider skill document at the source path. Preserve its scope, constraints, and completion checks.\n\n## CG Harness Output\n\nReturn the standard skill output envelope with result, outputs, evidence, changed_files, remaining_risk, and next_action. Record unavailable or fallback when the provider cannot run.\n`;
  await fs.mkdir(path.dirname(destination), { recursive: true });
  await fs.writeFile(destination, document, 'utf8');
  return {
    id, merge_key: mergeKey(name), name, description, source: path.resolve(sourcePath), destination,
    when_to_use: parts['when to use'] || parts['when to invoke this skill'] || parts['triggers'] || '',
    procedure: parts['procedure'] || parts['workflow'] || parts['how it works'] || '',
    completion: parts['completion contract'] || parts['completion gate'] || parts['output'] || ''
  };
}

export async function importSkillDirectory(sourceDir) {
  sourceDir = await resolveSourcePath(sourceDir);
  const files = [];
  async function walk(dir) {
    for (const entry of await fs.readdir(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) await walk(full);
      else if (entry.isFile() && entry.name.toLowerCase() === 'skill.md') files.push(full);
    }
  }
  await walk(sourceDir);
  const imported = [];
  for (const file of files) imported.push(await importSkill(file));
  const indexPath = path.join(root, 'skills', 'imported', 'INDEX.json');
  let existing = [];
  try { existing = JSON.parse(await fs.readFile(indexPath, 'utf8')); } catch { /* first import */ }
  const all = [...existing, ...imported];
  const groups = new Map();
  for (const item of all) {
    const key = item.merge_key || mergeKey(item.name || item.id.replace(/^cg\./, ''));
    const current = groups.get(key) || { id: `cg.${key}`, merge_key: key, names: [], descriptions: [], sources: [], destinations: [], merged_from: [], when_to_use: [], procedures: [], completions: [] };
    if (item.name && !current.names.includes(item.name)) current.names.push(item.name);
    if (item.description && !current.descriptions.includes(item.description)) current.descriptions.push(item.description);
    if (item.source && !current.sources.includes(item.source)) current.sources.push(item.source);
    if (item.destination && !current.destinations.includes(item.destination)) current.destinations.push(item.destination);
    if (!current.merged_from.includes(item.id)) current.merged_from.push(item.id);
    if (item.when_to_use && !current.when_to_use.includes(item.when_to_use)) current.when_to_use.push(item.when_to_use);
    if (item.procedure && !current.procedures.includes(item.procedure)) current.procedures.push(item.procedure);
    if (item.completion && !current.completions.includes(item.completion)) current.completions.push(item.completion);
    groups.set(key, current);
  }
  const merged = [...groups.values()].map((item) => ({
    ...item,
    source: item.sources[0] || '',
    description: item.descriptions.join('；'),
    quality: quality(item)
  }));
  const planEntry = merged.find((item) => item.id === 'cg.ce-plan');
  if (planEntry && !merged.some((item) => item.id === 'cg.plan')) merged.push({ ...planEntry, id: 'cg.plan', merge_key: 'plan' });
  merged.sort((a, b) => a.id.localeCompare(b.id));
  for (const item of merged) {
    const destination = path.join(root, 'skills', 'imported', item.merge_key, 'SKILL.md');
    const sources = item.sources.map((source) => `- ${source}`).join('\n');
    const purposes = item.descriptions.map((description) => `- ${description}`).join('\n') || '- Imported external capability';
    const when = item.when_to_use.map((value) => `### 来源要点\n${value}`).join('\n\n') || '按任务类型、用户意图和风险选择该能力。';
    const procedure = item.procedures.map((value) => `### 来源流程\n${value}`).join('\n\n') || '读取上下文，执行最小必要步骤，记录可独立检查的证据。';
    const completion = item.completions.map((value) => `### 来源完成条件\n${value}`).join('\n\n') || '输出结果、证据、变更文件、剩余风险和下一步动作。';
    await fs.mkdir(path.dirname(destination), { recursive: true });
    await fs.writeFile(destination, `# ${item.id}\n\n## 用途\n\n${purposes}\n\n## 适用场景\n\n${when}\n\n## 合并流程\n\n${procedure}\n\n## 完成条件\n\n${completion}\n\n## 质量信息\n\n- 来源数量：${item.quality.source_count}\n- 内容覆盖度：${item.quality.coverage}/3\n- 可信度：${item.quality.confidence}\n- 优先级：${item.quality.priority}\n\n## 冲突处理\n\n优先采用更明确的适用条件、更小的变更范围、可独立检查的证据，以及 CG Harness 的状态和完成门槛。不得绕过用户确认或任务状态校验。\n\n## 合并来源\n\n${sources}\n\n## CG Harness 输出\n\n返回标准技能输出：result、outputs、evidence、changed_files、remaining_risk、next_action。外部能力不可用时必须记录 unavailable 或 fallback。\n`, 'utf8');
    item.destination = destination;
  }
  await fs.mkdir(path.dirname(indexPath), { recursive: true });
  await fs.writeFile(indexPath, JSON.stringify(merged, null, 2), 'utf8');
  return { source: path.resolve(sourceDir), imported, index: indexPath };
}

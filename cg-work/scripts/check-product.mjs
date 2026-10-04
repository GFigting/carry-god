import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import yaml from 'js-yaml';

const frameworkRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

const requiredSections = ['目标与边界', '版本与主题', '切片', '探索区', '未决决策', '版本验收'];
const sliceColumns = ['切片', '版本/主题', '状态', '优先级', '依赖', '需求来源', '任务引用', '进入 ready 的证据'];
const statuses = new Set(['proposed', 'ready', 'in_progress', 'review', 'done', 'deferred', 'dropped']);
const placeholder = /待处理|TBD|TODO|^\?+$/i;

const exists = async (target) => { try { await fs.access(target); return true; } catch { return false; } };

function collectSections(content) {
  const found = new Map();
  let current = null;
  for (const line of content.split(/\r?\n/)) {
    const heading = line.match(/^##\s+(.+?)\s*$/);
    if (heading) {
      current = heading[1];
      found.set(current, []);
      continue;
    }
    if (current) found.get(current).push(line);
  }
  return found;
}

function tableRows(lines) {
  const start = lines.findIndex((line) => line.trim().startsWith('|'));
  if (start === -1) return null;
  const cells = (line) => line.trim().replace(/^\|/, '').replace(/\|$/, '').split('|').map((cell) => cell.trim());
  const rows = [];
  for (let index = start + 2; index < lines.length; index += 1) {
    if (!lines[index].trim().startsWith('|')) break;
    rows.push(cells(lines[index]));
  }
  return { header: cells(lines[start]), rows };
}

function resolveRef(file, value) {
  if (!value || value === '-' || /^https?:/.test(value)) return null;
  return path.resolve(path.dirname(file), value);
}

// 路线图存放在原项目仓库，因此引用允许写成"任务 id"或"需求包文件名"。
// 通过项目上下文里登记的 product.roadmap_path 反查项目，才能把它们解析到框架本地的记录。
async function inferProject(file) {
  const projectsRoot = path.join(frameworkRoot, 'local', 'projects');
  let entries;
  try {
    entries = await fs.readdir(projectsRoot, { withFileTypes: true });
  } catch {
    return null;
  }
  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    let context;
    try {
      context = yaml.load(await fs.readFile(path.join(projectsRoot, entry.name, 'project-context.yaml'), 'utf8'));
    } catch {
      continue;
    }
    const rootPath = context?.project?.root_path;
    const roadmapPath = context?.product?.roadmap_path;
    if (typeof rootPath !== 'string' || typeof roadmapPath !== 'string') continue;
    const base = rootPath === '.' ? frameworkRoot : rootPath;
    if (path.resolve(base, roadmapPath) === file) return { id: entry.name };
  }
  return null;
}

async function checkReference(file, value, { kind, project, label, errors }) {
  const name = kind === 'task' ? '任务引用' : '需求来源';
  if (!value || value === '-' || /^https?:/.test(value)) return;
  if (await exists(path.resolve(path.dirname(file), value))) return;
  if (!value.includes('/')) {
    if (project) {
      const base = path.join(frameworkRoot, 'local', 'projects', project.id);
      const candidates = kind === 'task'
        ? [path.join(base, 'tasks', value, 'task.yaml')]
        : [path.join(base, 'requirements-inbox', value)];
      for (const candidate of candidates) {
        if (await exists(candidate)) return;
      }
    }
    errors.push(`${label}的${name}无法解析：${value}（既不是存在的路径，也不是本项目登记的任务 id 或需求包文件名）`);
    return;
  }
  errors.push(`${label}的${name}路径不存在：${value}`);
}

export async function checkProductRoadmap(target) {
  const file = path.resolve(target);
  const errors = [];
  let content;
  try {
    content = await fs.readFile(file, 'utf8');
  } catch (error) {
    return [`无法读取项目路线图：${file}（${error.message}）`];
  }

  const sections = collectSections(content);
  for (const title of requiredSections) {
    if (!sections.has(title)) errors.push(`缺少章节：## ${title}`);
  }
  const project = await inferProject(file);

  const themes = tableRows(sections.get('版本与主题') ?? []);
  if (!themes) errors.push('“版本与主题”必须是表格');
  const themeNames = new Set((themes?.rows ?? []).map((row) => row[0]));

  const sliceTable = tableRows(sections.get('切片') ?? []);
  if (!sliceTable) {
    errors.push('“切片”必须是表格');
  } else {
    if (sliceTable.header.join('|') !== sliceColumns.join('|')) {
      errors.push(`“切片”表头必须是：${sliceColumns.join(' | ')}`);
    }
    for (const [index, row] of sliceTable.rows.entries()) {
      const label = `切片第 ${index + 1} 行`;
      const [name, theme, status, priority, , source, taskReference, evidence] = row;
      if (!name || placeholder.test(name)) errors.push(`${label}缺少切片名称`);
      if (!status) errors.push(`${label}缺少状态`);
      else if (!statuses.has(status)) errors.push(`${label}状态无效：${status}（可选值：${[...statuses].join('、')}）`);
      if (priority && !/^(P[0-3]|-)$/.test(priority)) errors.push(`${label}优先级无效：${priority}（P0-P3 或 -）`);
      if (theme && !themeNames.has(theme)) errors.push(`${label}的版本/主题“${theme}”未在“版本与主题”中登记`);
      await checkReference(file, source, { kind: 'requirement', project, label, errors });
      await checkReference(file, taskReference, { kind: 'task', project, label, errors });
      if (status === 'done' && (!taskReference || taskReference === '-')) errors.push(`${label}状态为 done 但未填写任务引用`);
      if (['ready', 'in_progress', 'review', 'done'].includes(status ?? '') && (!evidence || evidence === '-')) {
        errors.push(`${label}状态为 ${status} 但没有填写“进入 ready 的证据”`);
      }
    }
  }

  const decisions = tableRows(sections.get('未决决策') ?? []);
  if (!decisions) {
    errors.push('“未决决策”必须是表格');
  } else {
    for (const [index, row] of decisions.rows.entries()) {
      if (!row[0]) continue;
      if (!row[2] || row[2] === '-') errors.push(`未决决策第 ${index + 1} 行缺少“需要的用户动作”`);
    }
  }

  if (!tableRows(sections.get('版本验收') ?? [])) errors.push('“版本验收”必须是表格');

  return errors;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const target = process.argv[2];
  if (!target) {
    console.error('用法：node scripts/check-product.mjs <项目路线图文件路径>');
    process.exitCode = 1;
  } else {
    const errors = await checkProductRoadmap(target);
    if (errors.length) {
      console.error(errors.join('\n'));
      process.exitCode = 1;
    } else {
      console.log(`项目路线图校验通过：${path.resolve(target)}`);
    }
  }
}

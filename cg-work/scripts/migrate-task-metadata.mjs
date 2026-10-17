import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import yaml from 'js-yaml';

const frameworkRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const historicalReason = '历史迁移：原记录未保存时间与原因';
const referenceKeys = ['plan', 'review', 'verification', 'handoff', 'learning', 'closure'];

async function exists(target) {
  try { await fs.access(target); return true; } catch { return false; }
}

async function taskFiles(root, project) {
  const tasksRoot = path.join(root, 'local', 'projects', project, 'tasks');
  if (!(await exists(tasksRoot))) return [];
  const files = [];
  for (const entry of await fs.readdir(tasksRoot, { withFileTypes: true })) {
    if (!entry.isDirectory() || entry.name === 'archive') continue;
    const file = path.join(tasksRoot, entry.name, 'task.yaml');
    if (await exists(file)) files.push(file);
  }
  return files;
}

// --- 原有转换（保留） ---

function replaceDocumentationAliases(text, task) {
  const doc = task.documentation;
  if (!doc || typeof doc !== 'object' || Array.isArray(doc)) return { text, changed: false, error: null };
  if (doc.targets !== undefined && doc.files !== undefined) {
    return { text, changed: false, error: 'documentation.targets 与 documentation.files 不能同时存在' };
  }
  if (doc.not_needed_reason !== undefined && doc.reason !== undefined) {
    return { text, changed: false, error: 'documentation.not_needed_reason 与 documentation.reason 不能同时存在' };
  }
  let output = text;
  if (doc.targets !== undefined) output = output.replace(/^  targets:/m, '  files:');
  if (doc.not_needed_reason !== undefined) output = output.replace(/^  not_needed_reason:/m, '  reason:');
  return { text: output, changed: output !== text, error: null };
}

function replaceStatusHistory(text, task) {
  if (!Array.isArray(task.status_history) || task.status_history.some((entry) => typeof entry !== 'string')) {
    return { text, changed: false, error: null };
  }
  const eol = text.includes('\r\n') ? '\r\n' : '\n';
  const pattern = /^status_history:\r?\n(?:[ \t]*-[^\r\n]*(?:\r?\n|$))*/m;
  if (!pattern.test(text)) return { text, changed: false, error: 'status_history 无法定位为顶层列表' };
  const replacement = [
    'status_history:',
    ...task.status_history.flatMap((status) => [
      `  - status: ${status}`,
      '    at: null',
      `    reason: ${JSON.stringify(historicalReason)}`,
    ]),
  ].join(eol) + eol;
  return { text: text.replace(pattern, replacement), changed: true, error: null };
}

// --- 新转换 ---

/**
 * 把 execution_profile + artifact_profile 合并为单一 delivery_path。
 * 已显式声明 delivery_path 的跳过。完全省略两个旧字段的任务保持省略（省略=standard，见 core/operating-model.md）。
 */
function replaceDeliveryPath(text, task) {
  if (task.delivery_path !== undefined) return { text, changed: false };
  const hasEP = task.execution_profile !== undefined;
  const hasAP = task.artifact_profile !== undefined;
  if (!hasEP && !hasAP) return { text, changed: false };

  let newPath;
  // 优先级：artifact_profile: compact 覆盖 execution_profile: standard 的组合
  if (hasEP && task.execution_profile === 'lightweight') newPath = 'lightweight';
  else if (hasAP && task.artifact_profile === 'compact') newPath = 'compact';
  else if (hasEP && task.execution_profile === 'standard') newPath = 'standard';
  else return { text, changed: false }; // 字段存在但值无效，不做猜测，保留原文

  let output = text;
  const eol = text.includes('\r\n') ? '\r\n' : '\n';

  // 1. 在 workflow: 行后面插入 delivery_path: <path>
  const workflowPattern = /^(workflow:\s*.+)$/m;
  if (workflowPattern.test(output)) {
    output = output.replace(workflowPattern, `$1${eol}delivery_path: ${newPath}`);
  } else {
    // fallback：在 id: 后面
    const idPattern = /^(id:\s*.+)$/m;
    output = output.replace(idPattern, `$1${eol}delivery_path: ${newPath}`);
  }

  // 2. 删除 execution_profile 行
  if (hasEP) {
    output = output.replace(/^execution_profile:\s*.+\r?\n/m, '');
  }
  // 3. 删除 artifact_profile 行
  if (hasAP) {
    output = output.replace(/^artifact_profile:\s*.+\r?\n/m, '');
  }

  return { text: output, changed: output !== text };
}

/**
 * 把顶层 *_reference 字段分组进 artifacts 对象。
 * 已声明 artifacts 但没有 *_reference 顶层字段的跳过（已是新格式）。
 * 处理三种情况：无 artifacts 顶层键（新建）、有 artifacts.primary 但无其他（追加）、全部跳过。
 */
function groupArtifactRefs(text, task) {
  // 找出所有存在的 *_reference 顶层字段（且不在 artifacts 内）
  const refsToGroup = referenceKeys.filter((key) => {
    // 已存在于新格式 artifacts.* → 跳过
    if (task.artifacts && task.artifacts[key] !== undefined) return false;
    // 存在于旧格式顶层 *_reference → 需要分组
    const legacyKey = `${key}_reference`;
    return task[legacyKey] !== undefined;
  });
  if (refsToGroup.length === 0) return { text, changed: false };

  const eol = text.includes('\r\n') ? '\r\n' : '\n';
  let output = text;

  // 收集要迁移的值
  const migratedEntries = refsToGroup.map((key) => ({
    key,
    legacyKey: `${key}_reference`,
    value: task[`${key}_reference`],
  }));

  // 构建新的 artifacts 对象行
  const existingArtifacts = task.artifacts && typeof task.artifacts === 'object';
  const newArtifactLines = migratedEntries.map((e) => `  ${e.key}: ${e.value}`).join(eol);

  if (existingArtifacts) {
    // 在现有 artifacts 对象末尾追加新条目
    // 找到 artifacts: 行及其所有子行，在最后一个子行后追加
    const lines = output.split(/\r?\n/);
    let artifactsStart = -1;
    let artifactsEnd = -1;
    let foundPrimary = false;
    for (let i = 0; i < lines.length; i += 1) {
      if (/^artifacts:\s*$/.test(lines[i])) {
        artifactsStart = i;
        // 从下一行开始收集子行（缩进大于 0 或为空行前的子行）
        for (let j = i + 1; j < lines.length; j += 1) {
          if (lines[j].startsWith('  ') || lines[j].trim() === '') {
            if (/^\s+primary:/.test(lines[j])) foundPrimary = true;
            artifactsEnd = j;
          } else {
            break;
          }
        }
        break;
      }
    }
    if (artifactsStart >= 0) {
      // 在 artifacts: 块后追加新条目
      const insertAt = artifactsEnd + 1;
      const newLines = output.split(/\r?\n/);
      const insertion = newArtifactLines.split(/\r?\n/);
      newLines.splice(insertAt, 0, ...insertion);
      output = newLines.join(eol);
    } else {
      return { text, changed: false, error: 'artifacts 顶层键存在但无法定位文本块' };
    }
  } else {
    // 新建 artifacts 对象，插入到 workflow: 行后面（紧跟 delivery_path: 之后如果存在）
    const artifactsBlock = ['artifacts:', newArtifactLines].join(eol);
    // 找插入点：workflow 行之后
    const workflowMatch = output.match(/^(workflow:\s*.+)$/m);
    if (workflowMatch) {
      const wfIdx = workflowMatch.index ?? 0;
      let insertPos = wfIdx + workflowMatch[0].length;
      output = output.slice(0, insertPos) + eol + artifactsBlock + eol + output.slice(insertPos);
    } else {
      // fallback：id 行之后
      const idMatch = output.match(/^(id:\s*.+)$/m);
      if (idMatch) {
        const idIdx = idMatch.index ?? 0;
        let insertPos = idIdx + idMatch[0].length;
        output = output.slice(0, insertPos) + eol + artifactsBlock + eol + output.slice(insertPos);
      }
    }
  }

  // 删除所有被迁移的旧顶层 *_reference 行
  for (const e of migratedEntries) {
    const linePattern = new RegExp(`^${e.legacyKey}:\\s*.+$`, 'm');
    output = output.replace(linePattern, '');
  }
  // 清理迁移产生的多余空行（连续 2+ 空行变成 1 行）
  output = output.replace(/\r?\n{3,}/g, eol + eol).trimEnd() + eol;

  return { text: output, changed: output !== text };
}

/**
 * 去掉 created_at / archived_at / status_history.at 行的时区后缀（+HH:MM 或 Z）。
 * 仅处理顶层字段和 status_history 数组内的 at 字段。
 */
function stripTimezones(text) {
  const tzPattern = /^(\s*)(created_at|archived_at|at):\s*"?(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2})(?:\.\d{1,3})?([Zz]|[+\-]\d{2}:\d{2})?"?\s*$/gm;
  const output = text.replace(tzPattern, (match, indent, key, value, tz) => {
    // 只有时区后缀/毫秒/引号实际存在时才算变更；否则原样返回，避免把无后缀行误报为待迁移。
    if (!tz && !/\.\d{1,3}/.test(match) && !/"/.test(match)) return match;
    return `${indent}${key}: ${value}`;
  });
  return { text: output, changed: output !== text };
}

/**
 * 删除已废弃的顶层字段行：project_id / title / execution_profile / artifact_profile
 */
function stripLegacyFields(text) {
  const legacyKeys = ['project_id', 'title', 'execution_profile', 'artifact_profile'];
  let changed = false;
  let output = text;
  const eol = text.includes('\r\n') ? '\r\n' : '\n';
  for (const key of legacyKeys) {
    const pattern = new RegExp(`^${key}:\\s*.*$`, 'm');
    if (pattern.test(output)) {
      output = output.replace(pattern, '');
      changed = true;
    }
  }
  if (changed) {
    output = output.replace(/\r?\n{3,}/g, eol + eol).trimEnd() + eol;
  }
  return { text: output, changed };
}

// --- 统一入口 ---

export function migrateTaskText(text, task, {
  documentation = false,
  statusHistory = false,
  deliveryPath = false,
  artifactGroup = false,
  timezones = false,
  deprecateFields = false,
} = {}) {
  let output = text;
  const errors = [];
  let changed = false;

  if (documentation) {
    const result = replaceDocumentationAliases(output, task);
    if (result.error) errors.push(result.error);
    else { output = result.text; changed ||= result.changed; }
  }
  if (statusHistory) {
    const result = replaceStatusHistory(output, yaml.load(output));
    if (result.error) errors.push(result.error);
    else { output = result.text; changed ||= result.changed; }
  }
  if (deliveryPath) {
    const result = replaceDeliveryPath(output, yaml.load(output));
    if (result.error) errors.push(result.error);
    else { output = result.text; changed ||= result.changed; }
  }
  if (artifactGroup) {
    const result = groupArtifactRefs(output, yaml.load(output));
    if (result.error) errors.push(result.error);
    else { output = result.text; changed ||= result.changed; }
  }
  if (timezones) {
    const result = stripTimezones(output);
    changed ||= result.changed;
    output = result.text;
  }
  if (deprecateFields) {
    const result = stripLegacyFields(output);
    changed ||= result.changed;
    output = result.text;
  }

  return { text: output, changed, errors };
}

async function migrateOneProject({
  root, project, documentation, statusHistory, deliveryPath, artifactGroup, timezones, deprecateFields, apply,
}) {
  const changed = [];
  const errors = [];
  // timezones / deprecateFields 是纯文本转换，不要求 YAML 可解析；
  // 其余转换需要 YAML 结构信息，解析失败时跳过该文件并记录错误。
  const textOnly = timezones || deprecateFields;
  for (const file of await taskFiles(root, project)) {
    let text;
    let task = null;
    let parseError = null;
    try {
      text = await fs.readFile(file, 'utf8');
      task = yaml.load(text);
    } catch (error) {
      parseError = error;
    }
    // 归档跳过：解析成功时用 archived 字段；解析失败时退化为路径判断（tasks/archive/ 下即归档）。
    const isArchived = task ? task.archived === true : path.dirname(file).endsWith(path.join('tasks', 'archive'));
    if (parseError && !textOnly) {
      errors.push(`${path.relative(root, file)}：YAML 无法解析：${parseError.message}`);
      continue;
    }
    if (isArchived) continue;
    if (parseError) {
      // 纯文本转换：用空对象占位，下方转换均不读取其结构字段。
      task = {};
    }
    const result = migrateTaskText(text, task, {
      documentation, statusHistory, deliveryPath, artifactGroup, timezones, deprecateFields,
    });
    if (result.errors.length) {
      errors.push(`${path.relative(root, file)}：${result.errors.join('；')}`);
      continue;
    }
    if (!result.changed) continue;
    changed.push(file);
    if (apply) await fs.writeFile(file, result.text);
  }
  return { changed, errors };
}

async function listProjects(root) {
  const projectsRoot = path.join(root, 'local', 'projects');
  if (!(await exists(projectsRoot))) return [];
  const names = [];
  for (const entry of await fs.readdir(projectsRoot, { withFileTypes: true })) {
    if (entry.isDirectory() && await exists(path.join(projectsRoot, entry.name, 'tasks'))) names.push(entry.name);
  }
  return names.sort();
}

export async function migrateTaskMetadata({
  root = frameworkRoot,
  project = 'cg-work',
  allProjects = false,
  documentation = false,
  statusHistory = false,
  deliveryPath = false,
  artifactGroup = false,
  timezones = false,
  deprecateFields = false,
  apply = false,
} = {}) {
  const changed = [];
  const errors = [];
  const anyOption = documentation || statusHistory || deliveryPath || artifactGroup || timezones || deprecateFields;
  if (!anyOption) errors.push('至少指定一个转换选项（--documentation / --status-history / --delivery-path / --artifact-group / --timezones / --deprecate-fields）');

  const projects = allProjects ? await listProjects(root) : [project];
  for (const proj of projects) {
    const result = await migrateOneProject({
      root, project: proj, documentation, statusHistory, deliveryPath, artifactGroup, timezones, deprecateFields, apply,
    });
    for (const e of result.errors) errors.push(e);
    for (const c of result.changed) changed.push(c);
  }
  return { changed, errors, applied: apply };
}

function parseArgs(argv) {
  const options = {
    root: frameworkRoot,
    project: 'cg-work',
    allProjects: false,
    documentation: false,
    statusHistory: false,
    deliveryPath: false,
    artifactGroup: false,
    timezones: false,
    deprecateFields: false,
    apply: false,
  };
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === '--root') options.root = path.resolve(argv[++index]);
    else if (arg === '--project') options.project = argv[++index];
    else if (arg === '--all-projects') options.allProjects = true;
    else if (arg === '--documentation') options.documentation = true;
    else if (arg === '--status-history') options.statusHistory = true;
    else if (arg === '--delivery-path') options.deliveryPath = true;
    else if (arg === '--artifact-group') options.artifactGroup = true;
    else if (arg === '--timezones') options.timezones = true;
    else if (arg === '--deprecate-fields') options.deprecateFields = true;
    else if (arg === '--apply') options.apply = true;
    else throw new Error(`未知参数：${arg}`);
  }
  return options;
}

const usage = [
  '用法：node scripts/migrate-task-metadata.mjs',
  '  转换选项（至少一个）：--documentation --status-history --delivery-path --artifact-group --timezones --deprecate-fields',
  '  范围：--project <name>（默认 cg-work）或 --all-projects（动态扫描 local/projects 下所有含 tasks 的项目）',
  '  执行：不加 --apply 为预览；加 --apply 才写入',
].join('\n');

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    const result = await migrateTaskMetadata(parseArgs(process.argv.slice(2)));
    for (const error of result.errors) console.error(error);
    console.log(`${result.applied ? '已迁移' : '预览迁移'}任务数：${result.changed.length}`);
    for (const file of result.changed) console.log(`- ${file}`);
    if (result.errors.length) process.exitCode = 1;
    else if (!result.applied) console.log('未写入文件；添加 --apply 才会执行迁移。');
  } catch (error) {
    console.error(`${error.message}\n${usage}`);
    process.exitCode = 1;
  }
}

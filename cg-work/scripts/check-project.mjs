import fs from 'node:fs/promises';
import path from 'node:path';
import yaml from 'js-yaml';

const contextFile = process.argv[2];

if (!contextFile) {
  console.error('用法：node scripts/check-project.mjs <项目上下文文件路径>');
  process.exitCode = 1;
} else {
  const file = path.resolve(contextFile);
  const errors = [];
  let content;

  try {
    content = await fs.readFile(file, 'utf8');
  } catch (error) {
    console.error(`无法读取项目上下文：${file}（${error.message}）`);
    process.exitCode = 1;
  }

  if (content !== undefined) {
    let context;
    try {
      context = yaml.load(content, { json: false });
    } catch (error) {
      errors.push(`YAML 无效：${error.message}`);
    }

    if (!isObject(context)) {
      errors.push('项目上下文必须是 YAML 映射对象');
    } else {
      const requiredTopLevel = ['project', 'technology', 'instructions', 'documents', 'runtime', 'requirements', 'vocabulary', 'skills', 'required_context'];
      for (const key of requiredTopLevel) {
        if (!(key in context)) errors.push(`缺少顶层字段：${key}`);
      }

      const project = objectField(context, 'project', errors);
      const rootPathValue = stringField(project, 'root_path', 'project.root_path', errors);
      const projectId = stringField(project, 'id', 'project.id', errors);

      if (projectId && !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(projectId)) errors.push('project.id 必须使用小写 kebab-case');
      if (rootPathValue && !path.isAbsolute(rootPathValue)) errors.push('project.root_path 必须是绝对路径');
      if (projectId && path.basename(path.dirname(file)) !== projectId) errors.push('上下文目录名必须与 project.id 一致');

      const projectRoot = rootPathValue && path.isAbsolute(rootPathValue) ? path.resolve(rootPathValue) : '';
      if (projectRoot) {
        try {
          const stat = await fs.stat(projectRoot);
          if (!stat.isDirectory()) errors.push(`project.root_path 不是目录：${projectRoot}`);
        } catch {
          errors.push(`project.root_path 不存在：${projectRoot}`);
        }
      }

      const instructions = objectField(context, 'instructions', errors);
      const codingStandards = context.coding_standards === undefined ? null : objectField(context, 'coding_standards', errors);
      const documents = objectField(context, 'documents', errors);
      const runtime = objectField(context, 'runtime', errors);
      const requirements = objectField(context, 'requirements', errors);
      const skills = objectField(context, 'skills', errors);
      const verification = context.verification === undefined ? null : objectField(context, 'verification', errors);
      const inboxPath = stringField(requirements, 'inbox_path', 'requirements.inbox_path', errors);

      await checkAbsolutePaths(instructions?.files, 'instructions.files', errors);
      if (codingStandards) await checkAbsolutePaths(codingStandards.files, 'coding_standards.files', errors);
      for (const key of ['business', 'architecture', 'api']) await checkAbsolutePaths(documents?.[key], `documents.${key}`, errors);
      await checkAbsolutePaths(runtime?.entrypoints, 'runtime.entrypoints', errors);
      await checkAbsolutePaths(runtime?.health_checks, 'runtime.health_checks', errors, { allowUrls: true });
      await checkAbsolutePaths(context.required_context, 'required_context', errors);
      if (inboxPath) {
        if (!path.isAbsolute(inboxPath)) errors.push('requirements.inbox_path 必须是绝对路径');
        else if (path.basename(inboxPath) !== 'requirements-inbox') errors.push('requirements.inbox_path 必须指向 requirements-inbox 目录');
        else if (!(await exists(inboxPath))) errors.push(`requirements.inbox_path 不存在：${inboxPath}`);
      }

      if (skills && !Array.isArray(skills.paths)) {
        errors.push('skills.paths 必须是列表');
      } else if (skills && projectRoot) {
        for (const value of skills.paths) {
          if (typeof value !== 'string' || !value.trim()) errors.push('skills.paths 中的条目必须是非空字符串');
          else if (path.isAbsolute(value)) errors.push(`技能路径必须相对于 project.root_path：${value}`);
          else if (!(await exists(path.resolve(projectRoot, value)))) errors.push(`技能路径不存在：${value}`);
        }
      }
      await checkRepositories(context.repositories, errors);
      checkVerificationProfiles(verification, errors);
    }
  }

  if (errors.length) {
    console.error(errors.join('\n'));
    process.exitCode = 1;
  } else if (content !== undefined) {
    console.log(`项目上下文校验通过：${file}`);
  }
}

async function checkRepositories(repositories, errors) {
  if (repositories === undefined) return;
  if (!Array.isArray(repositories)) {
    errors.push('repositories 必须是列表');
    return;
  }
  const ids = new Set();
  for (const item of repositories) {
    if (!isObject(item)) {
      errors.push('repositories 中的条目必须是映射对象');
      continue;
    }
    const id = stringField(item, 'id', 'repositories[].id', errors);
    stringField(item, 'role', 'repositories[].role', errors);
    const rootPath = stringField(item, 'root_path', 'repositories[].root_path', errors);
    if (id && !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(id)) errors.push(`repositories[].id 必须使用小写 kebab-case：${id}`);
    if (id && !ids.add(id)) errors.push(`repositories[].id 不可重复：${id}`);
    if (rootPath && !path.isAbsolute(rootPath)) errors.push(`repositories[].root_path 必须是绝对路径：${rootPath}`);
    else if (rootPath && !(await exists(rootPath))) errors.push(`repositories[].root_path 不存在：${rootPath}`);
  }
}

function checkVerificationProfiles(verification, errors) {
  if (verification === null) return;
  if (!Array.isArray(verification.profiles)) {
    errors.push('verification.profiles 必须是列表');
    return;
  }
  const ids = new Set();
  const outcomes = new Set(['required', 'environment_limited', 'not_applicable']);
  for (const item of verification.profiles) {
    if (!isObject(item)) {
      errors.push('verification.profiles 中的条目必须是映射对象');
      continue;
    }
    const id = stringField(item, 'id', 'verification.profiles[].id', errors);
    stringField(item, 'stage', 'verification.profiles[].stage', errors);
    stringField(item, 'command', 'verification.profiles[].command', errors);
    const outcome = stringField(item, 'outcome', 'verification.profiles[].outcome', errors);
    if (id && !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(id)) errors.push(`verification.profiles[].id 必须使用小写 kebab-case：${id}`);
    if (id && !ids.add(id)) errors.push(`verification.profiles[].id 不可重复：${id}`);
    if (outcome && !outcomes.has(outcome)) errors.push(`verification.profiles[].outcome 无效：${outcome}`);
    if (item.limitation !== undefined && (typeof item.limitation !== 'string' || !item.limitation.trim())) {
      errors.push('verification.profiles[].limitation 必须是非空字符串');
    }
  }
}

function isObject(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function objectField(parent, key, errors) {
  if (!parent || !(key in parent)) return null;
  if (!isObject(parent[key])) {
    errors.push(`${key} 必须是映射对象`);
    return null;
  }
  return parent[key];
}

function stringField(parent, key, label, errors) {
  if (!parent || !(key in parent)) {
    errors.push(`${label} 为必填字段`);
    return '';
  }
  if (typeof parent[key] !== 'string' || !parent[key].trim()) {
    errors.push(`${label} 必须是非空字符串`);
    return '';
  }
  return parent[key].trim();
}

async function checkAbsolutePaths(values, label, errors, { allowUrls = false } = {}) {
  if (values === undefined) return;
  if (!Array.isArray(values)) {
    errors.push(`${label} 必须是列表`);
    return;
  }
  for (const value of values) {
    if (typeof value !== 'string' || !value.trim()) errors.push(`${label} 中的条目必须是非空字符串`);
    else if (allowUrls && /^(https?:|mailto:)/.test(value)) continue;
    else if (!path.isAbsolute(value)) errors.push(`登记的项目路径必须是绝对路径：${value}`);
    else if (!(await exists(value))) errors.push(`登记的路径不存在：${value}`);
  }
}

async function exists(target) {
  try { await fs.access(target); return true; } catch { return false; }
}

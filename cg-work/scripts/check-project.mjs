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
      const requiredTopLevel = ['project', 'technology', 'instructions', 'documents', 'runtime', 'vocabulary', 'skills', 'required_context'];
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
      const documents = objectField(context, 'documents', errors);
      const runtime = objectField(context, 'runtime', errors);
      const skills = objectField(context, 'skills', errors);

      await checkAbsolutePaths(instructions?.files, 'instructions.files', errors);
      for (const key of ['business', 'architecture', 'api']) await checkAbsolutePaths(documents?.[key], `documents.${key}`, errors);
      await checkAbsolutePaths(runtime?.entrypoints, 'runtime.entrypoints', errors);
      await checkAbsolutePaths(runtime?.health_checks, 'runtime.health_checks', errors, { allowUrls: true });
      await checkAbsolutePaths(context.required_context, 'required_context', errors);

      if (skills && !Array.isArray(skills.paths)) {
        errors.push('skills.paths 必须是列表');
      } else if (skills && projectRoot) {
        for (const value of skills.paths) {
          if (typeof value !== 'string' || !value.trim()) errors.push('skills.paths 中的条目必须是非空字符串');
          else if (path.isAbsolute(value)) errors.push(`技能路径必须相对于 project.root_path：${value}`);
          else if (!(await exists(path.resolve(projectRoot, value)))) errors.push(`技能路径不存在：${value}`);
        }
      }
    }
  }

  if (errors.length) {
    console.error(errors.join('\n'));
    process.exitCode = 1;
  } else if (content !== undefined) {
    console.log(`项目上下文校验通过：${file}`);
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

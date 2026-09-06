import fs from 'node:fs/promises';
import path from 'node:path';

const instructionFiles = ['AGENTS.md', 'CLAUDE.md', 'README.md'];

export async function initializeProject(projectPath = process.cwd()) {
  const root = path.resolve(projectPath);
  const files = await fs.readdir(root, { withFileTypes: true });
  const names = new Set(files.map((entry) => entry.name));
  const stack = [];
  if (names.has('package.json')) stack.push('Node.js');
  if (names.has('package-lock.json')) stack.push('npm');
  if (names.has('bun.lock') || names.has('bun.lockb')) stack.push('Bun');
  if (names.has('pnpm-lock.yaml')) stack.push('pnpm');
  if (names.has('yarn.lock')) stack.push('Yarn');
  if (names.has('pyproject.toml') || names.has('requirements.txt')) stack.push('Python');
  if (names.has('pom.xml')) stack.push('Java/Maven');
  if (names.has('go.mod')) stack.push('Go');
  if (names.has('Cargo.toml')) stack.push('Rust');
  const instructions = instructionFiles.filter((file) => names.has(file));
  const config = {
    version: 1,
    project: { name: path.basename(root), path: root, tech_stack: stack, instructions },
    initialized_at: new Date().toISOString(),
    harness: { tasks_path: 'tasks', artifacts_path: 'artifacts', context_path: 'context', knowledge_path: 'knowledge' }
  };
  const cgDir = path.join(root, '.cg');
  await fs.mkdir(cgDir, { recursive: true });
  for (const dir of ['tasks', 'artifacts', 'context', 'knowledge']) await fs.mkdir(path.join(cgDir, dir), { recursive: true });
  await fs.writeFile(path.join(cgDir, 'project.json'), `${JSON.stringify(config, null, 2)}\n`, 'utf8');
  return config;
}

export async function loadProjectConfig(projectPath = process.cwd()) {
  try { return JSON.parse(await fs.readFile(path.join(path.resolve(projectPath), '.cg', 'project.json'), 'utf8')); }
  catch (error) { if (error.code === 'ENOENT') return null; throw error; }
}

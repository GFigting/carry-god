import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import yaml from 'js-yaml';
import { defineConfig, type Plugin } from 'vite';
import vue from '@vitejs/plugin-vue';
import { collectData } from './scripts/collect.mjs';
import type { Snapshot } from './src/types';

const here = path.dirname(fileURLToPath(import.meta.url));
const repo = path.resolve(here, '../../../../..');
const VIRTUAL_ID = 'virtual:cg-data';
const RESOLVED_ID = '\0' + VIRTUAL_ID;
const execFileAsync = promisify(execFile);

// 构建/启动时执行扫描，把快照以虚拟模块注入；监听任务记录与需求箱变化后重建。
function cgDataPlugin(): Plugin {
  const initial = collectData(repo);
  let snapshot: Snapshot = initial.snapshot as Snapshot;
  let cache = initial.cache;
  let timer: ReturnType<typeof setTimeout> | null = null;
  return {
    name: 'cg-data',
    resolveId(id) {
      if (id === VIRTUAL_ID) return RESOLVED_ID;
    },
    load(id) {
      if (id === RESOLVED_ID) return `export default ${JSON.stringify(snapshot)}`;
    },
    configureServer(server) {
      const projectsDir = path.join(repo, 'local', 'projects');
      server.watcher.add(projectsDir);
      server.watcher.on('all', (_event, file) => {
        if (!file.startsWith(projectsDir)) return;
        if (!/task\.yaml$/.test(file) && !path.join(file).includes(`${path.sep}requirements-inbox${path.sep}`)) return;
        if (timer) clearTimeout(timer);
        timer = setTimeout(() => {
          // 增量重建：复用 git 与校验结果，任务变更时刷新从 ~9 秒降到 1 秒级。
          const next = collectData(repo, cache);
          snapshot = next.snapshot as Snapshot;
          cache = next.cache;
          server.moduleGraph.invalidateAll();
          server.ws.send({ type: 'full-reload' });
        }, 300);
      });
    },
  };
}

// ---- 开发态写接口：只做「批量验收」，只服务本机 ----
// 构建产物（dist）不包含本插件，页面也不会有写控件；默认只监听 127.0.0.1。
const MAX_BODY = 64 * 1024;
const MAX_IDS = 50;
const ID_PATTERN = /^[A-Za-z0-9][A-Za-z0-9._-]{0,119}$/;

function isLoopback(address: string | undefined): boolean {
  return address === '127.0.0.1' || address === '::1' || address === '::ffff:127.0.0.1';
}

// 与 scripts/acceptance-queue.mjs 同口径：只看非归档任务目录，ID 重名直接拒绝，避免误验收。
function findTask(id: string): { file: string } | { error: string } {
  const projectsDir = path.join(repo, 'local', 'projects');
  const hits: string[] = [];
  for (const proj of fs.readdirSync(projectsDir, { withFileTypes: true })) {
    if (!proj.isDirectory()) continue;
    const tasksDir = path.join(projectsDir, proj.name, 'tasks');
    if (!fs.existsSync(tasksDir)) continue;
    for (const entry of fs.readdirSync(tasksDir, { withFileTypes: true })) {
      if (!entry.isDirectory() || entry.name === 'archive' || entry.name !== id) continue;
      const file = path.join(tasksDir, entry.name, 'task.yaml');
      if (fs.existsSync(file)) hits.push(file);
    }
  }
  if (hits.length === 0) return { error: '找不到任务记录' };
  if (hits.length > 1) return { error: '任务 ID 在多个项目中重名，请回终端指定项目' };
  return { file: hits[0] };
}

function readBody(req: import('node:http').IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    let size = 0;
    req.on('data', (chunk: Buffer) => {
      size += chunk.length;
      if (size > MAX_BODY) {
        reject(new Error('请求体超过 64KB'));
        req.destroy();
        return;
      }
      chunks.push(chunk);
    });
    req.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
    req.on('error', reject);
  });
}

function cgWritePlugin(): Plugin {
  return {
    name: 'cg-write-api',
    apply: 'serve',
    configureServer(server) {
      server.middlewares.use('/api/accept', async (req, res) => {
        const send = (status: number, payload: unknown) => {
          res.statusCode = status;
          res.setHeader('Content-Type', 'application/json; charset=utf-8');
          res.setHeader('Cache-Control', 'no-store');
          res.end(JSON.stringify(payload));
        };

        if (!isLoopback(req.socket.remoteAddress)) return send(403, { ok: false, error: '仅允许本机访问' });
        if (req.method !== 'POST') {
          res.setHeader('Allow', 'POST');
          return send(405, { ok: false, error: '只支持 POST' });
        }
        if (req.headers['x-cg-write'] !== '1') return send(403, { ok: false, error: '缺少 X-CG-Write: 1 头' });

        let raw: string;
        try {
          raw = await readBody(req);
        } catch (err) {
          return send(413, { ok: false, error: (err as Error).message });
        }

        let body: { ids?: unknown; note?: unknown };
        try {
          body = JSON.parse(raw || '{}');
        } catch {
          return send(400, { ok: false, error: '请求体不是合法 JSON' });
        }

        if (!Array.isArray(body.ids) || body.ids.length === 0) return send(400, { ok: false, error: 'ids 需要是非空数组' });
        const ids = [...new Set(body.ids.map((value) => (typeof value === 'string' ? value.trim() : '')))];
        if (ids.length > MAX_IDS) return send(400, { ok: false, error: `一次最多验收 ${MAX_IDS} 项` });
        for (const id of ids) {
          if (!ID_PATTERN.test(id)) return send(400, { ok: false, error: `非法任务 ID：${id.slice(0, 40)}` });
        }
        const note = typeof body.note === 'string' ? body.note.trim().slice(0, 200) : '';

        // 先校验再写：任一不满足就整批拒绝，避免部分成功。
        for (const id of ids) {
          const hit = findTask(id);
          if ('error' in hit) return send(409, { ok: false, error: `${id}：${hit.error}` });
          let task: { status?: string } | undefined;
          try {
            task = yaml.load(fs.readFileSync(hit.file, 'utf8')) as { status?: string } | undefined;
          } catch {
            return send(409, { ok: false, error: `${id}：task.yaml 无法解析` });
          }
          if (task?.status !== 'review') {
            return send(409, { ok: false, error: `${id}：当前状态是 ${task?.status ?? '未知'}，只有 review 可验收` });
          }
        }

        try {
          const { stdout } = await execFileAsync(
            process.execPath,
            [path.join(repo, 'scripts', 'acceptance-queue.mjs'), '--accept', ids.join(','), '--note', note],
            { cwd: repo, timeout: 20000 },
          );
          return send(200, { ok: true, ids, output: stdout.trim() });
        } catch (err) {
          const failed = err as { stdout?: string; stderr?: string; message?: string };
          return send(500, { ok: false, error: failed.stderr || failed.stdout || failed.message || '验收脚本执行失败' });
        }
      });
    },
  };
}

export default defineConfig({
  base: './',
  plugins: [vue(), cgDataPlugin(), cgWritePlugin()],
  // 统一回环地址：避免 localhost 解析到 ::1 导致 127.0.0.1 打不开。
  server: { host: '127.0.0.1' },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
});

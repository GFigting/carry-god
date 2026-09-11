import http from 'node:http';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const args = process.argv.slice(2);
const option = (name, fallback) => {
  const index = args.indexOf(name);
  return index >= 0 && args[index + 1] ? args[index + 1] : fallback;
};

const host = '127.0.0.1';
const port = Number(option('--port', '50111'));
const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const logFile = option('--log-file', path.join(scriptDirectory, '..', 'runtime', 'fms', 'logs', 'application.log'));
const lineCount = 500;

const page = `<!doctype html>
<html lang="zh-CN">
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>FMS 实时日志</title>
<style>
:root { color-scheme: dark; --bg: #0b1014; --surface: #111a20; --line: #26353e; --ink: #dce8ed; --muted: #91a2aa; --live: #77d4a0; --warn: #ffc56d; --error: #ff8585; }
* { box-sizing: border-box; }
body { margin: 0; min-width: 720px; background: radial-gradient(ellipse at 85% 0%, #18303a 0%, var(--bg) 46%); color: var(--ink); font: 14px/1.6 Consolas, 'Cascadia Mono', monospace; }
header { display: flex; align-items: center; justify-content: space-between; gap: 24px; min-height: 78px; padding: 16px 28px; border-bottom: 1px solid var(--line); }
h1 { margin: 0; font: 600 21px/1.2 Georgia, 'Noto Serif SC', serif; letter-spacing: .04em; }
.sub { margin-top: 7px; color: var(--muted); font-size: 12px; }
.live { display: inline-flex; align-items: center; gap: 8px; color: var(--live); font: 700 12px/1 Consolas, monospace; letter-spacing: .11em; }
.live::before { content: ''; width: 8px; height: 8px; border-radius: 50%; background: currentColor; box-shadow: 0 0 14px currentColor; animation: pulse 1.4s infinite; }
@keyframes pulse { 50% { opacity: .3; transform: scale(.72); } }
main { padding: 22px 28px; }
pre { margin: 0; min-height: calc(100vh - 122px); padding: 18px 20px; overflow-wrap: anywhere; white-space: pre-wrap; background: #081015; border: 1px solid var(--line); border-radius: 8px; box-shadow: 0 24px 64px #0008; }
.warn { color: var(--warn); }.error { color: var(--error); }.offline { color: var(--error); }
</style>
<body>
<header><div><h1>FMS · 后端实时日志</h1><div class="sub">仅本机监听 · 每 1 秒刷新 · 最近 500 行</div></div><div class="live">LIVE</div></header>
<main><pre id="log">读取日志中…</pre></main>
<script>
const box = document.querySelector('#log');
let previous = '';
const escapeHtml = (text) => text.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');
const render = (text) => escapeHtml(text).replace(/ WARN /g, ' <span class="warn">WARN</span> ').replace(/ ERROR /g, ' <span class="error">ERROR</span> ');
async function refresh() {
  try {
    const response = await fetch('/log', { cache: 'no-store' });
    if (!response.ok) throw new Error(await response.text());
    const content = await response.text();
    if (content !== previous) {
      previous = content;
      box.innerHTML = render(content);
      window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
    }
  } catch (error) {
    box.innerHTML = '<span class="offline">日志连接失败：' + escapeHtml(error.message) + '</span>';
  }
}
refresh();
setInterval(refresh, 1000);
</script>`;

http.createServer(async (request, response) => {
  if (request.url === '/log') {
    try {
      const content = await fs.readFile(logFile, 'utf8');
      const recentLines = content.split(/\r?\n/).slice(-lineCount).join('\n');
      response.writeHead(200, { 'content-type': 'text/plain; charset=utf-8', 'cache-control': 'no-store' }).end(recentLines);
    } catch (error) {
      response.writeHead(500, { 'content-type': 'text/plain; charset=utf-8' }).end('日志暂不可读取：' + error.message);
    }
    return;
  }
  response.writeHead(200, { 'content-type': 'text/html; charset=utf-8' }).end(page);
}).listen(port, host, () => console.log(`FMS log viewer: http://${host}:${port}`));

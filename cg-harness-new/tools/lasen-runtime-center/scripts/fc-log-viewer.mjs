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
const port = Number(option('--port', '49701'));
const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const logFile = option('--log-file', path.join(scriptDirectory, '..', 'runtime', 'lasen-fc', 'logs', 'application.log'));

const page = `<!doctype html><html lang="zh-CN"><meta charset="utf-8"><title>FC Live Log</title><style>
:root{color-scheme:dark;--ink:#dce5eb;--muted:#83929d;--line:#26343e;--accent:#ffb703;--bg:#111920}*{box-sizing:border-box}body{margin:0;background:radial-gradient(circle at 80% 0,#1a2b35,#111920 40%);color:var(--ink);font:14px/1.55 Consolas,'Cascadia Mono',monospace}header{height:76px;padding:17px 28px;border-bottom:1px solid var(--line);display:flex;justify-content:space-between;align-items:center}h1{margin:0;font:600 20px Georgia,serif;letter-spacing:.04em}.sub{color:var(--muted);font-size:12px}.live{color:var(--accent);font-weight:700}.live::before{content:'●';margin-right:8px;animation:pulse 1.2s infinite}@keyframes pulse{50%{opacity:.25}}main{padding:20px 28px}pre{margin:0;min-height:calc(100vh - 116px);padding:18px 20px;white-space:pre-wrap;overflow-wrap:anywhere;background:#0a1015;border:1px solid var(--line);border-radius:8px;box-shadow:0 20px 55px #0005}.warn{color:#ffd166}.error{color:#ff6b6b}</style><body><header><div><h1>LASEN FC · 实时日志</h1><div class="sub">仅本机监听 · 每 1 秒刷新 · 最近 500 行</div></div><div class="live">LIVE</div></header><main><pre id="log">读取日志中…</pre></main><script>const box=document.querySelector('#log');let previous='';async function refresh(){try{const r=await fetch('/log',{cache:'no-store'});const t=await r.text();if(t!==previous){previous=t;box.innerHTML=t.replaceAll('&','&amp;').replaceAll('<','&lt;').replace(/ WARN /g,' <span class="warn">WARN</span> ').replace(/ ERROR /g,' <span class="error">ERROR</span> ');window.scrollTo({top:document.body.scrollHeight,behavior:'smooth'})}}catch(e){box.textContent='日志连接失败：'+e.message}}refresh();setInterval(refresh,1000)</script></body></html>`;

http.createServer(async (req, res) => {
  if (req.url === '/log') {
    try {
      const content = await fs.readFile(logFile, 'utf8');
      res.writeHead(200, {'content-type':'text/plain; charset=utf-8','cache-control':'no-store'}).end(content.split(/\r?\n/).slice(-500).join('\n'));
    } catch (error) { res.writeHead(500, {'content-type':'text/plain; charset=utf-8'}).end(String(error)); }
    return;
  }
  res.writeHead(200, {'content-type':'text/html; charset=utf-8'}).end(page);
}).listen(port, host, () => console.log(`FC log viewer: http://${host}:${port}`));

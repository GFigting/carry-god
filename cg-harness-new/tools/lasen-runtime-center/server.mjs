import { createServer } from 'node:http'
import { readFileSync } from 'node:fs'

const config = JSON.parse(readFileSync(new URL('./runtime-services.json', import.meta.url), 'utf8'))
const port = Number(process.env.LASEN_RUNTIME_CENTER_PORT || config.runtimeCenter.port)
const services = config.services

const probe = (service) =>
  new Promise((resolve) => {
    const startedAt = Date.now()
    const request = fetch(service.url, { signal: AbortSignal.timeout(2500) })
      .then(async (response) => {
        const content = await response.text()
        resolve({ ...service, online: response.ok, status: response.status, latency: Date.now() - startedAt, detail: content.slice(0, 80) })
      })
      .catch((error) => resolve({ ...service, online: false, status: null, latency: Date.now() - startedAt, detail: error.cause?.code || error.message }))
    return request
  })

const html = `<!doctype html>
<html lang="zh-CN"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>项目运行中心</title><style>
:root{font-family:"Microsoft YaHei",sans-serif;color:#172033;background:#f4f7fb}*{box-sizing:border-box}body{margin:0}.shell{max-width:1180px;margin:0 auto;padding:34px 24px}.headline{display:flex;justify-content:space-between;align-items:end;margin-bottom:24px}.eyebrow{font-size:12px;letter-spacing:.12em;color:#67758a}.headline h1{margin:6px 0 0;font-size:28px}.stamp{font-size:12px;color:#778397}.project{margin-top:22px}.project h2{font-size:15px;margin:0 0 10px}.cards{display:grid;grid-template-columns:repeat(3,1fr);gap:14px}.card{background:white;border:1px solid #e4eaf2;border-radius:10px;padding:17px;box-shadow:0 3px 12px rgba(20,39,70,.04)}.top{display:flex;justify-content:space-between;align-items:center}.name{font-weight:700}.state{padding:4px 8px;border-radius:99px;font-size:12px;background:#fff1f0;color:#d63b34}.state.online{background:#e8f7ef;color:#208b52}.meta{margin-top:16px;color:#66758a;font:12px ui-monospace,monospace;word-break:break-all}.actions{margin-top:12px}.actions a{font-size:13px;color:#246ce2;text-decoration:none}.hint{margin-top:24px;font-size:13px;color:#607087}@media(max-width:720px){.cards{grid-template-columns:1fr}.headline{align-items:start;flex-direction:column;gap:8px}}
</style></head><body><main class="shell"><header class="headline"><div><div class="eyebrow">LOCAL PROJECT RUNTIME</div><h1>项目运行中心</h1></div><div class="stamp" id="stamp">检查中…</div></header><section id="projects"></section><p class="hint">状态每 10 秒刷新。此轻量版仅探测服务状态，不采集前端日志。</p></main><script>
const projects=document.querySelector('#projects');
const renderStatus=(items)=>{const groups=items.reduce((result,item)=>((result[item.project]??=[]).push(item),result),{});projects.innerHTML=Object.entries(groups).map(([name,group])=>'<section class="project"><h2>'+name+'</h2><div class="cards">'+group.map(x=>'<article class="card"><div class="top"><span class="name">'+x.name+'</span><span class="state '+(x.online?'online':'')+'">'+(x.online?'运行中':'不可用')+'</span></div><div class="meta">'+x.url+'<br>'+ (x.status?'HTTP '+x.status:'连接失败')+' · '+x.latency+'ms</div><div class="actions"><a href="'+x.url+'" target="_blank">打开服务 ↗</a></div></article>').join('')+'</div></section>').join('')};
const refresh=async()=>{const s=await fetch('/api/status').then(r=>r.json());renderStatus(s.services);document.querySelector('#stamp').textContent='最近检查 '+new Date(s.checkedAt).toLocaleTimeString()};refresh();setInterval(refresh,10000);
</script></body></html>`

createServer(async (request, response) => {
  if (request.url === '/api/status') {
    const results = await Promise.all(services.map(probe))
    response.writeHead(200, { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' })
    return response.end(JSON.stringify({ checkedAt: new Date().toISOString(), services: results }))
  }
  response.writeHead(200, { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-store' })
  response.end(html)
}).listen(port, '127.0.0.1', () => console.log(`LASEN Runtime Center: http://127.0.0.1:${port}`))

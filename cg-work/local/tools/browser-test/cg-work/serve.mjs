// cg-work 设计预览静态服务：只读暴露 framework-visualization/dist。
// 用法：node serve.mjs <port> <root>
import http from 'node:http'
import { readFile } from 'node:fs/promises'
import path from 'node:path'

const [portArg, rootArg] = process.argv.slice(2)
const root = path.resolve(rootArg)
const types = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.map': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
}

http.createServer(async (req, res) => {
  const pathname = decodeURIComponent(req.url.split('?')[0])
  const file = path.join(root, pathname === '/' ? 'index.html' : pathname)
  const relative = path.relative(root, file)
  if (relative.startsWith('..') || path.isAbsolute(relative)) {
    res.writeHead(403)
    res.end('forbidden')
    return
  }
  try {
    const body = await readFile(file)
    res.writeHead(200, { 'Content-Type': types[path.extname(file).toLowerCase()] || 'application/octet-stream' })
    res.end(body)
  } catch {
    res.writeHead(404)
    res.end('not found')
  }
}).listen(Number(portArg), '127.0.0.1')

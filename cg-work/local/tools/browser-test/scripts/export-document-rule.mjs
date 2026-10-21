// 单据生成规则导出（FMS）：登录 → GET page → 逐条 GET get → 落盘 JSON。
// 链路与 browser-use 导出口径一致（base = http://127.0.0.1:50110/admin-api，鉴权 Authorization: Bearer）。
// 用法：node scripts/export-document-rule.mjs（凭据与导出文件固定在 fms/ 项目目录下）。
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const toolRoot = path.dirname(path.dirname(fileURLToPath(import.meta.url)))
const projectRoot = path.join(toolRoot, 'fms')
const base = 'http://127.0.0.1:50110/admin-api'
const credentials = JSON.parse(readFileSync(path.join(projectRoot, 'test-credentials.local.json'), 'utf8'))

const call = async (url, { method = 'GET', token, body } = {}) => {
  const headers = { Accept: 'application/json' }
  if (token) headers.Authorization = `Bearer ${token}`
  if (body) headers['Content-Type'] = 'application/json'
  const res = await fetch(url, { method, headers, body: body ? JSON.stringify(body) : undefined })
  const text = await res.text()
  let parsed
  try {
    parsed = JSON.parse(text)
  } catch {
    parsed = { raw: text.slice(0, 300) }
  }
  return { status: res.status, body: parsed }
}

// 租户开关开启：登录前先用租户名换取 tenantId。
const tenantRes = await call(`${base}/system/tenant/get-id-by-name?name=${encodeURIComponent(credentials.tenant)}`)
const tenantId = tenantRes.body?.data
if (!tenantId) {
  console.error(`获取租户失败：status=${tenantRes.status} body=${JSON.stringify(tenantRes.body)}`)
  process.exit(1)
}

const loginRes = await call(`${base}/system/auth/login`, {
  method: 'POST',
  body: { username: credentials.username, password: credentials.password, captchaVerification: '', tenantId }
})
const token = loginRes.body?.data?.accessToken
if (!token) {
  console.error(`登录失败：status=${loginRes.status} body=${JSON.stringify(loginRes.body)}`)
  process.exit(1)
}

const pageRes = await call(`${base}/fms/document-rule/page?pageNo=1&pageSize=500`, { token })
const pageData = pageRes.body?.data || {}
const list = pageData.list || pageData.records || []
if (!Array.isArray(list)) {
  console.error(`列表响应异常：${JSON.stringify(pageRes.body).slice(0, 300)}`)
  process.exit(1)
}

const details = []
const errors = []
for (const item of list) {
  const detailRes = await call(`${base}/fms/document-rule/get?id=${item.id}`, { token })
  const code = detailRes.body?.code
  if (detailRes.status !== 200 || (code !== undefined && code !== 0)) {
    errors.push({ id: item.id, status: detailRes.status, code, msg: detailRes.body?.msg })
  }
  details.push({ summary: item, detail: detailRes.body?.data ?? null })
}

const payload = {
  exported_at: new Date().toISOString(),
  source: `${base}/fms/document-rule/page + /fms/document-rule/get`,
  total: pageData.total ?? list.length,
  fetched: list.length,
  detail_ok: details.filter((d) => d.detail).length,
  errors,
  list: details
}

const outFile = path.join(projectRoot, 'exports', `document-rule-${new Date().toISOString().replace(/[-:]/g, '').slice(0, 15)}.json`)
mkdirSync(path.dirname(outFile), { recursive: true })
writeFileSync(outFile, JSON.stringify(payload, null, 2), 'utf8')

console.log(`total=${payload.total} fetched=${payload.fetched} detail_ok=${payload.detail_ok} errors=${errors.length}`)
console.log(`导出文件：${outFile}`)

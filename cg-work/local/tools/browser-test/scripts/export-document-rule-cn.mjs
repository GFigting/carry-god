// 单据生成规则导出 → 清除无效字段 + 字典值翻译成中文。
// 输入：fms/exports/document-rule-*.json（export-document-rule.mjs 产出）
// 输出：fms/exports/document-rule-cn-<时间戳>.json（清洗后的中文版）
// 映射来源：后端字典接口（system/dict-data/simple-list）+ 组织字典（fms/org/dictPage），不硬编码业务含义。
import { readFileSync, writeFileSync, mkdirSync, readdirSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const toolRoot = path.dirname(path.dirname(fileURLToPath(import.meta.url)))
const projectRoot = path.join(toolRoot, 'fms')
const base = 'http://127.0.0.1:50110/admin-api'
const credentials = JSON.parse(readFileSync(path.join(projectRoot, 'test-credentials.local.json'), 'utf8'))

// ---------- 取最新的原始导出文件 ----------
const exportDir = path.join(projectRoot, 'exports')
const rawFile =
  process.argv[2] ||
  readdirSync(exportDir)
    .filter((f) => /^document-rule-\d+\.json$/.test(f))
    .sort()
    .pop()
if (!rawFile) {
  console.error('未找到原始导出文件，先运行 export-document-rule.mjs')
  process.exit(1)
}
const raw = JSON.parse(readFileSync(path.join(exportDir, rawFile), 'utf8'))

// ---------- 登录取 token ----------
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

const tenantRes = await call(`${base}/system/tenant/get-id-by-name?name=${encodeURIComponent(credentials.tenant)}`)
const tenantId = tenantRes.body?.data
if (!tenantId) {
  console.error(`获取租户失败：${JSON.stringify(tenantRes.body)}`)
  process.exit(1)
}
const loginRes = await call(`${base}/system/auth/login`, {
  method: 'POST',
  body: { username: credentials.username, password: credentials.password, captchaVerification: '', tenantId }
})
const token = loginRes.body?.data?.accessToken
if (!token) {
  console.error(`登录失败：${JSON.stringify(loginRes.body)}`)
  process.exit(1)
}

// ---------- 字典：type -> { value: label } ----------
const dictRes = await call(`${base}/system/dict-data/simple-list`, { token })
const dictRows = dictRes.body?.data || []
const dicts = {}
for (const row of dictRows) {
  if (!dicts[row.dictType]) dicts[row.dictType] = {}
  dicts[row.dictType][row.value] = row.label
}

// ---------- 组织字典：id -> 组织名（SPECIFY_ORG 场景） ----------
const orgMap = {}
let pageNo = 1
for (;;) {
  const res = await call(`${base}/fms/org/dictPage?pageNo=${pageNo}&pageSize=500`, { token })
  const data = res.body?.data || {}
  const rows = data.list || []
  for (const r of rows) orgMap[String(r.value)] = r.label
  if (!rows.length || orgMap.size >= (data.total ?? 0) || pageNo > 20) break
  pageNo += 1
}

// ---------- 翻译辅助 ----------
const tr = (dictType) => (value) => {
  if (value === null || value === undefined || value === '') return null
  const label = dicts[dictType]?.[value]
  return label ?? `${value}(未匹配字典)`
}
const translateSubject = (type, value) => {
  if (value === null || value === undefined || value === '') return null
  if (type === 'SPECIFY_ORG') return orgMap[String(value)] ?? `${value}(未匹配组织)`
  // ORG_TYPE_MATCH → org_type 字典；SUPPLIER_TYPE_MATCH → supplier_type 字典
  const dictType = type === 'ORG_TYPE_MATCH' ? 'org_type' : type === 'SUPPLIER_TYPE_MATCH' ? 'supplier_type' : null
  if (!dictType) return value
  return dicts[dictType]?.[value] ?? `${value}(未匹配字典)`
}

const translateTime = (ts) => (ts ? new Date(ts).toISOString().replace('T', ' ').slice(0, 19) : null)

// ---------- 清洗 + 翻译 ----------
const trMaterial = tr('material_type')
const trPurchase = tr('purchase_type_for_rule')
const trFinanceDoc = tr('finance_doc_type')
const trSubjectType = tr('subject_type')
const trGenerateCondition = tr('doc_rule_generate_condition')

const outList = raw.list.map(({ summary: s, detail: d }) => ({
  规则编码: d.ruleCode,
  规则名称: d.ruleName,
  规则描述: d.description,
  状态: d.status === 'Y' ? '已发布' : '未发布',
  版本号: d.version,
  发布时间: translateTime(d.publishedTime),
  创建时间: translateTime(s.createTime),
  更新时间: translateTime(s.updateTime),
  规则条件: (d.conditions || []).map((c) => ({
    业务类型: trMaterial(c.materialType),
    采购类型: trPurchase(c.purchaseType),
    出入库类型: c.inventoryType
  })),
  财务单据配置: (d.financeDocs || []).map((f) => ({
    单据类型: trFinanceDoc(f.financeDocType),
    生成条件: trGenerateCondition(f.generateCondition),
    加成比例: `${f.priceMarkupRate}%`,
    我方主体类型: trSubjectType(f.selfSubjectType),
    我方主体值: translateSubject(f.selfSubjectType, f.selfSubjectValue),
    我方主体来源: f.selfSubjectSource === 'SENDER' ? '发出方' : f.selfSubjectSource === 'RECEIVER' ? '接收方' : null,
    对方主体类型: trSubjectType(f.customerSubjectType),
    对方主体值: translateSubject(f.customerSubjectType, f.customerSubjectValue),
    对方主体来源:
      f.customerSubjectSource === 'SENDER' ? '发出方' : f.customerSubjectSource === 'RECEIVER' ? '接收方' : null,
    并行分组: f.parallelGroup,
    依赖类型: f.dependencyType === 'NONE' ? '无' : f.dependencyType,
    依赖单据ID: f.dependencyDocId,
    排序号: f.seqNo
  }))
}))

const payload = {
  exported_at: raw.exported_at,
  translated_at: new Date().toISOString(),
  source: `清洗自 ${rawFile}；字典与组织名称来自接口 ${base}/system/dict-data/simple-list、${base}/fms/org/dictPage`,
  removed_fields: [
    '列表行：id、creator、updater、deleted、conditions、financeDocs（详情里已展开）',
    '条件：dynamicParams（全空）',
    '财务单据：relatedDocType（全空）、seqNo（保留为排序号）',
    '未翻译的出入库类型 inventoryType 保留原始值（字典未收录，见输出统计）'
  ],
  total: outList.length,
  list: outList
}

const outFile = path.join(exportDir, `document-rule-cn-${new Date().toISOString().replace(/[-:]/g, '').slice(0, 15)}.json`)
mkdirSync(path.dirname(outFile), { recursive: true })
writeFileSync(outFile, JSON.stringify(payload, null, 2), 'utf8')

// 未匹配字典的值单独报告
const unmatched = new Set()
for (const rule of outList) {
  for (const c of rule.规则条件) if (c.出入库类型 && c.出入库类型.includes('(未匹配字典)')) unmatched.add(c.出入库类型)
}
console.log(`清洗+翻译完成：${outList.length} 条规则`)
console.log(`字典类型加载：${Object.keys(dicts).length} 个；组织名称：${orgMap.size} 个`)
if (unmatched.size) console.log(`未匹配字典的出入库类型（保留原值）：${[...unmatched].join('、')}`)
console.log(`导出文件：${outFile}`)

// 单据生成规则中文化：读取 exports/document-rule-online-raw-*.json（含 dicts 字典），
// 字典值翻译为中文、字段名改为中文、删除 null 与空字符串字段，落盘 exports/document-rule-zh-*.json。
// 映射来源：系统字典 /system/dict-data/simple-list + 后端枚举（enums/documentrule、DependencyResolver、ProductOperateTypeForSyncEnum）。
// 用法：node scripts/translate-document-rule.mjs [原始文件路径]
import { readFileSync, writeFileSync, readdirSync, mkdirSync, existsSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const toolRoot = path.dirname(path.dirname(fileURLToPath(import.meta.url)))
const exportsDir = path.join(toolRoot, 'fms', 'exports')

// 允许命令行指定原始文件；否则取 exports 下最新的 online-raw 文件。
const argv = process.argv[2]
const rawFile =
  argv && existsSync(path.resolve(argv))
    ? path.resolve(argv)
    : readdirSync(exportsDir)
      .filter((f) => f.startsWith('document-rule-online-raw-') && f.endsWith('.json'))
      .sort()
      .map((f) => path.join(exportsDir, f))
      .pop()
if (!rawFile) {
  console.error('未找到原始导出文件（document-rule-online-raw-*.json）')
  process.exit(1)
}

const payload = JSON.parse(readFileSync(rawFile, 'utf8'))

// ---------- 字典索引 ----------
const dictIndex = new Map() // dictType -> Map(value -> label)
for (const d of payload.dicts || []) {
  if (!dictIndex.has(d.dictType)) dictIndex.set(d.dictType, new Map())
  dictIndex.get(d.dictType).set(String(d.value), d.label)
}
const lookup = (dictType, value) => dictIndex.get(dictType)?.get(String(value)) ?? null

// 多字典链：按顺序取第一个命中的中文名（出入库类型按物料类型分表，链覆盖两者）。
const lookupChain = (dictTypes, value) => {
  for (const t of dictTypes) {
    const hit = lookup(t, value)
    if (hit) return hit
  }
  return null
}

// 后端枚举兜底（无系统字典的枚举，取值见 fms-rear 源码）。
const manual = {
  // ProductOperateTypeForSyncEnum.CUSTOMS_DECLARATION_ORDER
  inventoryType: { CUSTOMS_DECLARATION_ORDER: '报关单' },
  // DocumentRuleFinanceDocDO.dependencyType（DependencyResolver.isReadyToProcess 注释）
  dependencyType: { NONE: '无依赖', CHILD: '依赖前置单据' },
  // SubjectSourceEnum
  subjectSource: { SENDER: '发出方', RECEIVER: '接收方' },
  // DocumentRule.status（docs/biz-document-rule.md）
  status: { Y: '已发布', N: '未发布' }
}

// 指定主体（SPECIFY_ORG）为组织 ID，来自线上 /fms/org/page 全量查询。
const orgNames = {
  '2017067110600577038': '厦门狼腾科技有限公司',
  '2020802140778872840': '厦门狼森科技有限公司'
}

// ---------- 翻译函数 ----------
const INVENTORY_CHAIN = ['material_inventory_type', 'product_inventory_type', 'product_operate_type_for_sync', 'material_operate_type_for_sync']

const fmtTime = (ms) => {
  if (ms === null || ms === undefined || ms === '') return null
  const d = new Date(Number(ms) + 8 * 3600 * 1000) // Asia/Shanghai
  const p = (n) => String(n).padStart(2, '0')
  return `${d.getUTCFullYear()}-${p(d.getUTCMonth() + 1)}-${p(d.getUTCDate())} ${p(d.getUTCHours())}:${p(d.getUTCMinutes())}:${p(d.getUTCSeconds())}`
}

// 主体值翻译：按主体类型决定值域（主体类型/供应商类型/指定组织 ID）。
const translateSubjectValue = (type, value) => {
  if (value === null || value === undefined || value === '') return null
  if (type === 'ORG_TYPE_MATCH') return lookup('org_type', value) ?? `未映射:${value}`
  if (type === 'SUPPLIER_TYPE_MATCH') return lookup('supplier_type', value) ?? `未映射:${value}`
  if (type === 'SPECIFY_ORG') return orgNames[String(value)] ?? `未映射:${value}`
  return String(value)
}

// ---------- 转换 ----------
const untranslated = [] // 翻译失败项，最终报告用
const note = (where, field, value) => untranslated.push(`${where}.${field}=${value}`)

const rules = payload.list.map(({ summary, detail }, idx) => {
  const where = summary.ruleCode || `#${idx}`
  const conditions = (detail.conditions || []).map((c) => {
    const out = {}
    out['业务类型'] = lookup('material_type', c.materialType) ?? (note(where, 'materialType', c.materialType), String(c.materialType ?? ''))
    if (c.purchaseType) out['采购类型'] = lookupChain(['purchase_type_for_rule'], c.purchaseType) ?? (note(where, 'purchaseType', c.purchaseType), c.purchaseType)
    const inv = lookupChain(INVENTORY_CHAIN, c.inventoryType) ?? manual.inventoryType[c.inventoryType]
    out['出入库类型'] = inv ?? (note(where, 'inventoryType', c.inventoryType), String(c.inventoryType ?? ''))
    if (c.seqNo !== null && c.seqNo !== undefined) out['排序号'] = c.seqNo
    return out
  })

  const financeDocs = (detail.financeDocs || []).map((f) => {
    const selfType = f.selfSubjectType
    const custType = f.customerSubjectType
    const out = {}
    out['单据类型'] = lookup('finance_doc_type', f.financeDocType) ?? (note(where, 'financeDocType', f.financeDocType), String(f.financeDocType ?? ''))
    out['我方主体类型'] = lookup('subject_type', selfType) ?? (note(where, 'selfSubjectType', selfType), String(selfType ?? ''))
    const selfVal = translateSubjectValue(selfType, f.selfSubjectValue)
    if (selfVal) out['我方主体值'] = selfVal
    const selfSrc = f.selfSubjectSource ? (manual.subjectSource[f.selfSubjectSource] ?? lookup('supplier_relation_source', f.selfSubjectSource)) : null
    if (selfSrc) out['我方主体来源'] = selfSrc
    else if (f.selfSubjectSource) note(where, 'selfSubjectSource', f.selfSubjectSource)

    out['对方主体类型'] = lookup('subject_type', custType) ?? (note(where, 'customerSubjectType', custType), String(custType ?? ''))
    const custVal = translateSubjectValue(custType, f.customerSubjectValue)
    if (custVal) out['对方主体值'] = custVal
    const custSrc = f.customerSubjectSource ? (manual.subjectSource[f.customerSubjectSource] ?? lookup('supplier_relation_source', f.customerSubjectSource)) : null
    if (custSrc) out['对方主体来源'] = custSrc
    else if (f.customerSubjectSource) note(where, 'customerSubjectSource', f.customerSubjectSource)

    out['生成条件'] = lookup('doc_rule_generate_condition', f.generateCondition) ?? (note(where, 'generateCondition', f.generateCondition), String(f.generateCondition ?? ''))
    if (f.priceMarkupRate !== null && f.priceMarkupRate !== undefined) out['价格加成比例(%)'] = Number(f.priceMarkupRate)
    out['依赖类型'] = manual.dependencyType[f.dependencyType] ?? (note(where, 'dependencyType', f.dependencyType), String(f.dependencyType ?? ''))
    if (f.dependencyDocId) out['依赖单据ID'] = String(f.dependencyDocId)
    if (f.parallelGroup) out['并行分组'] = f.parallelGroup
    if (f.seqNo !== null && f.seqNo !== undefined) out['排序号'] = f.seqNo
    return out
  })

  const out = {}
  out['规则ID'] = String(detail.id)
  out['规则编码'] = detail.ruleCode
  out['规则名称'] = detail.ruleName
  if (detail.description) out['描述'] = detail.description
  if (detail.version !== null && detail.version !== undefined) out['版本号'] = detail.version
  out['状态'] = manual.status[detail.status] ?? String(detail.status ?? '')
  const published = fmtTime(detail.publishedTime)
  if (published) out['发布时间'] = published
  const created = fmtTime(detail.createdAt ?? summary.createTime)
  if (created) out['创建时间'] = created
  const updated = fmtTime(detail.updatedAt ?? summary.updateTime)
  if (updated) out['更新时间'] = updated
  out['规则条件'] = conditions
  out['财务单据配置'] = financeDocs
  return out
})

// 递归删除 null / 空字符串字段（用户口径：null 删除，无需保留）。
const strip = (node) => {
  if (Array.isArray(node)) return node.map(strip).filter((v) => v !== null && v !== undefined && v !== '')
  if (node && typeof node === 'object') {
    const out = {}
    for (const [k, v] of Object.entries(node)) {
      const sv = strip(v)
      if (sv === null || sv === undefined || sv === '') continue
      if (Array.isArray(sv) && sv.length === 0) continue
      out[k] = sv
    }
    return out
  }
  return node
}

const cleaned = strip(rules)

// 扫描输出中残留的大写枚举值（疑似未翻译）。
const residue = []
const scanResidue = (node, trail = '') => {
  if (Array.isArray(node)) return node.forEach((v, i) => scanResidue(v, `${trail}[${i}]`))
  if (node && typeof node === 'object') {
    for (const [k, v] of Object.entries(node)) scanResidue(v, trail ? `${trail}.${k}` : k)
  } else if (typeof node === 'string' && /^[A-Z][A-Z0-9_]{2,}$/.test(node) && !trail.endsWith('规则编码') && !trail.endsWith('并行分组')) {
    residue.push(`${trail}=${node}`)
  }
}
scanResidue(cleaned)

const result = {
  元信息: {
    数据源: payload.source,
    导出时间: payload.exported_at,
    转换时间: new Date().toISOString(),
    规则总数: cleaned.length,
    原始条数: payload.total,
    取数错误: payload.errors.length,
    字段口径: '字段名与枚举值均已翻译为中文；null 与空字符串字段已删除；时间为 Asia/Shanghai'
  },
  规则: cleaned
}

const outFile = path.join(exportsDir, `document-rule-zh-${new Date().toISOString().replace(/[-:]/g, '').slice(0, 15)}.json`)
mkdirSync(path.dirname(outFile), { recursive: true })
writeFileSync(outFile, JSON.stringify(result, null, 2), 'utf8')

console.log(`原始: total=${payload.total} fetched=${payload.fetched} detail_ok=${payload.detail_ok} errors=${payload.errors.length}`)
console.log(`转换后规则数: ${cleaned.length}`)
console.log(`翻译失败项: ${untranslated.length}${untranslated.length ? ' -> ' + [...new Set(untranslated)].join(', ') : ''}`)
console.log(`疑似未翻译残留: ${residue.length}${residue.length ? ' -> ' + residue.slice(0, 10).join(', ') : ''}`)
console.log(`导出文件：${outFile}`)

// test-suites.json 校验（对标 lasen-runtime-center/scripts/validate-runtime-config.mjs）。
// 配置无效时不进入测试，避免把配置错误当成测试失败。
// CLI：node scripts/validate-config.mjs <test-suites.json>
import { readFileSync } from 'node:fs'

const KEBAB = /^[a-z0-9]+(?:-[a-z0-9]+)*$/
const STEP_ACTIONS = new Set(['navigate', 'fill', 'click', 'wait', 'assert'])
const STEP_WHEN = new Set(['logged_out'])
const EXPECT_KEYS = new Set(['visible', 'text_includes', 'url_not_includes', 'url_includes', 'console_errors'])
const WAIT_STATES = new Set(['visible', 'hidden', 'attached', 'detached'])
const fail = (error) => ({ ok: false, error })

export const validateTestConfig = (candidate) => {
  if (!candidate || typeof candidate !== 'object') return fail('配置必须是对象')

  const targets = candidate.targets
  if (!targets || typeof targets !== 'object' || !Object.keys(targets).length) return fail('targets 必须是非空映射')
  for (const [id, target] of Object.entries(targets)) {
    if (!target || typeof target !== 'object' || !target.url || !target.health) {
      return fail(`target ${id} 必须包含 url 与 health`)
    }
    for (const field of ['url', 'health']) {
      try {
        const parsed = new URL(String(target[field]))
        if (!/^https?:$/.test(parsed.protocol)) return fail(`target ${id} 的 ${field} 必须是 http(s) 地址`)
      } catch {
        return fail(`target ${id} 的 ${field} 无效`)
      }
    }
  }

  // 无登录项目可省略 credentials；一旦声明就必须完整，避免半截配置。
  const credentials = candidate.credentials
  if (credentials !== undefined && credentials !== null) {
    if (typeof credentials !== 'object' || !credentials.file || !Array.isArray(credentials.required) || !credentials.required.length) {
      return fail('credentials 必须包含 file 与非空 required 列表')
    }
    if (credentials.required.some((key) => typeof key !== 'string' || !key.trim())) {
      return fail('credentials.required 必须是非空字符串列表')
    }
  }

  const suites = candidate.suites
  if (!suites || typeof suites !== 'object' || !Object.keys(suites).length) return fail('suites 必须是非空映射')

  // 公共流程：顶层 flows 的每个流程是步骤数组，套件用 flows: ["..."] 引用。
  const flows = candidate.flows || {}
  if (typeof flows !== 'object') return fail('flows 必须是映射')
  for (const [flowId, flow] of Object.entries(flows)) {
    if (!KEBAB.test(flowId)) return fail(`flow id 必须使用小写 kebab-case：${flowId}`)
    const flowResult = validateSteps(flow, `flow ${flowId}`)
    if (!flowResult.ok) return flowResult
  }

  for (const [id, suite] of Object.entries(suites)) {
    if (!KEBAB.test(id)) return fail(`suite id 必须使用小写 kebab-case：${id}`)
    if (!suite || typeof suite !== 'object') return fail(`suite ${id} 必须是对象`)
    if (!targets[suite.target]) return fail(`suite ${id} 引用了未知 target：${suite.target}`)
    if (suite.dependsOn !== undefined) {
      if (!Array.isArray(suite.dependsOn)) return fail(`suite ${id} 的 dependsOn 必须是数组`)
      for (const dep of suite.dependsOn) {
        if (!targets[dep]) return fail(`suite ${id} 的 dependsOn 引用了未知 target：${dep}`)
      }
    }
    if (suite.flows !== undefined) {
      if (!Array.isArray(suite.flows)) return fail(`suite ${id} 的 flows 必须是数组`)
      for (const flowId of suite.flows) {
        if (!flows[flowId]) return fail(`suite ${id} 的 flows 引用了未定义的 flow：${flowId}`)
      }
    }
    if (!Array.isArray(suite.steps) || !suite.steps.length) return fail(`suite ${id} 必须包含非空 steps`)
    const suiteResult = validateSteps(suite.steps, `suite ${id}`)
    if (!suiteResult.ok) return suiteResult
    // 引用公共流程后，套件自身步骤 id 不得与流程步骤 id 冲突，否则 verify 的步骤全集判定会被重复 id 干扰。
    const flowStepIds = new Set(
      (Array.isArray(suite.flows) ? suite.flows : []).flatMap((flowId) => flows[flowId].map((step) => step.id))
    )
    const conflict = suite.steps.find((step) => flowStepIds.has(step?.id))
    if (conflict) return fail(`suite ${id} 的步骤 id 与引用的 flow 步骤冲突：${conflict.id}`)
  }
  return { ok: true }
}

// 单组步骤的通用校验：公共流程与套件 steps 共用同一套规则。
const validateSteps = (steps, label) => {
  if (!Array.isArray(steps) || !steps.length) return fail(`${label} 必须包含非空步骤数组`)
  const stepIds = new Set()
  for (const [index, step] of steps.entries()) {
    const where = `${label} 的第 ${index + 1} 步`
    if (!step || typeof step !== 'object') return fail(`${where} 必须是对象`)
    if (typeof step.id !== 'string' || !KEBAB.test(step.id)) return fail(`${where} 缺少小写 kebab-case 的 id`)
    if (stepIds.has(step.id)) return fail(`${label} 步骤 id 重复：${step.id}`)
    stepIds.add(step.id)
    if (!STEP_ACTIONS.has(step.action)) return fail(`${where} 的 action 无效：${step.action}（可选值：${[...STEP_ACTIONS].join('、')}）`)
    if (step.when !== undefined && !STEP_WHEN.has(step.when)) return fail(`${where} 的 when 无效：${step.when}（可选值：${[...STEP_WHEN].join('、')}）`)
    if (step.action === 'navigate' && typeof step.url !== 'string') return fail(`${where} 是 navigate，必须提供 url`)
    if ((step.action === 'fill' || step.action === 'click') && (typeof step.selector_hint !== 'string' || !step.selector_hint.trim())) {
      return fail(`${where} 是 ${step.action}，必须提供 selector_hint`)
    }
    if (step.action === 'fill' && typeof step.value !== 'string') return fail(`${where} 是 fill，必须提供 value`)
    if (step.action === 'wait') {
      if (typeof step.selector_hint !== 'string' || !step.selector_hint.trim()) return fail(`${where} 是 wait，必须提供 selector_hint`)
      if (step.state !== undefined && !WAIT_STATES.has(step.state)) return fail(`${where} 的 state 无效：${step.state}（可选值：${[...WAIT_STATES].join('、')}）`)
      if (step.timeout_ms !== undefined && (!Number.isInteger(step.timeout_ms) || step.timeout_ms < 1 || step.timeout_ms > 120000)) {
        return fail(`${where} 的 timeout_ms 必须是 1 到 120000 的整数`)
      }
    }
    if (step.evidence !== undefined) {
      if (!step.evidence || typeof step.evidence !== 'object') return fail(`${where} 的 evidence 必须是对象`)
      if (step.evidence.screenshot !== undefined && typeof step.evidence.screenshot !== 'boolean') return fail(`${where} 的 evidence.screenshot 必须是布尔值`)
    }
    if (step.action === 'assert') {
      const expect = step.expect
      if (!expect || typeof expect !== 'object' || !Object.keys(expect).length) return fail(`${where} 是 assert，必须提供非空 expect`)
      for (const key of Object.keys(expect)) {
        if (!EXPECT_KEYS.has(key)) return fail(`${where} 的 expect 键无效：${key}（可选值：${[...EXPECT_KEYS].join('、')}）`)
      }
      if (expect.console_errors !== undefined && !['none', 'report'].includes(expect.console_errors)) {
        return fail(`${where} 的 expect.console_errors 必须是 none 或 report`)
      }
    }
  }
  return { ok: true }
}

// CLI：直接执行本文件时校验传入的配置文件。
if (process.argv[1] && process.argv[1].endsWith('validate-config.mjs')) {
  const file = process.argv[2]
  if (!file) {
    console.error('用法：node validate-config.mjs <test-suites.json>')
    process.exitCode = 2
  } else {
    try {
      const result = validateTestConfig(JSON.parse(readFileSync(file, 'utf8')))
      if (!result.ok) {
        console.error(`测试配置无效：${result.error}`)
        process.exitCode = 1
      } else {
        console.log('测试配置有效')
      }
    } catch (error) {
      console.error(`测试配置无法读取：${error.message}`)
      process.exitCode = 1
    }
  }
}

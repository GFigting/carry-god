// browser-use 测试工具入口（fms/lasen 共用）：准备证据目录 → 输出步骤清单 → 校验回传证据。
// 分工（方案 A）：本工具管流程与证据口径，browser_use 子代理管浏览器操作。
//   1. node run.mjs --project fms --suite smoke prepare   预检 + 渲染步骤 + 建 <project>/runs/<时间戳>/，输出给执行代理
//   2. 执行代理按清单操作浏览器，把证据写入 <project>/runs/<时间戳>/result.json
//   3. node run.mjs --project fms --suite smoke --run <目录> verify   校验证据并给出 pass/fail/environment_limited
// 代码在根目录共享，配置、凭据与证据按项目分目录：<project>/test-suites.json、<project>/runs/。
import { readFileSync, writeFileSync, mkdirSync, existsSync, readdirSync } from 'node:fs'
import { spawnSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import { validateTestConfig } from './scripts/validate-config.mjs'

const toolRoot = path.dirname(fileURLToPath(import.meta.url))
// 项目目录 = 根下除 scripts/ 外的一级目录（fms、lasen），配置与证据均按项目隔离。
const listProjects = () =>
  readdirSync(toolRoot, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && entry.name !== 'scripts')
    .map((entry) => entry.name)

const parseArgs = (argv) => {
  const options = { suite: null, run: null, command: 'prepare', project: null, visible: false }
  for (let i = 0; i < argv.length; i += 1) {
    if (argv[i] === '--suite') options.suite = argv[++i]
    else if (argv[i] === '--run') options.run = argv[++i]
    else if (argv[i] === '--project') options.project = argv[++i]
    else if (argv[i] === '--visible' || argv[i] === '--show-browser') options.visible = true
    else if (argv[i] === 'prepare' || argv[i] === 'verify') options.command = argv[i]
    else {
      console.error(`未知参数：${argv[i]}（用法：node run.mjs --project <${listProjects().join('|')}> --suite <id> [prepare|verify] [--visible] [--run <目录>]）`)
      process.exit(2)
    }
  }
  const projects = listProjects()
  if (!options.project) {
    console.error(`缺少 --project（可选：${projects.join('、')}）`)
    process.exit(2)
  }
  if (!projects.includes(options.project)) {
    console.error(`未知 project：${options.project}（可选：${projects.join('、')}）`)
    process.exit(2)
  }
  if (!options.suite) {
    console.error('缺少 --suite（用法：node run.mjs --project <id> --suite <id> prepare）')
    process.exit(2)
  }
  return options
}

// 配置、凭据、runs/ 一律以项目目录为根。
const projectRoot = (options) => path.join(toolRoot, options.project)

const loadConfig = (options) => {
  const configPath = path.join(projectRoot(options), 'test-suites.json')
  const parsed = JSON.parse(readFileSync(configPath, 'utf8'))
  const result = validateTestConfig(parsed)
  if (!result.ok) {
    console.error(`${options.project}/test-suites.json 无效：${result.error}`)
    process.exit(1)
  }
  return parsed
}

const loadCredentials = (config, options) => {
  const file = path.resolve(projectRoot(options), config.credentials.file)
  if (!existsSync(file)) {
    console.error(`缺少本地测试账号：${file}（复制 test-credentials.example.json 后填写；该文件不入框架提交）`)
    process.exit(1)
  }
  const credentials = JSON.parse(readFileSync(file, 'utf8'))
  for (const key of config.credentials.required) {
    if (typeof credentials[key] !== 'string' || !credentials[key].trim()) {
      console.error(`本地测试账号缺少字段：${key}`)
      process.exit(1)
    }
  }
  return credentials
}

const render = (value, context) =>
  String(value).replace(/\{([a-z.]+)\}/gi, (match, key) => {
    const [group, field] = key.split('.')
    const source = context[group]
    if (!source || source[field] === undefined) {
      console.error(`占位符无法解析：${match}（可用组：${Object.keys(context).join('、')}）`)
      process.exit(1)
    }
    return String(source[field])
  })

const runPreflight = (options) => {
  const script = path.join(toolRoot, 'scripts', 'preflight.mjs')
  const result = spawnSync(process.execPath, [script, '--project', options.project, '--suite', options.suite], { stdio: 'inherit' })
  if (result.status !== 0) process.exit(result.status ?? 1)
}

const timestamp = () => new Date().toISOString().replace(/[-:]/g, '').replace(/\..+/, '').replace('T', '-')

const prepare = (config, options, credentials) => {
  const suite = config.suites[options.suite]
  if (!suite) {
    console.error(`未知 suite：${options.suite}（可选：${Object.keys(config.suites).join('、')}）`)
    process.exit(2)
  }
  runPreflight(options)

  const context = {
    target: config.targets[suite.target],
    credentials
  }
  // 公共流程优先展开：flows 里的步骤在前，套件自身 steps 在后，编号连续。
  // flows 只能引用顶层 flows 中已定义的流程名，未定义时报错退出。
  const flows = Array.isArray(suite.flows) ? suite.flows : []
  const flowSteps = flows.flatMap((flowId) => {
    const defined = config.flows && config.flows[flowId]
    if (!defined) {
      console.error(`套件 ${options.suite} 引用了未定义的 flow：${flowId}（顶层 flows 已定义：${Object.keys(config.flows || {}).join('、') || '无'}）`)
      process.exit(2)
    }
    return defined.map((step) => ({ ...step, from_flow: flowId }))
  })
  const allSteps = [...flowSteps, ...(suite.steps || [])]
  const steps = allSteps.map((step, index) => {
    const rendered = { ...step }
    for (const field of ['url', 'value']) {
      if (rendered[field] !== undefined) rendered[field] = render(rendered[field], context)
    }
    // 凭据只在渲染后的步骤清单里出现一次，落盘证据不允许回写明文。
    if (step.value === '{credentials.password}') rendered.value = '******'
    return { order: index + 1, ...rendered }
  })

  const runId = `${timestamp()}-${options.suite}`
  const runDir = path.join(projectRoot(options), 'runs', runId)
  mkdirSync(runDir, { recursive: true })
  const brief = {
    run_id: runId,
    suite: options.suite,
    target: suite.target,
    base_url: config.targets[suite.target].url,
    created_at: new Date().toISOString(),
    execution: {
      visible_browser: options.visible || suite.visible === true,
      report_each_step: true,
      retain_final_tab: true
    },
    instructions: [
      `${options.visible || suite.visible === true ? '可见模式已开启：保持浏览器窗口前台显示。' : '默认使用可见浏览器执行；如需明确开启，请使用 --visible。'} 每一步开始和结束都报告“步骤 id、动作、当前 URL、结果”，不要只返回最终汇总。`,
      '用 browser_use 子代理按 steps 顺序执行，selector_hint 为提示而非精确选择器，允许按现场 DOM 调整。',
      '标记 when:logged_out 的步骤只在 open-login 后确认未登录（停在 /login）时执行；已登录（open-login 跳到首页）时直接跳过该步骤并如实标记 outcome=skipped，不要重复登录。',
      '填表前必须先清空输入框（点击 → Ctrl+A → Delete）再输入：登录页可能有 rememberMe 预填，直接 fill 会把值追加成重复串（如密码 pwd123 变 pwd123pwd123，触发长度校验被拒）。输入后逐一核对实际值。',
      '按 wait 步骤等待 selector 达到 state 后再继续；禁止用加载期间的初始 0 作为最终数据。',
      '全程收集 console_errors 与 failed_requests（网络 4xx/5xx），按 evidence.screenshot=true 的步骤截图，并把截图保存为相对本运行目录的路径。已知噪音（验证码图片、百度统计的 ERR_ABORTED）单独归类标注，不计入失败。',
      'browser_use 子代理没有写文件能力：执行期间逐步回报每步结果（id、completed、outcome、summary、detail、actual、expected、screenshot），最终再汇报 console_errors、failed_requests 与截图路径；落盘 result.json 由调用方（主 Agent）完成。',
      '主 Agent 按子代理报告写入本目录 result.json：{ "status": "completed"|"aborted", "steps": [...], "console_errors": [...], "failed_requests": [...], "summary": "..." }，步骤 outcome 取值 pass|fail|needs_review|skipped|blocked；写完后自行确认文件存在，再跑 verify。',
      '密码已在 steps 中脱敏为 ******，实际填写用 test-credentials.local.json 中的值，不得写入 result.json。'
    ],
    steps
  }
  writeFileSync(path.join(runDir, 'brief.json'), JSON.stringify(brief, null, 2))
  console.log(`[prepare] 证据目录：${runDir}`)
  console.log(`[prepare] 步骤清单：${path.join(runDir, 'brief.json')}`)
  console.log('[prepare] 下一步：派发 browser_use 子代理执行，主 Agent 按其报告写入 result.json 后跑 verify')
}

const verify = (config, options) => {
  const suite = config.suites[options.suite]
  if (!suite) {
    console.error(`未知 suite：${options.suite}（可选：${Object.keys(config.suites).join('、')}）`)
    process.exit(2)
  }
  const runDir = options.run
    ? path.resolve(projectRoot(options), 'runs', options.run)
    : null
  if (!runDir || !existsSync(runDir)) {
    console.error('verify 需要 --run <runs/ 下的目录名>')
    process.exit(2)
  }
  const resultFile = path.join(runDir, 'result.json')
  if (!existsSync(resultFile)) {
    console.error(`证据缺失：${resultFile}（执行代理未回传结果，不能判定为通过）`)
    process.exit(1)
  }
  let result
  try {
    result = JSON.parse(readFileSync(resultFile, 'utf8'))
  } catch (error) {
    console.error(`result.json 无法解析：${error.message}`)
    process.exit(1)
  }
  if (!['completed', 'aborted'].includes(result.status)) {
    console.error(`result.json 的 status 无效：${result.status}（可选值：completed、aborted）`)
    process.exit(1)
  }
  if (!Array.isArray(result.steps) || !result.steps.length) {
    console.error('result.json 缺少 steps 证据')
    process.exit(1)
  }
  // 步骤全集以配置为准（公共 flows 已展开）：只回传部分步骤不算完整证据，缺步骤直接判定失败。
  const flowSteps = (Array.isArray(suite.flows) ? suite.flows : []).flatMap((flowId) => config.flows?.[flowId] || [])
  const expectedIds = [...flowSteps, ...(suite.steps || [])].map((step) => step.id)
  const reportedIds = new Set(result.steps.map((step) => step.id))
  const missingIds = expectedIds.filter((id) => !reportedIds.has(id))
  if (missingIds.length) {
    console.error(`步骤证据不完整，缺少：${missingIds.join('、')}`)
    process.exit(1)
  }
  const configuredSteps = [...flowSteps, ...(suite.steps || [])]
  const screenshotRequired = new Set(configuredSteps.filter((step) => step.evidence?.screenshot === true).map((step) => step.id))
  const missingScreenshots = result.steps
    .filter((step) => screenshotRequired.has(step.id))
    .filter((step) => typeof step.screenshot !== 'string' || !step.screenshot.trim() || !existsSync(path.resolve(runDir, step.screenshot)))
    .map((step) => step.id)
  if (missingScreenshots.length) {
    console.error(`截图证据缺失或文件不存在：${missingScreenshots.join('、')}`)
    process.exit(1)
  }
  // 二维判定：执行是否完整（completed/outcome）与断言是否通过（expect.* 是否全 pass）分开记录。
  // 步骤 outcome 取值：pass、fail、needs_review、skipped、blocked。
  const incomplete = result.steps.filter((step) => !step.completed)
  if (incomplete.length) {
    console.error(`步骤证据不完整，未执行完：${incomplete.map((step) => step.id || '?').join('、')}`)
    process.exit(1)
  }
  const blockedSteps = result.steps.filter((step) => step.outcome === 'blocked')
  const failedSteps = result.steps.filter((step) => step.outcome === 'fail')
  const reviewSteps = result.steps.filter((step) => step.outcome === 'needs_review')
  const consoleErrors = Array.isArray(result.console_errors) ? result.console_errors : []
  // aborted/blocked 优先于断言失败：执行代理判定环境受限（如后端未启动）时，失败是环境的结果，不算测试失败。
  const verdict =
    result.status === 'aborted' || blockedSteps.length
      ? 'environment_limited'
      : failedSteps.length
        ? 'failed'
        : reviewSteps.length
          ? 'needs_review'
          : 'passed'

  const passedSteps = result.steps.filter((step) => step.outcome === 'pass').length
  console.log(`[verify] 步骤执行 ${result.steps.length}/${result.steps.length} 完成，断言通过 ${passedSteps}/${result.steps.length}`)
  if (failedSteps.length) console.log(`[verify] 断言失败：${failedSteps.map((step) => `${step.id}(${step.summary || step.detail || ''})`).join('、')}`)
  if (reviewSteps.length) console.log(`[verify] 需人工复核：${reviewSteps.map((step) => step.id).join('、')}`)
  if (consoleErrors.length) console.log(`[verify] 控制台错误 ${consoleErrors.length} 条：${consoleErrors.slice(0, 5).join(' | ')}`)
  console.log(`[verify] 判定：${verdict}${result.summary ? ` — ${result.summary}` : ''}`)
  process.exit(verdict === 'passed' ? 0 : verdict === 'environment_limited' ? 3 : verdict === 'needs_review' ? 4 : 1)
}

const main = () => {
  const options = parseArgs(process.argv.slice(2))
  const config = loadConfig(options)
  if (options.command === 'prepare') {
    prepare(config, options, loadCredentials(config, options))
  } else {
    verify(config, options)
  }
}

main()

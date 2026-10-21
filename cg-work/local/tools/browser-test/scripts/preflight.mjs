// 预检：测试目标可达性检查（对标运行中心「先探测再操作」）。
// 用法：node scripts/preflight.mjs --project <fms|lasen> [--suite <id>] [--start]
//   --start 目标不可达时调用对应启动脚本（复用 lasen-runtime-center 的启动入口）并等待就绪。
import { readFileSync, existsSync, readdirSync } from 'node:fs'
import { spawnSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import { validateTestConfig } from './validate-config.mjs'

const scriptsDir = path.dirname(fileURLToPath(import.meta.url))
const toolRoot = path.resolve(scriptsDir, '..')
const listProjects = () =>
  readdirSync(toolRoot, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && entry.name !== 'scripts')
    .map((entry) => entry.name)

const parseArgs = (argv) => {
  const options = { suite: null, start: false, project: null }
  for (let i = 0; i < argv.length; i += 1) {
    if (argv[i] === '--suite') options.suite = argv[++i]
    else if (argv[i] === '--project') options.project = argv[++i]
    else if (argv[i] === '--start') options.start = true
    else {
      console.error(`未知参数：${argv[i]}`)
      process.exit(2)
    }
  }
  const projects = listProjects()
  if (!options.project || !projects.includes(options.project)) {
    console.error(`--project 缺失或无效（可选：${projects.join('、')}）`)
    process.exit(2)
  }
  return options
}

const loadConfig = (options) => {
  const configPath = path.join(toolRoot, options.project, 'test-suites.json')
  const result = validateTestConfig(JSON.parse(readFileSync(configPath, 'utf8')))
  if (!result.ok) {
    console.error(`${options.project}/test-suites.json 无效：${result.error}`)
    process.exit(1)
  }
  return JSON.parse(readFileSync(configPath, 'utf8'))
}

const probe = async (url) => {
  const started = Date.now()
  try {
    const response = await fetch(url, { signal: AbortSignal.timeout(4000) })
    return { ok: response.ok, status: response.status, ms: Date.now() - started }
  } catch (error) {
    return { ok: false, status: 0, ms: Date.now() - started, error: error.message }
  }
}

const waitFor = async (url, seconds) => {
  const deadline = Date.now() + seconds * 1000
  for (;;) {
    const result = await probe(url)
    if (result.ok) return result
    if (Date.now() >= deadline) return result
    await new Promise((resolve) => setTimeout(resolve, 2000))
  }
}

const startTarget = (toolRoot, targetId, target) => {
  const script = path.resolve(toolRoot, target.startScript || '')
  if (!target.startScript || !existsSync(script)) {
    return { started: false, reason: `target ${targetId} 未配置可用的 startScript` }
  }
  console.log(`[preflight] ${targetId} 不可达，调用启动脚本：${script}`)
  const run = spawnSync('powershell.exe', ['-NoProfile', '-ExecutionPolicy', 'Bypass', '-File', script], {
    stdio: 'inherit',
    shell: false
  })
  return run.status === 0
    ? { started: true }
    : { started: false, reason: `启动脚本退出码 ${run.status}` }
}

const main = async () => {
  const options = parseArgs(process.argv.slice(2))
  const config = loadConfig(options)
  const suite = options.suite ? config.suites[options.suite] : null
  if (options.suite && !suite) {
    console.error(`未知 suite：${options.suite}（可选：${Object.keys(config.suites).join('、')}）`)
    process.exit(2)
  }
  const targetIds = suite ? [suite.target, ...(suite.dependsOn || [])] : Object.keys(config.targets)
  const targets = [...new Set(targetIds)]

  const results = []
  for (const id of targets) {
    const target = config.targets[id]
    let health = await probe(target.health)
    if (!health.ok && options.start) {
      const started = startTarget(toolRoot, id, target)
      if (started.started) health = await waitFor(target.health, 180)
      else console.error(`[preflight] ${id} 启动失败：${started.reason}`)
    }
    results.push({ id, ...health, url: target.health })
    console.log(`[preflight] ${id} ${health.ok ? '就绪' : '不可达'}（HTTP ${health.status || '-'}，${health.ms}ms）${target.url}`)
  }

  const broken = results.filter((item) => !item.ok)
  if (broken.length) {
    console.error(`[preflight] 失败：${broken.map((item) => item.id).join('、')} 不可达。启动运行中心或加 --start 后重试。`)
    process.exit(1)
  }
  console.log('[preflight] 全部目标就绪')
}

await main()

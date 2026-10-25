# 计划 · browser-test 接入 cg-work 设计预览

## 背景

框架可视化页（`local/projects/cg-work/design/framework-visualization/`）此前的浏览器验收靠临时命令（Edge headless 或 Chrome DevTools MCP），口径不固定、证据不落盘、无法复跑。`local/tools/browser-test` 已具备「配置驱动 + browser_use 执行 + 证据校验」的完整流程，但现只登记了 fms / lasen 两个需要登录的项目。

## 范围

1. 让 `credentials` 对无登录项目可选：`validate-config.mjs` 校验与 `run.mjs` 加载两处，仅在配置声明时生效，不影响 fms / lasen。
2. 新增 `local/tools/browser-test/cg-work/`：
   - `test-suites.json`：目标 `framework-visualization`（`http://127.0.0.1:8125/index.html`）+ 套件 `design-preview`。
   - `serve.mjs`：只读静态服务，把 `design/framework-visualization` 目录按 http 暴露给预检。
   - `start-static.ps1`：预检 `--start` 时调用；已在运行则直接退出。
3. 更新 `local/tools/browser-test/README.md`：目录结构、cg-work 入口、无登录项目的凭据口径。

不做：不改变 fms / lasen 的任何步骤与凭据要求；不改 run.mjs 的判定逻辑；不引入新依赖。

## 验证

- `node scripts/validate-config.mjs cg-work/test-suites.json` 通过。
- `node scripts/preflight.mjs --project cg-work --suite design-preview --start` 就绪。
- `node run.mjs --project cg-work --suite design-preview prepare` 生成 `runs/<时间戳>-design-preview/brief.json`。
- 派发 browser_use 执行，主 Agent 落 `result.json`，`verify` 退出码 0。
- `npm run check` 通过。

## 标准编码前置检查

- 新增常量：端口 8125、运行目录、套件 id `design-preview` 均只出现在配置与脚本各一处。
- 复用现有 `STEP_ACTIONS` / `EXPECT_KEYS`，不新增断言类型（计算样式仍由 design-quality 的人工/工具测量承担）。
- 提交前运行 `node scripts/validate-config.mjs` 与 `npm run check`。

## 风险与退路

- 预检用 `fetch`，`file://` 不可用，故必须有静态服务；已用 `startScript` + 本地服务覆盖。
- browser_use 截图落盘能力若不可用，`verify` 会因截图缺失判失败，此时把截图步骤改为无 `evidence.screenshot`，并如实记录，不伪造证据。

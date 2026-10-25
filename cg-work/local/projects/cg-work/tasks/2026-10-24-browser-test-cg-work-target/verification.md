# 验证记录 · browser-test 接入 cg-work

## 1. 配置与预检

| 检查 | 命令 | 结果 |
|---|---|---|
| 配置校验 | `node scripts/validate-config.mjs cg-work/test-suites.json` | 测试配置有效 |
| 目标预检 | `node scripts/preflight.mjs --project cg-work --suite design-preview` | framework-visualization 就绪（HTTP 200，82ms） |
| 简报生成 | `node run.mjs --project cg-work --suite design-preview prepare` | runs/20261024-122414-design-preview/brief.json |

## 2. 执行证据

派发 `browser_use` 子代理按 brief 执行，主 Agent 落盘 result.json。

| 项 | 结果 |
|---|---|
| 步骤完成 | 9/9 |
| 断言通过 | 9/9 |
| 控制台 error | 0 |
| 截图 | `screenshots/open-page.png`、`screenshots/assert-page-shell.png` |
| verify 判定 | `passed`（退出码 0） |

已知噪音：`@vite/client` 的 `net::ERR_ABORTED` 来自浏览器中并存的 dev server 标签页；本目标为零外链静态页，不计入失败，已在 result.json 归为 noise。

子代理截图默认落在系统临时目录，本次由主 Agent 复制到运行目录后再写入 result.json，未伪造路径。

## 3. 页面设计侧实测（与本任务同批改动）

| 项 | 实测 |
|---|---|
| 正文 | `body` computed `16px` |
| 12.5px 残留 | 0 处 |
| nav | `backdrop-filter: none`，背景 `rgb(250,249,247)` |
| section | `border-top-width: 0px` |
| card | 边框 0，背景 `rgb(246,244,240)` |
| 390 宽 | h1 1 行，`documentElement.scrollWidth` 390，无横向溢出 |

## 4. 未覆盖项

- 套件只做可见性与控制台冒烟，不断言计算样式（工具无 evaluate 动作）；字号、描边、溢出仍按 `design-quality/references/measurement.md` 人工测量。
- 未测 390 断点下的套件级回归；本轮移动端只做过一次性测量。
- `prefers-reduced-motion` 兜底仍未实现（原页面遗留，不在本任务范围）。

## 5. 环境受限

预检需要目标可访问：若 8125 端口无服务，先跑 `node scripts/preflight.mjs --project cg-work --suite design-preview --start`，或手动 `node cg-work/serve.mjs 8125 <framework-visualization 目录>`。`start-static.ps1` 由预检以独立进程启动，Shell 会话结束时子进程可能被回收，长流程请用常驻终端启动服务。

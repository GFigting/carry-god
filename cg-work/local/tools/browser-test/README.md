# browser-use 测试工具（fms / lasen 共用）

把「浏览器验收」从一句自然语言变成**配置驱动、证据可校验**的测试流程。分工沿用启动工具（`lasen-runtime-center`）的惯例：**工具管流程与证据口径，browser_use 子代理管浏览器操作**。代码一份，按项目分目录隔离配置、凭据与证据。

## 目录结构

```
browser-test/
├── run.mjs                    # 入口（prepare / verify），fms/lasen 共用
├── scripts/
│   ├── validate-config.mjs    # 配置校验
│   ├── preflight.mjs          # 可达性预检（--suite 只检该套件目标，--start 调启动脚本）
│   └── export-document-rule.mjs  # FMS 单据生成规则接口导出（直连后端）
├── fms/                       # FMS 项目：test-suites.json、凭据、runs/、exports/
├── lasen/                     # LASEN 项目：test-suites.json、凭据、runs/
└── README.md
```

## 快速开始

```powershell
Set-Location '<框架根目录>/local/tools/browser-test'   # 相对 cg-work 根：cd local/tools/browser-test
# 一次性：为该项目复制模板并填写本地测试账号（不入框架提交）
Copy-Item fms\test-credentials.example.json fms\test-credentials.local.json
node run.mjs --project fms --suite smoke --visible prepare
```

三步流程（所有命令都带 `--project <fms|lasen>`）：

1. **prepare**：预检服务可达性（不可达可 `--start` 调用运行中心启动脚本）、渲染步骤清单、创建证据目录 `<project>/runs/<时间戳>-<suite>/`，输出 `brief.json`。加 `--visible`（别名 `--show-browser`）会在简报中明确要求保持浏览器前台显示。
2. **执行**：Agent 派发 `browser_use` 子代理，按 `brief.json` 的 `steps` 操作浏览器，**由主 Agent** 把证据写回同一目录的 `result.json`（子代理没有写文件能力）。
3. **verify**：`node run.mjs --project fms --suite smoke --run <runs/下目录名> verify` 校验证据完整性并给出判定。

退出码：`0` 通过、`1` 失败、`2` 用法错误、`3` 环境受限（aborted/blocked，不冒充通过）、`4` 需人工复核（needs_review）。

判定为二维：**执行是否完整**（`status: completed|aborted` + 每步 `completed`）与**断言是否通过**（每步 `outcome: pass|fail|needs_review|skipped|blocked`）。verify 以配置中 suite 的步骤全集（公共 flows 已展开）为准，缺步骤或未执行完直接判失败——执行代理说"已完成"但磁盘上没有 `result.json` 时，verify 会拒绝判定。

## 分工边界

| 谁 | 负责 |
| --- | --- |
| `run.mjs` / `scripts/` | 预检、配置校验、步骤渲染、证据目录、证据完整性与判定 |
| `browser_use` 子代理 | 实际打开页面、点击、填写、断言、截图、收集控制台与网络错误 |
| 主 Agent | 按子代理报告落盘 `result.json`（密码等凭据不写入） |
| 任务计划 | 本次改动的影响面步骤（具体路由、交互），工具只提供通用 smoke |

`selector_hint` 是提示不是精确选择器，执行代理可按现场 DOM 调整；但每步的通过/失败必须落到 `result.json`，缺证据不算通过。

## 配置

服务地址、启动入口与套件步骤统一在 `<project>/test-suites.json`（对标 `runtime-services.json`）；改口径只改这个文件，由 `scripts/validate-config.mjs` 校验。

| 字段 | 说明 |
| --- | --- |
| `targets.<id>.url` / `.health` | 测试入口与预检地址 |
| `targets.<id>.startScript` | 不可达时调用的启动脚本（复用 `lasen-runtime-center/scripts/`，相对 `browser-test/`） |
| `credentials.file` / `.required` | 本地测试账号文件名与必填字段；文件必须是 `*.local.json`，不入框架提交 |
| `flows.<id>[]` | **公共流程**：被多个套件复用的步骤（如登录），套件用 `flows: ["login"]` 引用，展开后在前、套件自身步骤在后 |
| `suites.<id>.dependsOn` | 预检需同时就绪的依赖目标（如登录测试依赖后端健康） |
| `suites.<id>.steps[]` | 声明式步骤：`navigate` / `fill` / `click` / `wait` / `assert`，占位符 `{target.url}`、`{credentials.username}` 在 prepare 时渲染 |
| `steps[].wait` 字段 | `selector_hint` + `state`（`visible` / `hidden` / `attached` / `detached`）+ 可选 `timeout_ms`，用于动态页面加载完成后的显式等待 |
| `steps[].evidence.screenshot` | 设为 `true` 时，verify 强制要求该步骤回传存在的截图文件；结果还应包含 `actual` / `expected` 便于复核 |
| `steps[].when` | 条件执行：`logged_out` 表示仅在 `open-login` 确认未登录时执行，已登录则跳过并记 `skipped` |
| `steps[].expect` | 断言键：`visible`、`text_includes`、`url_includes`、`url_not_includes`、`console_errors`（`none` 表示控制台必须零报错） |

## 两项目差异

| 项 | FMS | LASEN |
| --- | --- | --- |
| 前端地址 | `127.0.0.1:80` | `127.0.0.1:81` |
| 后端预检 | `127.0.0.1:50110` | `127.0.0.1:49700` |
| 登录表单 | **租户名称 + 用户名 + 密码** | 用户名 + 密码 |
| 租户开关 | 开启（`VITE_APP_TENANT_ENABLE=true`），默认租户「拉森-财务」 | 关闭 |
| 现有套件 | `smoke`、`smoke-download-center`、`export-document-rule` | `smoke`、`overseas-tax-dashboard` |

LASEN 的海外税务套件按前端模块拆分为 `overseas-tax-dashboard`、`overseas-tax-registration`、`overseas-tax-asset-management`、`overseas-tax-vat-management`、`overseas-tax-epr-management`、`overseas-tax-authorized-representative`、`overseas-tax-base-config` 和 `overseas-tax-monthly-exchange-rate`。看板套件覆盖已到期指标与处置队列核对；列表套件覆盖加载、重置或刷新和控制台错误检查。动态数量不固定预期值，执行时先等待请求完成并在逐步证据中记录实际结果。

## 登录口径

两项目均以运行中心 `pnpm run front`（`.env.front`）启动，**验证码关闭**；FMS 租户开关继承 `.env` 为开启，登录页多一个租户名称输入框。若改用 `pnpm run dev`（`.env`）且验证码被打开，登录会弹滑块验证码，工具不处理——用运行中心的启动入口即可绕开。

**填表必须先清空再输入**：登录页有 rememberMe 回填，直接 fill 会把值追加成重复串（密码 `pwd123` 变 `pwd123pwd123`，触发"密码长度 4-16 位"校验被拒）。此规则已写进 prepare 输出的 `instructions`，执行代理必须照做并核对实际值。

## 证据与任务回写

- 每次执行留下 `<project>/runs/<时间戳>-<suite>/`：`brief.json`（步骤清单）、`result.json`（判定与逐步证据）、`screenshots/`（关键状态截图）。
- 任务验证记录引用该目录，并区分**已通过 / 环境受限未执行 / 不适用**；verify 退出码 `3` 即环境受限。
- 凭据不进 `result.json`（prepare 输出的步骤清单中密码已脱敏为 `******`）。
- 已知噪音（验证码图片、百度统计 ERR_ABORTED 等）在 result 中单独归类，不计入失败。
- 可见执行时每一步开始和结束都报告步骤 id、动作、当前 URL 和结果；看板等动态页面先完成 `wait` 再读取数量。最终浏览器标签页保留，方便用户复看。


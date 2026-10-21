# browser-test 浏览器验收测试工具入库

## 需求与取舍

用户反馈"框架项目测试工具发现，目前不太容易发现"，经确认真实诉求：`local/tools/browser-test/`（fms/lasen 共用的浏览器验收测试工具）被 `.gitignore` 的 `/local/tools/` 整目录排除，从未进入框架 git。用户指令"测试工具加入 git"，确认两点：

- 入库位置：**白名单保留原路径**（不迁根 `tools/`，避免 fms/lasen 上下文 4 处绝对路径与历史任务证据引用断裂）；
- 规则层接入（README/core 补工具入口指针）**本次不做**，先只入库。

## 入库前安全核查

提交文件清单扫描结果：

- 凭据：脚本运行时从 `test-credentials.local.json` 读取，示例文件仅空占位；`*.local.json`、`runs/`、`exports/`（含 FMS 线上单据规则真实数据）由忽略规则排除，`git check-ignore` 验证生效。
- 清理三处后才入库：
  1. README 快速开始的个人绝对路径 → 相对框架根写法；
  2. README 与 run.mjs 示例文本中的真实测试密码 `admin123` → 通用示例 `pwd123`；
  3. `scripts/_tmp-field-stat.mjs`（临时分析脚本，硬编码个人路径与被排除文件）→ 不入库，`.gitignore` 增加 `**/_tmp-*.mjs` 排除。

## 变更内容

| 文件 | 变更 |
|---|---|
| `.gitignore` | `/local/tools/` 改为 `/local/tools/*` + `!browser-test/` 白名单；排除 `*.local.json`、`runs/`、`exports/`、`_tmp-*.mjs` |
| `local/tools/browser-test/**`（12 个文件） | 首次入库：run.mjs、README、scripts/ 5 个、fms 与 lasen 的 test-suites.json 与凭据示例 |

## 已知限制

- `startScript` 相对引用 `../lasen-runtime-center/scripts/*.ps1`，该工具未入库——新克隆环境需自备运行中心或仅用 `prepare` 不带 `--start`。
- 规则层暂无工具入口指针，发现性依赖 fms/lasen 项目上下文的 `tooling.config_paths` 与 `verification.profiles` 登记（本地文件，不随框架提交）。后续接入规则层另立任务。

## 测试用例

| 编号 | 检查 | 预期 |
|---|---|---|
| TC-001 | `git check-ignore -v` 对 local.json/runs/exports/_tmp | 全部命中排除规则 |
| TC-002 | 暂存清单人工核对 | 仅 12 个工具文件 + .gitignore，无凭据、证据、业务导出 |
| TC-003 | `npm run check`、`npm test` | 全绿，忽略规则变更不影响校验器 |

## 兼容性

文件物理位置不变，fms/lasen 上下文与历史任务证据引用全部继续有效；不涉及规则、模板与校验器，VERSION 不升级。

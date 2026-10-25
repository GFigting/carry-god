# 验证记录

## 自动检查

| 检查 | 命令 | 结果 |
|---|---|---|
| 类型检查与构建 | `npm run build`（framework-visualization） | 通过，`vue-tsc` 无报错，dist 重新生成 |
| 框架校验 | `npm run check` | 通过 |
| 浏览器验收 | `node run.mjs --project cg-work --suite design-preview prepare` → browser-use → `verify` | passed，13/13 步，run `20261025-045007-design-preview` |
| 浏览器验收（追加优化后） | 同上，套件更新为 14 步 | passed，14/14 步，run `20261025-085726-design-preview` |

浏览器证据目录：`local/tools/browser-test/cg-work/runs/20261025-045007-design-preview/`（`result.json`、`screenshots/page-shell.png`、`screenshots/board-expanded.png`，1980×6050 全页截图）；追加优化后复跑目录为 `runs/20261025-085726-design-preview/`，另含 `screenshots/board-narrow.png`（390×1600 @DPR2）。

## 静态产物 vs 开发态

用 headless Edge `--dump-dom` 分别读取两个页面的真实 DOM：

| 标记 | `dist`（8125） | dev（5199） |
|---|---|---|
| `input[type=checkbox]` | 0 | 15（14 行 + 全选） |
| 「本地开发态」 | 0 | 1 |
| 「批量验收」 | 0 | 2 |
| 「建议优先处理」 | 5 | 5 |
| 「产物已齐，可验收」 | 13 | 13 |

静态页无任何写控件，两条建议标签照常可见。bundle 内仍保留开发态字符串（`import.meta.env.DEV` 分支恒为 false），已在 README 明示。

## 追加优化实测（2026-10-25 16:46 起）

用户多选确认三项优化（刷新提速与地址统一、搜索与队列分组、验收反馈与窄屏适配），逐项实测：

| 项 | 做法 | 实测 |
|---|---|---|
| 增量重建 | 缓存 git 日期、提交与 `npm run check` 结果，任务变更只重算任务与统计 | 新建任务 16:55:19 → 快照 16:55:20；删除 16:56:26 → 16:56:27；页面验收 16:56:11 → 16:56:12，均在 1–2 秒内 |
| 地址统一 | `server.host` 固定 `127.0.0.1` | 重启后 `http://127.0.0.1:5173/` 可用，监听地址不再是 `::1` |
| 校验徽标诚实性 | 增量快照沿用启动时校验结果并标注来源 | dev 徽标显示「npm run check 通过（启动时）」，title 说明任务变更不重跑；静态产物无「（启动时）」后缀 |
| 明细搜索 | 过滤任务 ID 与目标，地址同步 `?q=` | 输入 `incremental` → 「任务明细（1 项） — 筛选：搜索「incremental」」，URL `?q=incremental`；任务删除后显示「无匹配任务」 |
| 队列分组 | 待审查 / 等待用户操作 / 其它待办，空组隐藏 | dev 显示「待审查（1）」「等待用户操作（2）」；静态快照为「等待用户操作（2）」 |
| 验收反馈 | 成功结果写入 sessionStorage，刷新后顶部提示 | 验收 1 项后整页刷新显示「已验收 1 项：…」，提示可关闭，storage 随即清空 |
| 窄屏适配 | ≤768px 队列与明细单列、表格横滚、筛选与搜索占满一行 | 390×1600 截图无横向溢出，无批量控件 |

静态产物复核（headless Edge `--dump-dom`）：`input[type=checkbox]` 0、`accept-bar` 0、`#task-search` 存在、徽标不含「（启动时）」；与套件断言一致。

## 写接口实测

在 5199 起 dev server，用两个临时 review 任务 `2026-10-25-batch-accept-smoke-a/b` 实测，验后任务目录已删除：

| 场景 | 请求 | 结果 |
|---|---|---|
| 缺少写头 | `POST` 无 `X-CG-Write` | 403 `缺少 X-CG-Write: 1 头` |
| 非 review | 验收本任务（当时 pending） | 409 `当前状态是 pending，只有 review 可验收` |
| 非法 ID | `../evil` | 400 `非法任务 ID` |
| 不存在 | `no-such-task` | 409 `找不到任务记录` |
| 空数组 | `ids: []` | 400 `ids 需要是非空数组` |
| 方法不符 | `GET` | 405 `只支持 POST` |
| 正常批量 | 两个临时任务 + note | 200，输出两行「已验收」 |

写回结果核对：两个 `task.yaml` 均为 `status: done`，`status_history` 追加 `done` 条目（`at: 2026-10-25T12:49:27`，`reason: 用户已验收：批量验收接口实测`），`next_action.required` 变 `false`、`action` 为 `none`，与命令行写入口径一致。

## 设计门禁（后台界面 B）

- B4 空态：队列为空时仍渲染「当前没有待验收任务」；确认区在未选任务时按钮 disabled，无法进入。
- B7 不只靠颜色：建议标签带文字；批量验收按钮带数量；确认区列出全部 ID。
- B8 键盘可达：复选框与全选为原生 `input`，有 `focus-visible` 描边；打开确认区后焦点自动进入说明输入；Esc 取消，取消/确认均为原生按钮。
- B9 只读诚实性：静态产物无写控件，开发态明示「本地开发态」并提示「构建产物不含此控件」；`npm run preview` 不含写接口。
- B10 布局稳定：任务 ID 与确认区 ID 均 `word-break`，全页截图无溢出；确认区在队列卡内，不遮挡统计与明细。

## 失败与修正

- headless Edge 首次截图静默失败（无文件、无报错），改用 `--headless=new` 后正常产出 1980×6050 截图。
- PowerShell 7 的异常响应是 `HttpResponseMessage`，没有 `GetResponseStream()`；改用 `$_.ErrorDetails.Message` 读取错误体。
- 直接 `npm run dev` 后台启动时日志为空且进程退出；改为 `node node_modules/vite/bin/vite.js --port 5199` 启动成功。5199 为本次临时端口，原 5173 dev server 是上一会话遗留、未加载新插件。
- 追加优化时 5173 上的旧 dev server 仍只绑定 `::1`，`127.0.0.1:5173` 拒绝连接，用户因此「没看到」新控件；停掉旧进程并用新配置重启后恢复。
- 一度用 3 秒间隔探测热更新，probe 仍在，误判为刷新失效；延长等待后发现快照在约 9 秒后更新，原因是每次重建同步跑 `npm run check`（6.4s）与两次 `git log`（1.4s）。改为增量重建后降到 1–2 秒。

## 未覆盖

- 并发验收与撤销未实测：两人同时验收同一任务时，后到请求会因状态已变返回 409；验收即写文件，无撤销。
- dev 下 git 提交与框架文件变化仍需重启 dev server 才能反映（增量重建只覆盖任务与需求箱）。
- 仅在本机回环地址验证；窄屏只截取了静态产物，未在 dev 态移动宽度下复测批量条换行。

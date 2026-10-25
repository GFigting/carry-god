# 框架看板（framework-visualization）

cg-work 的只读框架看板。Vue 3 + TypeScript + Vite 工程，构建时把框架快照注入页面，产物由 `local/tools/browser-test` 静态托管做设计验收。

## 命令

```powershell
npm install      # 仅首次或依赖变更时
npm run dev      # 本地开发，改 task.yaml / 需求箱自动重建；默认 http://127.0.0.1:5173/
npm run build    # 类型检查 + 构建到 dist/
npm run preview  # 预览 dist/
```

## 数据来源

`vite.config.ts` 的 `cg-data` 插件在启动与构建时调用 `scripts/collect.mjs`，把以下来源汇总为虚拟模块 `virtual:cg-data`：

- `local/projects/*/tasks/**/task.yaml`（含归档；读取 `status_history`、`next_action`、`next_user_action`、`created_at`）
- `git log` 自 2026-09-01 起的按日提交，以及每个 `task.yaml` 的最近提交日期（停留天数兜底）
- `skills/` 目录分类计数
- `local/projects/*/requirements-inbox/`
- `npm run check` 的最近结果与 `VERSION`

页面无运行时请求。dev 下修改 `task.yaml` 或需求箱会重建快照；git 提交与框架文件变化需重启 dev server。

重建分两种：启动/构建是**全量**（含 `git log` 与 `npm run check`，约 10 秒）；由任务或需求箱变更触发的是**增量**（复用 git 与校验结果，1–2 秒）。因此 dev 页头的校验徽标会标注「启动时」，git 数据也停留在 dev server 启动那一刻。

## 任务看板交互

- 待验收队列：与 `scripts/acceptance-queue.mjs` 同口径（`status=review` 或 `next_action.required=true`），按「待审查 / 等待用户操作 / 其它待办」分组，组内按停留天数降序；每条可复制验收命令，页面不写回。
- 建议标签：`review.md` 与 `verification.md` 都在时显示「产物已齐，可验收」；停留 ≥7 天显示「≥7 天建议优先处理」。两条都只提示，不替代人工判断。
- 停留天数：优先取 `status_history` 中进入当前状态的最后一条 `at`；缺失时退回该 `task.yaml` 的最近提交日期，再退回 `created_at`。页面标注来源，≥3 天标黄，≥7 天标红。
- 明细行可点击或回车展开：目标、创建/更新时间、进入当前状态时间、状态历史、下一步、文件路径。
- 明细搜索：输入任务 ID 或目标关键词即可过滤，与项目/状态筛选叠加；空结果有独立提示。
- 视图参数：`?proj=job-hunt&status=review&sort=dwell&q=accept&task=<ID>`，旧 `?cell=项目:状态` 仍兼容。
- 窄屏：≤768px 时队列与展开详情单列排版，表格可横向滚动，筛选与搜索输入占满一行。

## 开发态批量验收（仅 dev）

`npm run dev` 时页面额外渲染复选框、全选与「批量验收」按钮；`npm run build` 的产物不渲染这些控件，也不发起任何写请求。（开发态代码以 `import.meta.env.DEV` 条件渲染，构建时分支恒为 false，但字符串仍可能留在 bundle 中。）流程是勾选 review 任务 → 点击批量验收 → 在确认区核对任务 ID、填写可选说明 → 确认（Esc 取消）。

- 页面调用 `vite.config.ts` 中的 `POST /api/accept`，由它 `execFile` 调用 `scripts/acceptance-queue.mjs --accept <ids> --note <note>`；写入口径与命令行完全一致（status → done、追加状态历史、清空 next_action）。
- 安全边界：只监听本机；拒绝非回环来源；要求请求头 `X-CG-Write: 1`；只接受 `status=review` 且未归档的任务；任务 ID 跨项目重名直接拒绝；请求体上限 64KB，一次最多 50 项。
- 没有撤销：验收即写文件。写成功后 dev 文件监听触发整页刷新（增量重建，通常 1–2 秒），队列与停留天数随之更新；验收结果经 `sessionStorage` 跨刷新保留，页面顶部会提示「已验收 N 项」，可手动关闭。
- 端口与地址：`server.host` 固定为 `127.0.0.1`，直接用 `http://127.0.0.1:5173/`；不要把 dev 地址写成 `localhost`，避免部分环境解析到 `::1`。
- `npm run preview` 只预览静态产物，不含写接口。

## 验收

`dist/` 由 `local/tools/browser-test/cg-work/` 暴露在 `http://127.0.0.1:8125/index.html`，套件 `design-preview` 断言标题与六个区块可见、控制台零报错。复跑命令见 [browser-test README](../../../../tools/browser-test/README.md#cg-work-设计预览)。

## 结构

- `src/App.vue`：页头、导航、页脚与六个区块的装配
- `src/sections/`：框架地图、任务状态机、任务看板、工作流、提交时间线、需求箱与健康
- `src/styles.css`：全局 token 与样式（纸底 + 发丝线）
- `scripts/collect.mjs`：快照收集，口径与原静态页构建脚本一致

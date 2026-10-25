# 验证记录

## 自动检查

| 检查 | 命令 | 结果 |
|---|---|---|
| 框架结构校验 | `npm run check`（仓库根） | 通过 |
| 类型检查 + 构建 | `npm --prefix local/projects/cg-work/design/framework-visualization run build` | 通过，`vue-tsc` 无错误；Vite 7.3.7 产出 25 模块、`dist/index.html` 0.38 kB、JS 119.95 kB（gzip 41.22 kB）、CSS 9.89 kB（gzip 2.76 kB） |
| 设计预览套件 | `preflight → prepare → browser_use → verify` | 通过，9/9 步骤，控制台 0 error，4xx/5xx 0 条 |

## 浏览器验收

- 运行目录：`local/tools/browser-test/cg-work/runs/20261024-143212-design-preview/`
- 证据：`result.json`、`screenshots/page-shell.png`（1440×3600，Edge headless 全页截图）
- 断言：页面壳标题「框架全景」、六区标题（框架地图 / 任务状态机 / 任务看板 / 工作流与交付路径 / 提交时间线 / 需求箱与框架健康）全部可见
- 静态服务：`http://127.0.0.1:8125/index.html`，MIME 实测 `text/javascript; charset=utf-8`

## 人工抽查

- `dist/index.html` 仅引用本地 `./assets/`，无外部链接。
- `rg 'https?://' local/projects/cg-work/design/framework-visualization` 无运行期外链（README 仅含本地路径）。
- 构建产物由 `.gitignore` 排除；`node_modules/` 全局忽略。
- 数据快照构建日志：任务与提交数量与页面渲染一致（页面 03/05/06 区计数来自同一快照）。

## 已知未覆盖

- 未做新旧页面逐像素比对；等价性依据为组件模板逐段移植与浏览器可见性断言。
- 未跑 `npm run dev` 的 HMR 路径（只验证了生产构建产物）。
- 空数据、接口异常等状态未构造（页面为构建时快照，无运行时数据源）。

# 审查记录

## 结论

迁移与相关优化通过审查。未发现阻断交付的问题；有三处既有缺陷按要求保持原样，已登记，不在本次范围。

## 逐项检查

| 项 | 结论 | 说明 |
|---|---|---|
| 六区等价 | 通过 | 框架地图、状态机、看板、工作流、时间线、需求箱与健康均迁为组件；标题、表格列、SVG 节点、筛选与点选逻辑、`?sel= / ?day= / ?cell=` 调试参数保留 |
| 数据口径 | 通过 | `scripts/collect.mjs` 与原构建脚本逐段对应：任务扫描、技能分类、目录计数、git log since、`npm run check`、VERSION |
| 样式一致 | 通过 | 原 `<style>` 原样迁入 `src/styles.css`，token 与类名未改；组件仅用原类名 |
| 交互一致 | 通过 | 看板矩阵点选与项目筛选、状态机节点联动、时间线柱状点选与详情、筛选清除按钮均保留 |
| 类型约束 | 通过 | `vue-tsc --noEmit` 通过；虚拟模块 `virtual:cg-data` 有显式类型声明 |
| 数据注入 | 通过 | Vite 插件在启动/构建时注入快照，页面零运行时请求；dev 监听 task.yaml 与需求箱变化 |
| 依赖边界 | 通过 | 仅 vue + vite + typescript + @vitejs/plugin-vue + vue-tsc + js-yaml；固定为稳定主版本（vite ^7.1 / ts ^5.9 / vue-tsc ^3.0 / js-yaml ^4.1 / plugin-vue ^6） |
| 提交卫生 | 通过 | `dist/` 与 `node_modules/` 已忽略；`template.html`、`build.mjs` 已删除，无活引用 |
| 权限面 | 通过 | 页面为只读静态产物，无用户输入、无写入、无外部请求；修复了 serve.mjs 的路径穿越校验（改为 `path.relative`） |

## browser-test 优化

- 断言与文案不匹配：`text=框架目录地图` 改为 `text=框架地图`（迁移前即存在，原套件靠宽松匹配通过）。
- `serve.mjs` 补全 MIME：`.mjs/.json/.map/.svg/.png/.jpg/.jpeg/.ico/.woff/.woff2`，避免 Vite 产物返回 `application/octet-stream`。
- `start-static.ps1` 在 `dist/index.html` 缺失时明确报错并退出 1，不再启动空服务。
- README 增加构建前置步骤，说明目标已指向 `dist/`。

## 项目上下文优化

- `technology.stack` 增加 Vue 3、TypeScript、Vite。
- `documentation.architecture` 增加 framework-visualization README，供相关任务按需加载。
- `verification.profiles` 增加 `framework-visualization-build`（`stage: build`，required）。

## 保持原样的既有缺陷

1. 看板 `STATUS_ORDER` 与 chips 未包含 `blocked`，这类任务只出现在明细表。
2. 交付路径卡片计数在对应路径无任务时回退到默认 standard 计数。
3. 页面无空数据状态（commits 为空时 `commits[0].date` 会报错）。

以上均非本次迁移引入，按「等价迁移」原则未改动。

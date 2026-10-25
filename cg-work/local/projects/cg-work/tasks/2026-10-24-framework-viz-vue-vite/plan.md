# 框架看板迁 Vue + TS + Vite

## 目标

`local/projects/cg-work/design/framework-visualization` 原地从单文件静态页迁成 Vue 3 + TS + Vite 工程。六区（框架地图、任务状态机、任务看板、工作流与交付路径、提交时间线、需求箱与框架健康）的内容、文案、ID、交互与 `?sel= / ?day= / ?cell=` 调试参数保持等价。

## 已确认决策

| 项 | 选择 |
|---|---|
| 目录 | 原地替换，`template.html` / `index.html` / `build.mjs` 退役 |
| 数据注入 | Vite 虚拟模块 `virtual:cg-data`，构建时执行扫描，零运行时请求 |
| 依赖 | 仅 vue + vite + typescript + @vitejs/plugin-vue + vue-tsc + js-yaml |
| 节奏 | 先等价迁移，验收后再单独谈结构重排 |

## 会动

- `framework-visualization` 目录结构：`src/`、`index.html`（Vite 入口）、`vite.config.ts`、`package.json`、`tsconfig.json`、`scripts/collect.mjs`
- 数据注入：扫描逻辑从 `build.mjs` 抽成 `collect.mjs` 导出的 `collectData(repoRoot)`，由 Vite 插件注入
- `local/tools/browser-test/cg-work/serve.mjs` 与 `start-static.ps1` 指向 `dist`
- `local/tools/browser-test/README.md` 的 cg-work 一节

## 不动

- 快照扫描口径：`local/projects/*/tasks/**/task.yaml`、`git log`、`skills/`、`requirements-inbox/`、`npm run check`
- 六区文案、表格/SVG/筛选/点选/时间线展开逻辑
- 样式 token 与纸底发丝线调性（原 `<style>` 原样迁入 `src/styles.css`）
- 根目录 `npm run check` / `npm run queue` 口径

## 步骤

1. 建任务记录与计划（本文件）。
2. 抽 `scripts/collect.mjs`，保持扫描口径与 `data` 字段完全一致。
3. 搭 Vue 工程骨架：`package.json`、`tsconfig`、`vite.config.ts`、`index.html`、`src/main.ts`、`src/env.d.ts`、`src/types.ts`、`src/data.ts`。
4. 迁样式到 `src/styles.css`，迁六区为 `src/sections/*.vue`，逻辑改用 computed / ref。
5. `npm install` + `npm run build`，产出 `dist/index.html`。
6. 更新 `serve.mjs` / `start-static.ps1` 指向 `dist`，更新 browser-test README。
7. 跑 `npm run check`；用 browser-test（preflight → prepare → browser_use → verify）复验六区与控制台。
8. 清理退役文件（`template.html`、`build.mjs`、旧 `index.html`），检查 git 忽略规则。

## 验收标准

- `npm run build` 成功，`dist/index.html` 可被静态服务托管，无外链请求。
- browser-test `design-preview` 9 步全部通过，控制台 0 error。
- 六区可见，标题、表格行数、状态机节点、时间线柱状、需求箱行与迁移前一致（以迁移前 `index.html` 为基线抽样比对）。
- `npm run check` 通过。

## 风险

- `npm install` 新增依赖与 lockfile，维护面变大（已在决策时提示用户）。
- 构建时执行 `npm run check` 会拉长 dev 启动时间；保持口径优先，不做优化。
- Vite 产物为多文件（`assets/*.js`、`*.css`），不再是单文件；静态服务仍只读托管，不影响验收。

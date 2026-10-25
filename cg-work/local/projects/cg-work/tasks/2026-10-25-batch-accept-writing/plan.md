# 页面直接批量验收

## 目标

用户希望在页面上直接完成验收，而不是复制命令回终端，并且能一次验收多条。页面因此新增「勾选 review 任务 → 二次确认 → 批量验收」，同时保留静态产物只读。

## 已确认决策

| 项 | 选择 |
|---|---|
| 写操作范围 | 只开放「批量验收」，不做状态回退、归档、改字段等其它写操作 |
| 落地方式 | vite dev 的 `configureServer` 中间件提供 `POST /api/accept`；`dist` 不包含写控件、不发任何运行时请求 |
| 确认机制 | 二次确认（列出 ID + 验收说明输入 + 确认/取消，Esc 取消），不做撤销 |
| 建议规则 | 只做两条只读提示：「产物已齐，可验收」（review.md 与 verification.md 都在）与「≥7 天建议优先处理」 |
| 安全边界 | 仅 127.0.0.1/localhost；要求 `X-CG-Write: 1`；仅接受 `status=review` 且未归档；body ≤64KB；`execFile` 调脚本，禁 shell 拼接 |

## 设计上下文

- 更新 `local/projects/cg-work/design/design-context.md` 原则 4：静态产物只读；开发态写操作必须二次确认，且不得出现在构建产物中。
- 界面被操作（勾选、确认、取消），按后台界面门禁 B 验收：空态、键盘焦点、不只靠颜色、只读诚实性。

## 会动

- `framework-visualization/scripts/collect.mjs`：任务补 `has_review`、`has_verification`
- `framework-visualization/src/types.ts`：`TaskRecord` 同步
- `framework-visualization/vite.config.ts`：新增仅开发态的 `POST /api/accept`
- `framework-visualization/src/sections/BoardSection.vue`：DEV 下复选框、全选、批量验收条、二次确认区、建议标签
- `framework-visualization/src/styles.css`：上述控件与标签的样式
- `framework-visualization/README.md`：写接口与开发态说明
- `local/tools/browser-test/cg-work/test-suites.json`：`design-preview` 增加「建议优先处理」断言

## 不动

- `dist` 的生成方式与静态托管（零运行时请求）
- `scripts/acceptance-queue.mjs` 的写入口径（页面只是调用它）
- 其它五个区块与既有筛选、排序、展开交互
- 既有视觉 token

## 标准编码前置检查

- 时间字段仍由脚本写入；页面只调 `acceptance-queue.mjs`，不自行 `new Date()` 写状态历史。
- 写请求集中在 `requestAccept()`；结果只读渲染，不缓存为本地状态。
- 不新增依赖；Node 内置 `execFile` 与 Vite 中间件即可。
- 提交前运行 `npm run build` 与 `npm run check`。

## 步骤

1. 落盘计划并更新设计上下文。
2. `collect.mjs` / `types.ts` 增加产物存在标记。
3. `vite.config.ts` 增加写接口与校验。
4. `BoardSection.vue` 增加 DEV 控件与确认流程。
5. `styles.css` 补样式；README 与套件同步。
6. `npm run build`、静态页复验；另起 dev server 用临时任务实测批量验收与 403/409。
7. 写验证与审查记录，转 review。

## 验收标准

- 开发态：review 行可勾选，支持全选/取消全选；批量验收需二次确认，确认后任务变 done 且页面自动重建。
- 静态产物：不出现复选框、批量验收按钮或写接口调用；两条建议标签仍可见。
- 接口：缺少 `X-CG-Write` 返回 403，非 review 返回 409，非本机来源拒绝，body 超限拒绝。
- 空状态、键盘可达、不只靠颜色、`prefers-reduced-motion` 兜底不缺失。
- `npm run build`、`npm run check`、`design-preview` 全部通过。

## 风险与退路

- 开发态写接口是本机便利工具，不做鉴权体系；若暴露到局域网，任何人都可验收任务。默认只监听 127.0.0.1，README 明示。
- dev server 文件监听有 300ms 防抖，验收成功后页面会整页刷新；若未刷新，手动刷新即可。
- 任务 ID 跨项目重名时脚本取第一个命中；接口对重名直接拒绝，避免误验收。

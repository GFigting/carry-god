# 验证记录

## 变更清单

| 文件 | 变更 | 说明 |
|---|---|---|
| `skills/design-quality/SKILL.md` | 新增（第 2 版重写） | 仅路由与流程骨架：加载时机、八步骨架、分流表、四条不可让位项，细则全部外置 |
| `skills/design-quality/references/design-context.md` | 新增 | 四项必填、追问方式、模板、变更规则 |
| `skills/design-quality/references/instruction-contract.md` | 新增 | 优先级、改前三行回执、维度隔离、让位模板、反例 |
| `skills/design-quality/references/gate-pages.md` | 新增 | 主张-证据清单、素材诚实、A1–A18 逐条判定/测量/边界/反例 |
| `skills/design-quality/references/gate-app-screens.md` | 新增 | 继承与豁免对照、B1–B12 专属门禁 |
| `skills/design-quality/references/scorecard.md` | 新增 | 七维 0/2/4 锚点、阈值、循环纪律、评分卡模板 |
| `skills/design-quality/references/change-order.md` | 新增 | 基线六项、五步顺序、对比表模板、回滚条件 |
| `skills/design-quality/references/measurement.md` | 新增 | 三档能力、完整档操作、常见测量错误、记录格式 |
| `skills/design-quality/references/report.md` | 新增 | 六节必填、声明纪律、交付模板 |
| `skills/README.md` | 修改 | 本地化技能段落与特殊技能索引加入 `design-quality` |
| `VERSION` | 修改 | 2.33.1 → 2.34.0 |

## 验收条件对照

| 验收条件 | 结论 | 证据 |
|---|---|---|
| SKILL.md 只做路由、不重复细则 | 通过 | 八步骨架仅含入口与"走哪篇"，门禁无条文 |
| 每篇 reference 自含判定细则、测量、边界、反例与模板 | 通过 | gate-pages A1–A18、gate-app-screens B1–B12 均按四段式展开 |
| 用户指令优先与让位记录 | 通过 | `instruction-contract.md` 优先级表、让位模板、三组反例 |
| 索引与版本同步，`npm run check` 通过 | 通过 | 见下 |

## 执行结果

- `npm run check`：通过，退出码 0。
- `npm test`：未执行。纯文档与索引变更，无脚本、模板或校验器改动。

## 未覆盖项与限制

- 无自动化测量脚本，门禁依赖人工测量；`measurement.md` 已定义完整/半程/降级三档及声明要求。
- 未与 `baoyu-design`、`prototype` 做联调验证；两者正文未改，仅新增引用关系。
- 未收集真实页面用例做规则校准；A6（区块间距 96–240px）、A17（≥8 个移动元素）等阈值为上游研究值，本地未复测。

## 结论

第 2 版由单文件改为路由 + 八篇参考，细则可查、模板可复制。结构校验通过，等待用户验收后提交收尾。

## 补充变更（第 3 轮：文件落位与项目上下文关联）

| 文件 | 变更 | 说明 |
|---|---|---|
| `skills/design-quality/references/design-context.md` | 重写 | 产物路径统一为 `local/projects/<project-id>/design/design-context.md`；新增反参考、三词人格、3–5 条原则、无障碍四项；共享 + 页面清单两级结构；登记方式与冲突规则；不建占位文件 |
| `skills/design-quality/SKILL.md` | 修改 | 第 0 步补产物路径与"无则问一轮再写" |
| `skills/design-quality/references/report.md` | 修改 | 报告中的上下文来源路径同步 |

决策：设计上下文不写进业务仓库根，也不复制到任务目录；登记进 `documentation.development_standards`（`load: when_relevant`）。曾改挂 `business`，按用户决定恢复初版选择，并在 reference 中补一条使用约束——该文件是方向依据，权威低于用户当次指令与既有设计系统，反参考不得升级为全站禁令。按 `core/project-context.md` 第 93 条，当前无实际设计上下文时不建占位文件、不登记空路径，等首个 UI 任务问清后落盘再登记。

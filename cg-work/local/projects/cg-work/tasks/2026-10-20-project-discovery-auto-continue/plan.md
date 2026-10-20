# 实施方案：project-discovery 减少用户确认（既有项目唯一匹配自动继续）

## 背景与决策

用户指令「项目发现减少用户确认，你找一个就直接下一步」。brainstorming 两节设计已确认：

1. **放开范围**：仅 `existing-project` 且唯一匹配——Agent 自查候选后展示识别摘要并直接继续，不等确认；新项目、`needs-clarification`、重名多候选保留确认。
2. **上下文缺失**：既有项目唯一匹配但 `project-context.yaml` 缺失或失效时，直接执行 `framework:project-initialization`，差异报告写入初始化任务记录，确认不再作为前置门禁。

不动边界：README 第 12 步 `high`/`irreversible` 决策预检、`project-initialization` 技能的产物范围、归档任务与历史记录。

## 变更清单

1. `skills/project-discovery/SKILL.md`：
   - `对话协议` 改为 `识别协议`：先自查 `local/projects/*/project-context.yaml` 候选 → 唯一匹配直接产出摘要并继续；零匹配或多候选才进入一问一答（保留「一次只问一个问题」与新项目事实收集）。
   - `确认摘要与路由` 改为 `识别摘要与路由`：唯一匹配摘要展示后标注「已自动继续，可随时打断纠正」不阻塞；`new-project` 摘要仍需明确确认；`existing-project` 缺失失效直接 `framework:project-initialization`。
   - `停止条件` 收窄：仅 `new-project`、`needs-clarification`、路径不可访问、重名未决、外部权限时阻塞；保留「不得用默认值绕过确认」「不得把探测结果当成确认」字样。
2. `core/project-context.md` 识别与初始化门禁（L9-L13）：唯一匹配自动继续、缺失失效直接初始化、差异报告入任务记录；新项目初始化任务保持 `pending` 等确认，既有项目初始化完成即加载继续。
3. `README.md` 使用顺序第 8、9 步：去掉「等待用户确认识别摘要」「缺失或失效时等待初始化确认」。
4. `workflows/project-discovery.md` 正文与 `workflows/README.md` 路由说明：「确认后路由」→「唯一匹配自动路由」。
5. `test/project-discovery.test.mjs`：`只有用户明确确认摘要后才能继续` 断言改为按分类断言（新项目仍需确认、既有项目唯一匹配自动继续），补自查候选正向断言。

## 执行顺序

1. 改 SKILL → 2. 同步 core/README/workflows → 3. 更新测试 → 4. `npm run check` 修断链 → 5. `npm test` 回归 → 6. 补 verification/review 并转 review。

## standards_preflight

- 项目自动检查：`npm run check`（结构、锚点、工作流引用）、`npm test`（行为断言）
- 当前差异人工检查：确认门禁收窄仅限既有项目唯一匹配，`new-project`/`needs-clarification`/特殊操作授权边界措辞未被削弱；旧措辞在活跃规则文件中无残留（归档任务不改写）
- 不适用项：业务仓库提交检查（不触碰业务仓库）

# 验证证据

## 自动检查

- `npm run check` → `cg-work checks passed`（结构、锚点、工作流技能引用、受管任务记录全绿）
- `npm test` → **tests 49 / pass 49 / fail 0**，全量通过

## 测试断言更新（test/project-discovery.test.mjs）

- 删除旧门禁断言：`只有用户明确确认摘要后才能继续`
- 新增正向断言：`先自查，找不到才问`、`local/projects/*/project-context.yaml` 自查范围、`唯一匹配…不等待用户确认`、`摘要需用户明确确认后，才执行 framework:project-initialization`（新项目门禁保留）、`确认不作为前置门禁`、README「既有项目唯一匹配时展示识别摘要后直接继续」、workflow「唯一匹配时展示识别摘要后自动路由」
- 保留断言：三类分类标识、`一次只问一个问题`、`不得用默认值绕过确认`、`不替代需求澄清` 与防误判两条

## 规则一致性扫描

全仓（README、core/、workflows/、skills/、scripts/）检索旧措辞 `等待用户确认识别摘要`、`只有用户明确确认摘要`、`等待初始化确认`、`确认摘要` → **零命中**，无活跃规则残留旧门禁表述（归档任务与历史记录未改写）。

## 边界核对

- 新项目（`new-project`）与信息不足（`needs-clarification`）仍需用户确认识别摘要后才进入初始化，原文案「确认前不得写项目代码、依赖、Git 配置、凭据或启动服务」保留；
- README 第 12 步 `high`/`irreversible` 决策预检未改动；
- `project-initialization` 技能正文未改动，初始化产物范围不变；
- 既有项目上下文缺失/失效的差异报告写入初始化任务记录，不静默覆盖。

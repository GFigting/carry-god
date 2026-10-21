# 实施方案：standards_preflight 标识符全框架改中文

## 背景

用户要求「standards_preflight 使用中文」并确认范围为「全框架统一改中文」。`standards_preflight` 作为英文标识符散布在规则正文、工作流、脚本说明与测试断言中，统一改为中文表述「标准编码前置检查」（与 workflows/README.md 已有章节名一致，避免再造近义词）。

## 变更清单

1. `core/operating-model.md`：元数据摘要条目改中文（「标准编码前置检查不是任务字段」）。
2. `core/project-code-standards.md`：提交前检查改为「任务计划的『标准编码前置检查』段落」。
3. `workflows/README.md`：「必须完成」句与证据段落定义句改中文。
4. `workflows/feature-development.md`、`workflows/bugfix.md`：指针句改中文（锚点 `README.md#标准编码前置检查` 不变）。
5. `scripts/README.md`：字段列举移出 `standards_preflight`（本就不是字段）、段落定义句改中文。
6. `test/standards-preflight.test.mjs`：断言同步中文措辞。
7. **不改写**：任务产物（plan/verification/review 中的历史 `## standards_preflight` 章节）与需求包原文属审计记录，按框架规则保留；测试文件名保持 kebab-case 英文命名。新任务的计划/验证章节写 `## 标准编码前置检查`。

## 执行顺序

盘点引用（7 个规则/测试文件）→ 逐处替换 → 残留扫描 → `npm run check` + `npm test` → 补证据转 review。

## 标准编码前置检查

- 项目自动检查：`npm run check`、`npm test`
- 当前差异人工检查：仅措辞替换，规则语义、锚点与唯一来源指向不变；归档与历史任务产物不改写
- 不适用项：业务仓库提交检查（不触碰业务仓库）

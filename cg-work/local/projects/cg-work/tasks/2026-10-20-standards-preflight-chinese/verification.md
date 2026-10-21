# 验证证据

## 自动检查

- 全仓残留扫描（core/、workflows/、skills/、scripts/、test/、根文档）：`standards_preflight` 规则层**零命中**；仅存于 `local/projects/` 下的历史任务产物与需求包（审计记录，按规则不改写）
- `npm run check` → `cg-work checks passed`
- `npm test` → tests 49 / pass 49 / fail 0（修正一处断言正则漏「的」字后全绿）

## 行为边界

- 仅措辞替换：规则语义、`README.md#标准编码前置检查` 锚点、唯一来源指针关系全部不变
- 中文名沿用 workflows/README 既有章节「标准编码前置检查」，未新增近义词
- 测试断言同步改为中文匹配，测试意图（三份文档必须指向该段落唯一来源）不变
- 测试文件名保留 kebab-case 英文（框架命名规范要求）

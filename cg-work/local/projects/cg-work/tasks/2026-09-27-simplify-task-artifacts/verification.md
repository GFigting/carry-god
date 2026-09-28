# 验证记录

## standards_preflight

- `artifact_profile` 只允许 `compact`，避免隐式改变历史任务语义。
- `artifacts.primary` 必须是任务目录内存在的非自引用文件。
- 历史标准任务引用和路线图关闭门禁保持原样。

## 命令结果

- `node --test test/check-task.test.mjs`：通过，27/27。
- `npm test`：通过，39/39。
- `node scripts/check-all.mjs`：通过。
- `git diff --check`：通过；仅有换行符转换提示，无差异空白错误。

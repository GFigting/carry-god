# cg-work 项目初始化报告

## 探测范围

- 项目根路径：`D:/songgf/Projects/all-work/carry-god/cg-work`
- 规则入口：`AGENTS.md`
- 文档入口：`README.md`、`core/operating-model.md`、`core/context-loading.md`
- 技术与测试入口：`package.json`、`test/`

## 已确认事实

- 项目 ID 取根目录名，规范化为 `cg-work`。
- 项目使用 Node.js ECMAScript modules；包管理器为 npm。
- `npm test` 是已登记的完整测试命令。
- 项目不登记服务启动入口或健康检查。

## 未确认项

- 无项目专属技能路径。
- 无独立构建命令；因此 `technology.build_command` 保持为空。

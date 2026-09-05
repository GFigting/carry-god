# carry-god

AI 软件开发 Harness 集合。

## 项目结构

```text
cg-harness/                    统一用户入口、路由和任务模板
GGFrame/                       Goal、Task、Context、Evidence 治理框架
superpowers/                   澄清、计划、TDD、调试和验证方法论
skills/                        小粒度、可组合的工程技能
gstack/                        产品、设计、QA、安全、发布和浏览器工具
compound-engineering-plugin/   跨平台技能分发、转换和测试基础设施
```

## 推荐入口

用户只需要记住以下 `cg-` 指令：

- `/cg-work`：新功能和一般开发
- `/cg-fix`：修复错误行为，复杂问题生成 HTML 诊断说明
- `/cg-refactor`：改善内部结构，保持外部行为
- `/cg-optimize`：针对明确指标进行优化
- `/cg-prototype`：创建产品、交互或 UI 原型
- `/cg-review`：审查、验证、总结和知识沉淀

也可以直接使用自然语言，Harness 按意图自动路由。

## 设计原则

- GGFrame 负责 Goal、Task、Context、Evidence 和状态。
- 外部项目负责具体能力，不创建第二套任务状态机。
- 小任务走最短路径，复杂任务才增加计划、审查和多 Agent 协作。
- 修复、重构、优化和原型分别建模，使用不同的验收标准。
- 能力不可用时记录降级结果，不声称执行过未安装的技能。

详细设计和路由见 [`cg-harness/README.md`](cg-harness/README.md)。

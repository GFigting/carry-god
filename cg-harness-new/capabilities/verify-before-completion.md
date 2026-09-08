---
type: capability
id: CGHN-CAP-006
stage: completion
---

# 完成前验证

任何完成声明前都执行：

1. 明确每个声明对应的验证命令或检查。
2. 运行完整的相关验证，而不是依赖旧结果或局部猜测。
3. 读取退出状态、失败数、关键输出和覆盖范围。
4. 对照验收标准逐项核对。
5. 明确未验证项、环境限制和人工复查事项。
6. 如本轮包含代码提交，检查提交是否遵循 `commit-conventions.md`，并且提交中的验证信息与实际结果一致。

没有新证据时，不得声称测试通过、构建成功、问题已修复或需求已完成。

## 深度执行流程

准备声明完成、创建提交或进入交付时，加载 [完成前验证](../skills/verification-before-completion/SKILL.md)。它定义声明与证据的对应关系；验收追踪、提交格式和交付记录仍分别以 `requirements-to-development.md`、`commit-conventions.md` 和工作流文件为准。

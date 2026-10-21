# 审查记录：框架子智能体调用时机优化

## 实现符合性

- 需求覆盖：用户确认的四项目标全部落地——统一判据（新技能为唯一来源）、覆盖全部工作流（feature-development 两段正文收敛为指针，bugfix/review 补指针，refactor 声明按 feature-development 执行自动继承）、纠正派发偏差（反模式节覆盖该派不派/过度派发/错误并行）、验证阶段规则（browser-use 按 `verification.profiles` 派发、回写 `verification.md`、区分三类结果、声明纯浏览器验收边界）。
- 计划一致性：按 plan.md 实施步骤逐项完成，无越界——未修改镜像技能正文、未动 core 不变量（operating-model L145 汇总写回保留）与 special-operations 场景表。
- 双来源检查：判据正文仅存于新技能；workflows 只留指针（TC-003 证据）。新技能对镜像流程与 core 不变量均为引用而非复制，符合"唯一来源+指针"惯例。

## 测试处理

新增 `test/subagent-dispatch-timing.test.mjs`（2 项）为框架自有测试，非业务仓库测试，按框架维护规则保留；无删除或改写的存量测试。

## 冗余清理

无新增脚本、配置或临时文件；改动仅限计划变更地图所列文件。

## 文档同步

`documentation.impact: update`——受影响文档即本任务交付物本身（skills/README.md 登记、workflows 三处指针、VERSION 2.32.0）；README.md 主入口与 core 不重复正文，无需改动。

## 遗留项

- 无。`subagent-timing` 类判据若后续在实践中需要细化（如模型选择档位），按持续学习流程另行沉淀，不阻塞本任务。

## 集成决定

保留本地 commit：框架文件（技能、workflows、索引、测试、VERSION）与任务记录分成两个 commit 提交；推送需用户单独授权。等待用户验收。

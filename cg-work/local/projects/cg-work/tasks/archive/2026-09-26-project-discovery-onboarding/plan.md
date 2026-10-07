# 项目识别与初始化引导实施计划

## 目标

增加一个在上下文加载前运行的对话式项目识别阶段，并把新项目确认后的路由接入现有项目初始化流程。

## 范围

### 包含

- 新增 `project-discovery` 框架技能和对应工作流。
- 更新入口、上下文加载和项目接入规则，明确识别、初始化和需求澄清边界。
- 增加文档结构校验覆盖和三类入口的行为测试。

### 不包含

- 不改变项目上下文 YAML schema。
- 不实现自动创建业务项目、代码、依赖或运行环境。
- 不在用户确认前执行项目初始化的写入动作。

## 需求与验收

- 需求来源：`../../requirements-inbox/2026-09-26-project-discovery-onboarding.md`
- 验收标准：
  - [ ] 入口先完成既有项目/新项目/信息不足的分类。
  - [ ] 新项目识别包含最小问题集、确认摘要和用户确认门禁。
  - [ ] 工作流和技能引用通过 `check-all`，规则文本通过回归测试。

## 影响范围

- 文件、模块或规则：`README.md`、`core/context-loading.md`、`core/project-onboarding.md`、`workflows/`、`skills/project-discovery/`、`test/`
- 调用方和依赖方：所有依赖项目上下文的开发工作流；现有 `framework:project-initialization` 作为确认后的下游流程。

## standards_preflight

- 需要常量化的流程标识：`existing-project`、`new-project`、`needs-clarification` 以及 `framework:project-discovery`；本次仅在文档和测试中作为协议字面量出现，允许保留在示例 YAML/Markdown 中。
- 不新增运行时代码、业务接口或配置字段，因此无其他状态、路由、阈值或数据字面量需要抽取。

## 实施步骤

1. 新增项目识别技能，定义输入事实、逐问收集、分类规则、确认摘要、路由和停止条件。
2. 新增项目识别工作流并同步入口、上下文和接入规则。
3. 添加测试，验证工作流引用和识别协议关键门禁。
4. 运行全量结构检查、项目/任务检查和测试，完成审查与交接记录。

## 计划审核

- 需求覆盖：完整；已覆盖对话判断、最小信息收集、确认后初始化和三类后续动作。
- 范围边界：无越界；不修改现有初始化探测逻辑或项目代码。
- 依赖与顺序：先新增技能，再新增工作流和入口引用，最后补验证；`check-all` 依赖引用方全部落地。
- 验收与验证：可通过文本协议测试、工作流结构检查和现有 Node 测试观察。
- 风险与回滚：主要风险是入口文档与上下文规则不一致；回滚可删除新增工作流/技能并恢复入口引用。
- 审核结论：通过。
- 审核意见来源：主 Agent 自审。

## 验证

- 自动化测试：`npm test`
- 静态检查或构建：`node scripts/check-all.mjs`、`node scripts/check-project.mjs local/projects/cg-work/project-context.yaml`、`node scripts/check-task.mjs local/projects/cg-work/tasks/2026-09-26-project-discovery-onboarding/task.yaml`
- 用户验收：确认入口文档能指导一次新项目识别对话，并在确认后转入初始化。

## 风险与交付

- 风险和环境限制：框架本身没有运行时对话编排器，因此本次以可执行的流程/技能契约提供引导，实际 Agent 入口按该契约执行。
- 集成方式：用户验收后创建本地 Git commit；不推送、不部署。

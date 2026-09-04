---
type: process
process_id: "PROC-DEV-004"
name: "紧急修复流程"
category: "开发流程"
trigger: "生产环境发现 P0/P1 级 Bug，影响核心业务正常运行"
triggered_by: ["技术负责人", "SRE工程师"]
estimated_duration: "2-8小时"

# LangGraph 风格定义
graph_type: "conditional"

nodes:
  - node_id: "node_confirm"
    role: "[[ROLE-技术负责人]]"
    action: "收到生产环境 Bug 报告后，快速确认 Bug 真实性和影响范围，判定严重级别（P0/P1/P2/P3）"
    input: "Bug 报告/告警信息、用户反馈、监控数据截图"
    output: "Bug 确认单（含严重级别判定、影响范围描述、用户影响面）"
    checklist: "严重级别判定是否准确、影响范围是否明确"
    timeout: "15分钟"

  - node_id: "node_decision"
    role: "[[ROLE-技术负责人]]"
    action: "根据 Bug 严重级别，决定是否走紧急修复通道：P0（核心业务完全不可用）强制走紧急通道；P1（核心功能降级）评估后决定；P2/P3 走常规流程"
    input: "Bug 确认单（含严重级别）"
    output: "修复通道决策（紧急 / 常规）"
    checklist: "是否满足紧急通道触发条件：P0 自动触发、P1 需评估影响面"
    timeout: "10分钟"

  - node_id: "node_quick_fix"
    role: "[[ROLE-后端开发工程师]] / [[ROLE-前端开发工程师]]"
    action: "在主干分支或紧急修复分支上实施最小化修复，专注解决根因而非优化代码。修复代码须简明清晰，附修复说明"
    input: "Bug 确认单（含根因初步分析）、错误日志/堆栈、相关代码"
    output: "紧急修复代码（最小化改动）、修复说明（含根因简述、修复方案、影响范围）"
    checklist: "修复是否针对根因、是否最小化（无附带重构）、自测是否通过"
    timeout: "2小时"

  - node_id: "node_simplified_review"
    role: "[[ROLE-代码审核员]]"
    action: "对紧急修复代码进行加速审查，重点检查修复正确性和安全性，可跳过代码风格等非关键检查项"
    input: "紧急修复 PR（含修复说明）、Bug 确认单"
    output: "审查结论（Approve / Request Changes），审查须在 30 分钟内完成"
    checklist: "修复是否正确、是否引入新的安全风险、是否有明显的副作用"
    timeout: "30分钟"

  - node_id: "node_regression"
    role: "[[ROLE-测试工程师]]"
    action: "对修复进行快速回归验证：复现原 Bug 确认修复生效，执行受影响模块的关键回归用例"
    input: "修复代码部署的测试环境地址、Bug 复现步骤、核心回归用例"
    output: "回归验证报告（修复确认 + 回归结果）"
    checklist: "原 Bug 已修复、核心回归用例通过、无新功能异常"
    timeout: "1小时"

  - node_id: "node_emergency_deploy"
    role: "[[ROLE-DevOps工程师]]"
    action: "走紧急发布通道，跳过常规灰度放量等待时间（可压缩至最小观察期），快速部署修复到生产环境"
    input: "紧急修复代码（已通过审查和回归）、紧急发布审批"
    output: "生产环境修复已部署、紧急发布记录"
    checklist: "部署成功、健康检查通过、核心指标恢复正常"
    timeout: "30分钟"

  - node_id: "node_post_fix"
    role: "[[ROLE-后端开发工程师]] / [[ROLE-前端开发工程师]]"
    action: "紧急修复上线后，补全常规流程中被跳过的步骤：补充单元测试、更新技术文档、补充完整 Code Review、记录根因到知识库"
    input: "修复代码、修复说明、紧急发布记录"
    output: "补充的单元测试、更新的文档、完整的 Bug 根因分析记录（事后）"
    checklist: "单元测试已补充、文档已更新、根因已记录"
    timeout: "2天（不阻塞主线）"

  - node_id: "node_normal_process"
    role: "按常规流程"
    action: "P2/P3 Bug 不满足紧急修复条件，走常规 [[PROC-需求到上线]] 或 [[PROC-代码审查流程]]"
    input: "Bug 确认单"
    output: "切换到常规流程"
    checklist: ""
    timeout: ""

edges:
  - from: "node_confirm"
    to: "node_decision"
    condition: ""

  - from: "node_decision"
    to: "node_quick_fix"
    condition: "P0 级 Bug（核心业务完全不可用）必须走紧急通道；P1 级 Bug（核心功能降级）经技术负责人评估后也可走紧急通道"

  - from: "node_decision"
    to: "node_normal_process"
    condition: "P2/P3 级 Bug，或 P1 级经评估走常规流程更合适"

  - from: "node_quick_fix"
    to: "node_simplified_review"
    condition: ""

  - from: "node_simplified_review"
    to: "node_regression"
    condition: "审查结论为 Approve"

  - from: "node_simplified_review"
    to: "node_quick_fix"
    condition: "审查结论为 Request Changes（修复方案有问题或引入新风险）"

  - from: "node_regression"
    to: "node_emergency_deploy"
    condition: "回归验证通过，修复确认生效"

  - from: "node_regression"
    to: "node_quick_fix"
    condition: "回归验证失败（修复未生效或引入新问题）"

  - from: "node_emergency_deploy"
    to: "node_post_fix"
    condition: ""

tags:
  - type/process
  - process/dev
created: "2026-05-24"
updated: "2026-05-24"
---

# PROC-紧急修复流程

## 流程概述

针对生产环境 P0/P1 级 Bug 的加速修复通道。通过简化审查步骤、压缩验证周期和紧急发布机制，以牺牲部分流程完整性的代价换取修复速度。核心原则：**止损优先，事后补全**。紧急修复上线后必须补全常规流程中被跳过的步骤（单元测试补充、文档更新、完整 Code Review、根因记录）。

## 触发条件

- **触发者**：[[ROLE-技术负责人]] 或 [[ROLE-SRE工程师]]
- **触发事件**：生产环境发现影响核心业务的 Bug
- **前置条件**：
  - Bug 已被确认真实存在且影响核心业务
  - 严重级别判定为 P0（核心业务完全不可用）或 P1（核心功能降级）
  - 技术负责人已批准走紧急通道

## Bug 严重级别定义

| 级别 | 判定标准 | 是否走紧急通道 | 响应 SLA |
|------|----------|---------------|----------|
| P0 | 核心业务完全不可用，全体用户受影响 | 强制走紧急通道 | 15 分钟内组建修复小组 |
| P1 | 核心功能降级，部分用户受影响，或无有效规避方案 | 经 TL 评估后可选紧急通道 | 30 分钟内开始修复 |
| P2 | 非核心功能异常，少量用户受影响，有规避方案 | 走常规流程 | 纳入当前或下个迭代 |
| P3 | 不影响使用的体验问题或偶发 Bug | 走常规流程 | 纳入 Backlog 排期 |

## 流程图

```mermaid
graph TD
    A[node_confirm<br/>Bug确认与定级] --> B[node_decision<br/>通道决策]
    B -->|P0/P1紧急| C[node_quick_fix<br/>快速修复]
    B -->|P2/P3常规| N[node_normal_process<br/>切换常规流程]
    C --> D[node_simplified_review<br/>简化审查]
    D -->|Approve| E[node_regression<br/>回归验证]
    D -->|驳回| C
    E -->|通过| F[node_emergency_deploy<br/>紧急发布]
    E -->|失败| C
    F --> G[node_post_fix<br/>事后补全]
    G --> H[完成]
```

## 节点详细说明

| 节点ID | 角色 | 动作 | 输入 | 输出 | 检查清单 | 超时 |
|--------|------|------|------|------|----------|------|
| node_confirm | [[ROLE-技术负责人]] | Bug确认与定级 | Bug报告、告警、监控数据 | Bug确认单（含级别和影响面） | 级别判定准确 | 15min |
| node_decision | [[ROLE-技术负责人]] | 通道决策 | Bug确认单 | 通道决策 | 满足触发条件 | 10min |
| node_quick_fix | [[ROLE-后端开发工程师]] / [[ROLE-前端开发工程师]] | 最小化修复 | Bug确认单、日志、代码 | 修复代码+修复说明 | 最小化、根因修复 | 2h |
| node_simplified_review | [[ROLE-代码审核员]] | 加速审查 | 修复PR、Bug确认单 | 审查结论 | 正确性+安全性 | 30min |
| node_regression | [[ROLE-测试工程师]] | 快速回归 | 修复部署、复现步骤、回归用例 | 回归验证报告 | 修复确认+核心回归 | 1h |
| node_emergency_deploy | [[ROLE-DevOps工程师]] | 紧急发布 | 修复代码、紧急审批 | 生产修复已部署 | 健康检查通过 | 30min |
| node_post_fix | [[ROLE-后端开发工程师]] / [[ROLE-前端开发工程师]] | 事后补全 | 修复代码、修复说明 | 补充测试+文档+根因记录 | 补全常规流程 | 2天 |

## 条件边说明

| 来源 | 目标 | 条件 |
|------|------|------|
| node_decision | node_quick_fix | P0 强制紧急；P1 经 TL 评估影响面后决定走紧急通道 |
| node_decision | node_normal_process | P2/P3 级 Bug 或 P1 不适合紧急修复 |
| node_simplified_review | node_regression | 审查 Approve，修复正确且无明显安全风险 |
| node_simplified_review | node_quick_fix | 审查 Request Changes，修复方案有缺陷或引入风险 |
| node_regression | node_emergency_deploy | 修复确认生效，核心回归用例通过 |
| node_regression | node_quick_fix | 修复未生效或回归发现新问题 |
| node_emergency_deploy | node_post_fix | 紧急发布成功后触发事后补全任务 |

## 简化审查 vs 常规审查对比

| 维度 | 常规审查 (PROC-DEV-002) | 简化审查 (本流程) |
|------|------------------------|-------------------|
| 审查人员 | 代码审核员（可指定 2 人） | 代码审核员 1 人即可 |
| 自动检查 | 全部 CI 检查 | 仅编译 + 安全扫描 |
| 审查维度 | 全五维度 | 重点正确性 + 安全性 |
| 代码风格 | 必须符合规范 | 可放宽，事后补全 |
| 超时 | 2 小时 | 30 分钟 |
| 驳回后 | 常规修改重提 | 加速修改重审 |

## 事后补全清单 (node_post_fix)

紧急修复上线后，开发工程师必须在 **2 天内** 完成以下补全工作：

1. **单元测试补充**：为修复代码编写完整的单元测试，覆盖率不低于 80%
2. **完整 Code Review**：提交补充测试和代码优化后，走完整的 [[PROC-代码审查流程]]
3. **文档更新**：更新 API 文档、部署说明和技术方案中受影响的章节
4. **根因分析记录**：编写正式的 Bug 根因分析文档，记录到知识库 `5.知识沉淀/`
5. **监控告警评估**：评估是否需要新增或调整监控告警规则以提前发现同类问题
6. **复盘记录**：P0 级 Bug 需组织事后复盘，输出改进 Action Items

## 异常处理

| 异常场景 | 处理策略 | 升级路径 |
|----------|----------|----------|
| 根因不能在 1 小时内定位 | 先实施应急止血方案（降级/限流/切换）恢复服务，再深挖根因 | 技术负责人 → 系统架构师 |
| 修复方案有争议 | 技术负责人快速裁决，优先止损，争议事后复盘 | 技术负责人 |
| 修复涉及数据库变更 | 数据库脚本须在测试环境验证后方可执行，不可直操生产库 | DevOps → DBA |
| 紧急发布后指标未恢复 | 立即回滚至上一稳定版本，重新分析问题 | DevOps → 技术负责人 |
| 事后补全超时 2 天 | 技术负责人跟踪催办，超期记录为技术债 | 技术负责人 |

## 关联工作类型

- 主要关联：[[WT-Bug修复]]（紧急场景）
- 引用的常规流程：
  - [[PROC-需求到上线]]（P2/P3 走常规）
  - [[PROC-代码审查流程]]（事后补全中的完整审查）
  - [[PROC-发布流程]]（常规发布参考，紧急时压缩）

## Agent 编排映射

本流程的每个节点可作为一个独立的 Agent 任务派发。紧急流程的 Agent 任务优先级应设置为最高，超时约束严格。

| 节点ID | 节点名称 | Agent 角色 | 上下文包 (required) | 完成信号 |
|--------|---------|-----------|-------------------|---------|
| node_confirm | Bug确认与定级 | [[ROLE-ARCH-001]] | 本流程 + [[ROLE-ARCH-001]] + Bug 报告/告警信息 + 监控数据 | Bug 确认单 frontmatter `severity: P0/P1/P2/P3` |
| node_decision | 通道决策 | [[ROLE-ARCH-001]] | 本流程 + [[ROLE-ARCH-001]] + Bug 确认单 + 严重级别定义表 | 决策记录 frontmatter `channel: emergency` 或 `channel: normal` |
| node_quick_fix | 快速修复 | [[ROLE-DEV-002]] 或 [[ROLE-DEV-001]] | 本流程 + [[ROLE-DEV-002]]/[[ROLE-DEV-001]] + [[WT-DEV-002]] + 错误日志 | 修复 PR 创建，修复说明完成 |
| node_simplified_review | 简化审查 | [[ROLE-QA-002]] | 本流程 + [[ROLE-QA-002]] + CHK-代码审查检查清单（简化维度） | PR `review_status: approved` |
| node_regression | 回归验证 | [[ROLE-QA-001]] | 本流程 + [[ROLE-QA-001]] + Bug 复现步骤 + 核心回归用例 | 回归验证报告 `status: passed` |
| node_emergency_deploy | 紧急发布 | [[ROLE-OPS-001]] | 本流程 + [[ROLE-OPS-001]] + [[WT-OPS-001]] + 紧急发布审批 | 紧急发布记录 `status: deployed` |
| node_post_fix | 事后补全 | [[ROLE-DEV-002]] 或 [[ROLE-DEV-001]] | 本流程 + [[ROLE-DEV-002]]/[[ROLE-DEV-001]] + [[PROC-代码审查流程]] | 补充测试 + 文档 + 根因记录产出 |

### 编排时序

```mermaid
graph LR
    A[派发 node_confirm<br/>Agent TL] -->|severity 判定| B[派发 node_decision<br/>Agent TL]
    B -->|emergency| C[派发 node_quick_fix<br/>Agent Dev]
    B -->|normal| N[切换 PROC-需求到上线]
    C -->|修复PR提交| D[派发 node_simplified_review<br/>Agent Reviewer]
    D -->|Approve| E[派发 node_regression<br/>Agent QA]
    D -->|驳回| C
    E -->|passed| F[派发 node_emergency_deploy<br/>Agent DevOps]
    E -->|失败| C
    F -->|deployed| G[派发 node_post_fix<br/>Agent Dev]
    G -->|事后补全完成| H[紧急修复流程结束]
```

### 人类介入点

| 节点 | 介入原因 | 介入方式 |
|------|---------|---------|
| node_confirm | Bug 定级需要业务理解和对用户影响的真实评估 | 人类技术负责人根据监控数据和用户反馈最终定级 |
| node_decision | 紧急通道决策涉及风险权衡，Agent 无法独立决定 | 人类技术负责人评估修复风险后决定是否走紧急通道 |
| node_emergency_deploy | 生产环境发布操作必须人类值守，Agent 辅助检查 | 人类 DevOps 工程师执行发布，Agent 辅助监控和检查清单 |
| node_simplified_review | 紧急修复代码审查需人类快速判断安全性 | 人类代码审核员 30 分钟内完成加速审查 |

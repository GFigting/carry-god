---
type: process
process_id: "PROC-DEV-003"
name: "发布流程"
category: "开发流程"
trigger: "验收通过且发布申请单已审批，技术负责人确认发布窗口"
triggered_by: ["技术负责人", "DevOps工程师"]
estimated_duration: "1-2小时"

# LangGraph 风格定义
graph_type: "sequential"

nodes:
  - node_id: "node_prep"
    role: "[[ROLE-DevOps工程师]]"
    action: "确认发布申请单已审批，检查部署包/镜像版本正确，核对配置变更清单和数据库变更脚本，评估回滚方案可用性"
    input: "发布申请单（已审批）、部署包/镜像标签、配置变更清单、数据库 Migration 脚本"
    output: "发布准备确认单、发布窗口通知"
    checklist: "CHK-上线前检查清单（发布准备部分）"
    timeout: "30分钟"

  - node_id: "node_pre_release"
    role: "[[ROLE-测试工程师]] / [[ROLE-DevOps工程师]]"
    action: "将构建产物部署到预发布环境，执行冒烟测试，验证关键业务流程和接口可用性"
    input: "预发布环境配置、部署包、冒烟测试用例"
    output: "预发布验证报告（通过/失败，含异常信息）"
    checklist: "核心业务流程可用、接口响应正常、环境配置与生产一致"
    timeout: "30分钟"

  - node_id: "node_canary"
    role: "[[ROLE-DevOps工程师]]"
    action: "将新版本部署到生产环境的少量实例（5%-10%），逐步放量观察错误率、延迟、QPS 等核心指标"
    input: "生产环境配置、灰度策略参数、监控大盘"
    output: "灰度发布状态报告、监控指标截图"
    checklist: "错误率无异常波动、延迟无显著恶化、无新增 P0/P1 告警"
    timeout: "30分钟"

  - node_id: "node_full_release"
    role: "[[ROLE-DevOps工程师]]"
    action: "灰度验证通过后，将新版本全量部署到所有生产实例，更新负载均衡/服务注册"
    input: "灰度验证通过的通知、全量发布策略"
    output: "全量部署完成状态、部署日志"
    checklist: "所有实例部署成功、健康检查通过、流量分发正常"
    timeout: "15分钟"

  - node_id: "node_verify"
    role: "[[ROLE-SRE工程师]]"
    action: "发布后核心监控指标持续观测，从错误率、延迟、QPS、业务关键指标等维度确认服务正常"
    input: "Prometheus/Grafana 监控大盘、告警列表、业务指标看板"
    output: "发布验证报告（含监控指标截图和评估结论）"
    checklist: "错误率恢复基线、延迟 P90/P99 正常、关键业务指标无异常"
    timeout: "15分钟"

  - node_id: "node_done"
    role: "[[ROLE-DevOps工程师]]"
    action: "发布记录归档，发送发布通知到团队频道，更新变更日志"
    input: "发布验证报告、发布过程记录"
    output: "发布记录文档、团队通知消息、变更日志更新"
    checklist: "发布记录完整可追溯、通知已发送"
    timeout: "10分钟"

edges:
  - from: "node_prep"
    to: "node_pre_release"
    condition: ""

  - from: "node_pre_release"
    to: "node_canary"
    condition: "预发布验证通过"

  - from: "node_pre_release"
    to: "node_prep"
    condition: "预发布验证失败（回退修复后重新走发布准备）"

  - from: "node_canary"
    to: "node_full_release"
    condition: "灰度期间无新增 P0/P1 告警，核心指标正常"

  - from: "node_canary"
    to: "node_rollback"
    condition: "灰度期间发现异常（错误率飙升、延迟恶化、新增告警）"

  - from: "node_full_release"
    to: "node_verify"
    condition: ""

  - from: "node_verify"
    to: "node_done"
    condition: "观察期（≥15分钟）验证通过，指标稳定"

  - from: "node_verify"
    to: "node_rollback"
    condition: "验证发现异常，需回滚"

tags:
  - type/process
  - process/dev
created: "2026-05-24"
updated: "2026-05-24"
---

# PROC-发布流程

## 流程概述

定义从预发布验证到全量上线的标准化发布步骤。采用灰度发布策略，通过预发布验证 → 灰度放量 → 全量部署的三段式递进，结合实时监控观测，确保变更安全可控。本流程是 [[PROC-需求到上线]] 中 `node_release` 节点的子流程。

## 触发条件

- **触发者**：[[ROLE-技术负责人]] 或 [[ROLE-DevOps工程师]]
- **触发事件**：验收通过，发布申请单已审批，确认发布窗口
- **前置条件**：
  - 发布申请单已获技术负责人审批
  - 部署包/镜像已通过 CI 构建和测试
  - 配置变更清单和数据库 Migration 脚本已就绪
  - 回滚方案已评审通过
  - 当前在允许的发布窗口内

## 流程图

```mermaid
graph TD
    A[node_prep<br/>发布准备] --> B[node_pre_release<br/>预发布验证]
    B -->|通过| C[node_canary<br/>灰度发布]
    B -->|失败| A
    C -->|正常| D[node_full_release<br/>全量发布]
    C -->|异常| R[node_rollback<br/>回滚]
    D --> E[node_verify<br/>发布验证]
    E -->|通过| F[node_done<br/>完成]
    E -->|异常| R
    R --> A
```

## 节点详细说明

| 节点ID | 角色 | 动作 | 输入 | 输出 | 检查清单 | 超时 |
|--------|------|------|------|------|----------|------|
| node_prep | [[ROLE-DevOps工程师]] | 核验发布材料 | 发布申请单、部署包、配置清单 | 发布准备确认单 | CHK-上线前检查清单 | 30min |
| node_pre_release | [[ROLE-测试工程师]] / [[ROLE-DevOps工程师]] | 预发布部署+冒烟测试 | 预发布环境、部署包、冒烟用例 | 预发布验证报告 | 核心流程可用 | 30min |
| node_canary | [[ROLE-DevOps工程师]] | 灰度部署+监控 | 生产环境配置、灰度策略 | 灰度发布状态报告 | 无新增P0/P1告警 | 30min |
| node_full_release | [[ROLE-DevOps工程师]] | 全量部署 | 灰度通过通知、全量策略 | 全量部署完成 | 健康检查通过 | 15min |
| node_verify | [[ROLE-SRE工程师]] | 发布后监控观测 | 监控大盘、告警、业务指标 | 发布验证报告 | 指标恢复基线 | 15min |
| node_done | [[ROLE-DevOps工程师]] | 发布记录归档 | 验证报告、过程记录 | 发布记录、团队通知 | 记录完整可追溯 | 10min |

## 条件边说明

| 来源 | 目标 | 条件 |
|------|------|------|
| node_pre_release | node_canary | 冒烟测试通过，核心业务流程在预发布环境运行正常 |
| node_pre_release | node_prep | 预发布验证失败：部署失败、冒烟测试不通过、环境配置不一致 |
| node_canary | node_full_release | 灰度实例运行正常：错误率无异常波动、延迟无显著恶化、无新增 P0/P1 告警 |
| node_canary | node_rollback | 灰度实例出现异常：错误率飙升（超过基线200%）、新增 P0/P1 告警 |
| node_verify | node_done | 全量发布后 ≥15 分钟核心指标稳定在正常范围 |
| node_verify | node_rollback | 全量发布后核心指标异常，须回滚 |

## 回滚节点说明

`node_rollback` 为辅助节点，负责：
1. 停止灰度/全量发布流程
2. 执行回滚方案（回退到上一个稳定版本）
3. 验证回滚后服务恢复正常
4. 通知相关方（技术负责人、产品经理、开发团队）
5. 记录回滚原因和时间线
6. 回滚完成后回到 `node_prep` 重新评估发布条件

## 异常处理

| 异常场景 | 处理策略 | 升级路径 |
|----------|----------|----------|
| 预发布环境不可用 | 拉 DevOps 排查，调整为直接灰度小比例验证（需技术负责人特批） | DevOps → 技术负责人 |
| 灰度放量过程中发现异常 | 立即停止放量、回滚灰度实例、排查原因 | DevOps → SRE → 技术负责人 |
| 全量发布后指标异常 | 执行完整回滚方案，恢复至上一稳定版本 | DevOps → 技术负责人 |
| 数据库 Migration 失败 | 执行 Migration 回滚脚本，数据恢复至变更前状态 | DevOps → 技术负责人 → DBA |
| 发布窗口超时 | 暂停未完成部分，在下一个发布窗口继续或回滚 | DevOps → 技术负责人 |

## 关联工作类型

- 主要关联：[[WT-部署发布]]
- 父流程：[[PROC-需求到上线]]（本流程作为其 node_release 的子流程）
- 紧急时使用：[[PROC-紧急修复流程]] 中的紧急发布节点

## Agent 编排映射

本流程的每个节点可作为一个独立的 Agent 任务派发。主会话（编排器）负责按边 (Edge) 顺序检测完成信号并推进。

| 节点ID | 节点名称 | Agent 角色 | 上下文包 (required) | 完成信号 |
|--------|---------|-----------|-------------------|---------|
| node_prep | 发布准备 | [[ROLE-OPS-001]] | 本流程 + [[ROLE-OPS-001]] + [[WT-OPS-001]] + CHK-上线前检查清单 + 发布申请单 | 发布准备确认单 frontmatter `status: ready` |
| node_pre_release | 预发布验证 | [[ROLE-QA-001]] | 本流程 + [[ROLE-QA-001]] + CHK-上线前检查清单 + 冒烟测试用例 | 预发布验证报告 `status: passed` |
| node_canary | 灰度发布 | [[ROLE-OPS-001]] | 本流程 + [[ROLE-OPS-001]] + [[WT-OPS-001]] + 灰度策略配置 | 灰度状态报告 `error_rate: normal` |
| node_full_release | 全量发布 | [[ROLE-OPS-001]] | 本流程 + [[ROLE-OPS-001]] + [[WT-OPS-001]] | 部署日志 `status: deployed_all` |
| node_verify | 发布验证 | [[ROLE-OPS-002]] | 本流程 + [[ROLE-OPS-002]] + Prometheus/Grafana 监控配置 | 验证报告 `status: stable` |
| node_done | 发布完成 | [[ROLE-OPS-001]] | 本流程 + 发布过程记录 + 验证报告 | 发布记录 `status: released` |

### 编排时序

```mermaid
graph LR
    A[派发 node_prep<br/>Agent DevOps] -->|ready| B[派发 node_pre_release<br/>Agent QA]
    B -->|passed| C[派发 node_canary<br/>Agent DevOps]
    B -->|failed| A
    C -->|normal| D[派发 node_full_release<br/>Agent DevOps]
    C -->|异常| R[执行回滚<br/>Agent DevOps]
    D -->|deployed_all| E[派发 node_verify<br/>Agent SRE]
    E -->|stable| F[派发 node_done<br/>Agent DevOps]
    E -->|异常| R
    R --> A
```

### 人类介入点

| 节点 | 介入原因 | 介入方式 |
|------|---------|---------|
| node_canary | 生产环境操作风险高，灰度放量决策需人类判断 | 人类 DevOps 工程师在灰度放量时值守，根据监控数据决定放量或回滚 |
| node_full_release | 全量发布是关键操作，需双人复核 | 人类 DevOps 工程师执行全量部署，Agent 辅助监控和检查清单核对 |
| node_verify | 线上指标异常判断需经验和上下文 | 人类 SRE 工程师评估监控数据，确认是否继续或回滚 |

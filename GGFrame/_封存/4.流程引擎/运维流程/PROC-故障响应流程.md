---
type: process
process_id: "PROC-OPS-001"
name: "故障响应流程"
category: "运维流程"
trigger: "监控告警触发或用户/客服报障，生产环境服务出现异常"
triggered_by: ["监控系统", "SRE工程师", "值班工程师"]
estimated_duration: "0.5-8小时"

# LangGraph 风格定义
graph_type: "conditional"

nodes:
  - node_id: "node_discovery"
    role: "[[ROLE-SRE工程师]]"
    action: "接收监控告警或用户报障，快速查看监控大盘和日志，确认故障是否真实存在，初步判断影响范围（哪个服务、哪些用户、功能影响面）"
    input: "告警通知（含告警指标和阈值）、监控大盘、用户反馈/工单"
    output: "故障确认单（含故障现象描述、初步影响范围、触发时间）"
    checklist: "故障是否确认真实存在、影响范围是否基本明确"
    timeout: "5分钟"

  - node_id: "node_triage"
    role: "[[ROLE-SRE工程师]]"
    action: "根据影响范围和业务重要性对故障进行严重级别定级（P0/P1/P2/P3），决定是否启动应急指挥和通知范围"
    input: "故障确认单（含初步影响范围）"
    output: "故障定级单（含严重级别、通知列表、是否启动应急指挥）"
    checklist: "P0：核心业务完全不可用全量用户、P1：核心功能降级或部分用户、P2：非核心功能异常、P3：轻微问题"
    timeout: "10分钟"

  - node_id: "node_emergency_response"
    role: "[[ROLE-SRE工程师]] + [[ROLE-技术负责人]]"
    action: "P0/P1 故障启动应急指挥：技术负责人担任故障指挥官，组建应急小组（SRE+开发+DevOps），建立专用沟通渠道，指定对外发言人"
    input: "故障定级单（P0/P1）"
    output: "应急小组成立通知、专用沟通渠道建立、角色分工确认"
    checklist: "指挥官已指定、沟通渠道已建立、各角色已就位"
    timeout: "15分钟（P0）/ 30分钟（P1）"

  - node_id: "node_mitigation"
    role: "[[ROLE-SRE工程师]] / [[ROLE-DevOps工程师]]"
    action: "执行应急止血操作：服务降级、限流、切换备用节点、重启异常服务、回滚最近变更。核心原则：止损优先，先恢复服务再找根因"
    input: "故障现象、最近变更记录、应急 Runbook"
    output: "应急操作记录（含每步操作的时间、命令、结果）、服务恢复状态"
    checklist: "操作前回滚方案已确认、不可逆操作已双人确认"
    timeout: "30分钟"

  - node_id: "node_restore"
    role: "[[ROLE-SRE工程师]]"
    action: "确认服务已恢复至正常水平，检查核心监控指标（错误率、延迟、QPS）是否回到基线"
    input: "监控大盘、核心业务指标、用户反馈"
    output: "服务恢复确认单（含恢复时间、当前指标截图）"
    checklist: "错误率恢复基线、延迟P90/P99正常、QPS恢复、用户确认可用"
    timeout: "10分钟"

  - node_id: "node_root_cause"
    role: "[[ROLE-后端开发工程师]] / [[ROLE-SRE工程师]]"
    action: "服务恢复后，结合日志、监控、链路追踪和最近变更记录进行根因分析，定位到具体的代码行/配置项/基础设施组件"
    input: "应用/系统日志、分布式追踪数据、最近发布的变更记录、监控指标趋势"
    output: "根因分析记录（含根因定位、5 Whys 分析、完整调用链）"
    checklist: "根因定位到具体模块/代码/配置级别、非表面现象修复"
    timeout: "2小时"

  - node_id: "node_fix"
    role: "[[ROLE-后端开发工程师]] / [[ROLE-DevOps工程师]]"
    action: "实施根本性修复（代码修复、配置修正、基础设施调整），按常规或紧急流程部署修复"
    input: "根因分析记录、相关代码/配置"
    output: "修复代码/配置变更、修复部署记录"
    checklist: "修复针对根因而非表象、修复后回归验证通过"
    timeout: "4小时"

  - node_id: "node_verify"
    role: "[[ROLE-SRE工程师]]"
    action: "修复部署后持续观测 ≥30 分钟，确认核心指标稳定在正常范围，无新增异常，服务完全恢复"
    input: "监控大盘、告警列表、业务指标"
    output: "持续观测报告（含 ≥30 分钟监控趋势图）"
    checklist: "≥30 分钟指标稳定、无新增告警、用户反馈正常"
    timeout: "30分钟"

  - node_id: "node_close"
    role: "[[ROLE-SRE工程师]]"
    action: "关闭故障工单，记录完整时间线和关键操作，更新故障状态为已解决"
    input: "完整故障处理记录（时间线+操作+参与人）"
    output: "故障工单关闭、故障处理总结"
    checklist: "时间线完整、关键操作有记录、参与人明确、影响范围已核定"
    timeout: "15分钟"

  - node_id: "node_retrospective"
    role: "[[ROLE-SRE工程师]] + [[ROLE-技术负责人]]"
    action: "P0/P1 故障必须在 3 个工作日内组织 Blameless 复盘会议，输出故障复盘报告（含时间线、根因、5 Whys、改进 Action Items）。P2 故障可选复盘，P3 故障不要求复盘"
    input: "故障处理记录、根因分析记录、监控数据"
    output: "故障复盘报告（含 Action Items，每项有责任人和截止日期）、错误预算消耗统计"
    checklist: "复盘聚焦流程和系统改进而非追责、Action Items 可追踪"
    timeout: "3个工作日"

edges:
  - from: "node_discovery"
    to: "node_triage"
    condition: "故障确认真实存在"

  - from: "node_discovery"
    to: "__END__"
    condition: "误告警/已自动恢复/非真实故障（关闭工单并标记为误报）"

  - from: "node_triage"
    to: "node_emergency_response"
    condition: "P0 或 P1 级别故障，需启动应急指挥"

  - from: "node_triage"
    to: "node_mitigation"
    condition: "P2 级别故障，常规处理流程，不启动应急指挥"

  - from: "node_emergency_response"
    to: "node_mitigation"
    condition: "应急小组就位后立即执行止血操作"

  - from: "node_mitigation"
    to: "node_restore"
    condition: "止血操作执行完毕，尝试恢复服务"

  - from: "node_restore"
    to: "node_root_cause"
    condition: "服务已恢复至正常水平，开始根因分析"

  - from: "node_restore"
    to: "node_mitigation"
    condition: "服务未恢复，继续或调整止血措施"

  - from: "node_root_cause"
    to: "node_fix"
    condition: "根因已明确，制定修复方案"

  - from: "node_root_cause"
    to: "node_mitigation"
    condition: "根因分析发现止血方案不完整（需同时改进止血策略）"

  - from: "node_fix"
    to: "node_verify"
    condition: "修复已部署"

  - from: "node_verify"
    to: "node_close"
    condition: "≥30 分钟持续观测，指标稳定，故障可关闭"

  - from: "node_verify"
    to: "node_mitigation"
    condition: "指标仍有异常或有复发迹象，须重新评估止血方案"

  - from: "node_close"
    to: "node_retrospective"
    condition: "P0/P1 故障：强制复盘；P2 故障：建议复盘；P3 故障：标记不要求复盘"

  - from: "node_close"
    to: "__END__"
    condition: "P3 故障或不要求复盘的 P2 故障"

tags:
  - type/process
  - process/ops
created: "2026-05-24"
updated: "2026-05-24"
---

# PROC-故障响应流程

## 流程概述

定义从监控告警触发到故障关闭和复盘的完整应急响应流程。核心原则：**止损优先于根因定位**（先恢复服务再找根因）、**Blameless 复盘**（聚焦系统改进而非追究责任）。本流程根据故障严重级别（P0-P3）提供差异化响应路径，P0/P1 故障走应急指挥通道，P2 常规处理，P3 轻量关闭。

## 触发条件

- **触发者**：[[ROLE-SRE工程师]]、值班工程师或监控系统自动触发
- **触发事件**：
  - 监控告警触发（Prometheus Alertmanager / PagerDuty）
  - 用户/客服报障工单
  - 自动化巡检发现异常
- **前置条件**：
  - 监控告警体系已配置并正常运行
  - 值班工程师轮值表已排定
  - 故障 Runbook 已维护

## 故障严重级别定义

| 级别 | 判定标准 | 响应SLA | 是否启动应急指挥 | 是否要求复盘 |
|------|----------|---------|-----------------|-------------|
| P0 | 核心业务完全不可用，全量用户受影响 | 5分钟响应、15分钟组建小组 | 是，强制启动 | 是，3个工作日内 |
| P1 | 核心功能降级，部分用户受影响（>10%） | 15分钟响应、30分钟组建小组 | 是，评估后启动 | 是，5个工作日内 |
| P2 | 非核心功能异常，少量用户受影响（<10%） | 30分钟响应 | 否 | 建议复盘 |
| P3 | 轻微问题或体验瑕疵，基本不影响使用 | 2小时响应 | 否 | 不要求 |

## 流程图

```mermaid
graph TD
    A[node_discovery<br/>故障发现] -->|确认真实| B[node_triage<br/>故障定级]
    A -->|误告警/已恢复| END1[关闭-误报]
    B -->|P0/P1| C[node_emergency_response<br/>应急响应]
    B -->|P2| D[node_mitigation<br/>应急止血]
    C --> D
    D --> E[node_restore<br/>服务恢复]
    E -->|已恢复| F[node_root_cause<br/>根因定位]
    E -->|未恢复| D
    F -->|根因明确| G[node_fix<br/>修复实施]
    F -->|止血不全| D
    G --> H[node_verify<br/>持续观测]
    H -->|指标稳定| I[node_close<br/>故障关闭]
    H -->|仍有异常| D
    I -->|P0/P1| J[node_retrospective<br/>故障复盘]
    I -->|P3| END2[结束]
    J --> END3[完成]
```

## 节点详细说明

| 节点ID | 角色 | 动作 | 输入 | 输出 | 检查清单 | 超时 |
|--------|------|------|------|------|----------|------|
| node_discovery | [[ROLE-SRE工程师]] | 故障确认 | 告警通知、监控大盘、用户反馈 | 故障确认单 | 确认真实性 | 5min |
| node_triage | [[ROLE-SRE工程师]] | 故障定级 | 故障确认单 | 故障定级单 | P0/P1/P2/P3 | 10min |
| node_emergency_response | [[ROLE-SRE工程师]] + [[ROLE-技术负责人]] | 启动应急指挥 | 故障定级单(P0/P1) | 应急小组+沟通渠道 | 指挥官+渠道就位 | 15-30min |
| node_mitigation | [[ROLE-SRE工程师]] / [[ROLE-DevOps工程师]] | 应急止血 | 故障现象、变更记录、Runbook | 应急操作记录 | 回滚方案已确认 | 30min |
| node_restore | [[ROLE-SRE工程师]] | 服务恢复确认 | 监控大盘、业务指标 | 恢复确认单 | 指标回基线 | 10min |
| node_root_cause | [[ROLE-后端开发工程师]] / [[ROLE-SRE工程师]] | 根因分析 | 日志、链路追踪、变更记录 | 根因分析记录(含5Whys) | 定位到具体模块/代码 | 2h |
| node_fix | [[ROLE-后端开发工程师]] / [[ROLE-DevOps工程师]] | 修复实施 | 根因分析、代码/配置 | 修复代码+部署记录 | 根因修复+回归通过 | 4h |
| node_verify | [[ROLE-SRE工程师]] | 持续观测 | 监控大盘、告警、指标 | 观测报告(≥30min) | 指标持续稳定 | 30min |
| node_close | [[ROLE-SRE工程师]] | 故障关闭 | 完整时间线+操作记录 | 故障工单关闭 | 记录完整 | 15min |
| node_retrospective | [[ROLE-SRE工程师]] + [[ROLE-技术负责人]] | 故障复盘 | 故障记录、根因分析 | 复盘报告+Action Items | Blameless 聚焦改进 | 3-5工作日 |

## 条件边说明

| 来源 | 目标 | 条件 |
|------|------|------|
| node_discovery | node_triage | 故障确认真实存在，非误告警或已自动恢复 |
| node_discovery | __END__ | 误告警（指标波动但业务正常）或故障已自动恢复 |
| node_triage | node_emergency_response | P0（强制）或 P1（评估后）——核心业务受损需应急指挥 |
| node_triage | node_mitigation | P2 故障，不启动应急指挥，直接执行止血 |
| node_restore | node_root_cause | 服务已确认恢复：错误率、延迟、QPS 均回基线 |
| node_restore | node_mitigation | 服务未恢复或仅部分恢复，继续调整止血策略 |
| node_root_cause | node_fix | 根因已定位到可修复的级别（代码/配置/组件） |
| node_root_cause | node_mitigation | 根因分析发现止血方案不完整，需先完善止血 |
| node_verify | node_close | ≥30 分钟持续观测，核心指标稳定在基线范围内 |
| node_verify | node_mitigation | 修复后仍有异常波动或复发迹象 |
| node_close | node_retrospective | P0/P1 强制复盘（P2 建议复盘） |
| node_close | __END__ | P3 故障或经评估不需要复盘的 P2 故障 |

## 应急指挥角色说明

P0/P1 故障启动应急指挥后，各角色分工如下：

| 角色 | 职责 | 担任者 |
|------|------|--------|
| 故障指挥官 (Incident Commander) | 统一指挥、关键决策、对外沟通、指定发言人 | [[ROLE-技术负责人]] |
| 运维执行 (Operations Lead) | 执行止血操作、监控指标、操作记录 | [[ROLE-SRE工程师]] 或 [[ROLE-DevOps工程师]] |
| 技术排查 (Subject Matter Expert) | 深度排查根因、提供修复方案 | [[ROLE-后端开发工程师]] 或相关模块负责人 |
| 对外发言人 (Communications Lead) | 统一对外发通告、同步进展给管理层和业务方 | 由故障指挥官指定 |

## 异常处理

| 异常场景 | 处理策略 | 升级路径 |
|----------|----------|----------|
| 多个故障同时发生 | 按 P0 > P1 > P2 优先级排定处理顺序，必要时启动多个应急小组 | SRE → 技术总监 |
| 止血操作导致二次故障 | 立即停止当前操作，评估回滚，记录二次故障时间线 | SRE → 技术负责人 |
| 根因超过 2 小时无法定位 | 以临时止血方案维持服务，根因分析转入事后排查，不阻塞服务恢复 | 技术负责人 → 系统架构师 |
| 应急期间通信混乱 | 故障指挥官重申唯一发言人制度，关停非专用渠道的讨论 | 故障指挥官 |
| 修复涉及数据修正 | 数据修复操作须在测试环境验证、备份确认后方可执行，不可逆操作双人确认 | DevOps → DBA |

## 关联工作类型

- 主要关联：[[WT-故障响应]]
- 修复阶段可引用的流程：
  - [[PROC-紧急修复流程]]（故障引发的 Bug 修复走紧急通道）
  - [[PROC-发布流程]]（修复后的常规发布）
- 关联文档：CHK-故障响应检查清单、常见故障 Runbook

## Agent 编排映射

本流程的每个节点可作为一个独立的 Agent 任务派发。P0/P1 故障对时效性要求极高，Agent 任务超时设置应严格。

| 节点ID | 节点名称 | Agent 角色 | 上下文包 (required) | 完成信号 |
|--------|---------|-----------|-------------------|---------|
| node_discovery | 故障发现 | [[ROLE-OPS-002]] | 本流程 + [[ROLE-OPS-002]] + [[WT-INC-001]] + 告警通知 + 监控大盘 | 故障确认单 frontmatter `confirmed: true` |
| node_triage | 故障定级 | [[ROLE-OPS-002]] | 本流程 + [[ROLE-OPS-002]] + 故障确认单 + 严重级别定义表 | 故障定级单 frontmatter `severity: P0/P1/P2/P3` |
| node_emergency_response | 应急响应 | [[ROLE-OPS-002]] + [[ROLE-ARCH-001]] | 本流程 + [[ROLE-OPS-002]] + [[ROLE-ARCH-001]] + 故障定级单(P0/P1) | 应急小组通知已发送、沟通渠道已建立 |
| node_mitigation | 应急止血 | [[ROLE-OPS-002]] 或 [[ROLE-OPS-001]] | 本流程 + [[ROLE-OPS-002]]/[[ROLE-OPS-001]] + 故障 Runbook + 最近变更记录 | 应急操作记录（含时间线和操作结果） |
| node_restore | 服务恢复 | [[ROLE-OPS-002]] | 本流程 + [[ROLE-OPS-002]] + 监控大盘 + 核心指标基线 | 恢复确认单 `status: restored` |
| node_root_cause | 根因定位 | [[ROLE-DEV-002]] 或 [[ROLE-OPS-002]] | 本流程 + 对应角色定义 + 日志/链路追踪 + 最近变更记录 | 根因分析记录（含 5 Whys） |
| node_fix | 修复实施 | [[ROLE-DEV-002]] 或 [[ROLE-OPS-001]] | 本流程 + [[ROLE-DEV-002]]/[[ROLE-OPS-001]] + [[PROC-紧急修复流程]](如需) + 根因分析 | 修复代码/配置已部署，回归验证通过 |
| node_verify | 持续观测 | [[ROLE-OPS-002]] | 本流程 + [[ROLE-OPS-002]] + 监控大盘 | 观测报告 `status: stable_30min` |
| node_close | 故障关闭 | [[ROLE-OPS-002]] | 本流程 + 完整时间线 + 关键操作记录 | 故障工单 `status: resolved` |
| node_retrospective | 故障复盘 | [[ROLE-OPS-002]] + [[ROLE-ARCH-001]] | 本流程 + [[ROLE-OPS-002]] + [[ROLE-ARCH-001]] + 故障处理记录 + 根因分析 | 复盘报告（含 Action Items，每项有责任人+截止日期） |

### 编排时序

```mermaid
graph LR
    A[派发 node_discovery<br/>Agent SRE] -->|confirmed true| B[派发 node_triage<br/>Agent SRE]
    B -->|P0/P1| C[派发 node_emergency_response<br/>Agent SRE+TL]
    B -->|P2| D[派发 node_mitigation<br/>Agent SRE/DevOps]
    C -->|应急小组就位| D
    D -->|止血操作完成| E[派发 node_restore<br/>Agent SRE]
    E -->|restored| F[派发 node_root_cause<br/>Agent Dev/SRE]
    E -->|未恢复| D
    F -->|根因明确| G[派发 node_fix<br/>Agent Dev/DevOps]
    F -->|止血不全| D
    G -->|修复部署| H[派发 node_verify<br/>Agent SRE]
    H -->|stable_30min| I[派发 node_close<br/>Agent SRE]
    H -->|仍有异常| D
    I -->|P0/P1| J[派发 node_retrospective<br/>Agent SRE+TL]
    I -->|P3| K[流程结束]
```

### 人类介入点

| 节点 | 介入原因 | 介入方式 |
|------|---------|---------|
| node_triage | 故障定级需要根据业务上下文判断真实影响面 | 人类 SRE 工程师根据监控和用户反馈最终定级 |
| node_emergency_response | 应急指挥需要人类领导力和即时决策能力 | 人类技术负责人担任故障指挥官，Agent 辅助信息整理和沟通模板 |
| node_mitigation | 生产环境应急操作风险极高，需经验和判断 | 人类 SRE/DevOps 工程师执行止血操作，Agent 辅助 Runbook 检索和操作建议 |
| node_retrospective | 复盘需要多方协作和建设性讨论，Agent 无法替代 | 人类 SRE 主持复盘会议，Agent 辅助时间线整理和 Action Items 追踪 |

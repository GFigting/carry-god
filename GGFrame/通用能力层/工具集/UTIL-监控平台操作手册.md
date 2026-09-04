---
type: tool-manual
tool_id: "UTIL-004"
tool_name: "监控平台操作手册"
category: "可观测性"

tags:
  - type/tool-manual
  - tool/prometheus
  - tool/grafana
  - tool/loki
created: "2026-05-24"
updated: "2026-05-24"
---

# 监控平台操作手册

覆盖 Prometheus（指标采集）、Grafana（可视化面板）、Loki（日志查询）三件套的常见操作。

## 常用命令

### Prometheus 基础

| 场景 | 说明 |
|------|------|
| Prometheus 默认端口 | `9090` |
| 配置文件路径（典型） | `/etc/prometheus/prometheus.yml` |
| 查看 Targets 状态 | Web UI `http://<prometheus>:9090/targets` |
| 查看告警规则 | Web UI `http://<prometheus>:9090/rules` |
| 查看当前活跃告警 | Web UI `http://<prometheus>:9090/alerts` |
| 查看服务发现状态 | Web UI `http://<prometheus>:9090/service-discovery` |
| 查询页面 | Web UI `http://<prometheus>:9090/graph` |
| 状态信息 | Web UI `http://<prometheus>:9090/status`（含运行时、配置、TSDB 信息） |
| 手动重载配置 | `kill -HUP <prometheus-pid>` 或 `curl -X POST http://<prometheus>:9090/-/reload` |
| 检查配置是否合法 | `promtool check config /etc/prometheus/prometheus.yml` |

### PromQL 查询示例

PromQL 是 Prometheus 的查询语言，用于从时间序列数据库中检索和聚合指标数据。

#### 基础查询

| 场景 | PromQL | 说明 |
|------|--------|------|
| 查询即时值 | `http_requests_total` | 返回所有该指标的最新值 |
| 按标签过滤 | `http_requests_total{method="GET", status="200"}` | 等值匹配过滤 |
| 标签正则匹配 | `http_requests_total{method=~"GET\|POST"}` | 正则匹配（`=~` 匹配，`!~` 不匹配） |
| 查询过去 5 分钟数据 | `http_requests_total[5m]` | 返回时间范围内的所有样本点 |

#### 常用函数

| 场景 | PromQL | 说明 |
|------|--------|------|
| 计算增长率 | `rate(http_requests_total[5m])` | 每秒请求增长率，适合 Counter 类型 |
| 计算 QPS | `sum(rate(http_requests_total[5m]))` | 聚合所有实例的总 QPS |
| 按状态码分组 QPS | `sum by (status) (rate(http_requests_total[5m]))` | 按 status 标签分组统计 |
| 计算平均响应时间 | `rate(http_request_duration_seconds_sum[5m]) / rate(http_request_duration_seconds_count[5m])` | 过去 5 分钟平均延迟 |
| P99 延迟 | `histogram_quantile(0.99, rate(http_request_duration_seconds_bucket[5m]))` | 基于 Histogram 计算 99 分位延迟 |
| P50 / P90 / P95 | `histogram_quantile(0.50, ...)` / `0.90` / `0.95` | 不同分位值的延迟 |
| CPU 使用率 | `(1 - avg(rate(node_cpu_seconds_total{mode="idle"}[5m])) by (instance)) * 100` | 节点 CPU 使用百分比 |
| 内存使用率 | `(1 - (node_memory_MemAvailable_bytes / node_memory_MemTotal_bytes)) * 100` | 节点内存使用百分比 |
| 磁盘使用率 | `(node_filesystem_size_bytes{fstype!=""} - node_filesystem_free_bytes{fstype!=""}) / node_filesystem_size_bytes{fstype!=""} * 100` | 磁盘已用百分比 |
| Pod CPU 使用 | `sum(rate(container_cpu_usage_seconds_total{namespace="production"}[5m])) by (pod)` | 按 Pod 统计 CPU |
| Pod 内存使用 | `sum(container_memory_working_set_bytes{namespace="production"}) by (pod)` | 按 Pod 统计内存 |
| 容器重启次数 | `rate(kube_pod_container_status_restarts_total{namespace="production"}[15m]) > 0` | 过去 15 分钟有重启的 Pod |
| 用 predict_linear 预测磁盘满 | `predict_linear(node_filesystem_free_bytes{mountpoint="/"}[1h], 24*3600) < 0` | 预测 24 小时后磁盘是否满 |

#### 常用聚合操作

| 操作 | 示例 | 说明 |
|------|------|------|
| sum | `sum(rate(...[5m]))` | 求和 |
| avg | `avg(node_cpu_seconds_total)` | 平均值 |
| max / min | `max(http_request_duration_seconds)` | 最大/最小值 |
| count | `count(up == 0)` | 统计失败实例数 |
| topk / bottomk | `topk(5, rate(http_requests_total[5m]))` | 取前 5 / 后 5 |
| quantile | `quantile(0.95, http_request_duration_seconds)` | 分位数 |
| increase | `increase(http_requests_total[1h])` | 时间段内的增量，适合 Counter |
| changes | `changes(deploy_version[1h]) > 0` | 值变化的次数，检测配置变更 |

#### 诊断查询

| 场景 | PromQL | 说明 |
|------|--------|------|
| 服务是否存活 | `up{job="myapp"}` | 1 = 存活，0 = 挂了 |
| 5 分钟内错误率 > 5% 的服务 | `sum(rate(http_requests_total{status=~"5.."}[5m])) by (service) / sum(rate(http_requests_total[5m])) by (service) > 0.05` | 错误率异常检测 |
| JVM 堆内存使用率 | `jvm_memory_used_bytes{area="heap"} / jvm_memory_max_bytes{area="heap"} * 100` | JVM 应用内存监控 |
| 数据库连接池活跃连接 | `hikaricp_connections_active` | 连接池健康检查 |
| 消息队列积压 | `kafka_consumergroup_lag` | Kafka 消费延迟 |
| Pod 重启趋势 | `changes(kube_pod_container_status_restarts_total[1h])` | 检测频繁重启 |

### Alertmanager 告警规则配置

#### Prometheus 告警规则文件示例 (rules.yml)

```yaml
groups:
  - name: application-alerts
    interval: 30s
    rules:
      # 实例宕机
      - alert: InstanceDown
        expr: up{job="myapp"} == 0
        for: 2m
        labels:
          severity: critical
          team: backend
        annotations:
          summary: "实例 {{ $labels.instance }} 宕机"
          description: "服务 {{ $labels.job }} 在 {{ $labels.instance }} 上的实例已超过 2 分钟不可达"
          runbook_url: "https://wiki.example.com/runbooks/instance-down"

      # 高错误率
      - alert: HighErrorRate
        expr: |
          sum(rate(http_requests_total{status=~"5.."}[5m])) by (service)
          / sum(rate(http_requests_total[5m])) by (service) > 0.05
        for: 5m
        labels:
          severity: warning
          team: backend
        annotations:
          summary: "{{ $labels.service }} 5xx 错误率超过 5%"
          description: "当前错误率: {{ $value | humanizePercentage }}，阈值: 5%"

      # CPU 高负载
      - alert: HighCPUUsage
        expr: |
          (1 - avg(rate(node_cpu_seconds_total{mode="idle"}[5m])) by (instance)) * 100 > 85
        for: 10m
        labels:
          severity: warning
          team: infra
        annotations:
          summary: "节点 {{ $labels.instance }} CPU 使用率 > 85%"
          description: "持续超过 10 分钟，当前值: {{ $value | printf \"%.1f\" }}%"

      # 内存不足
      - alert: HighMemoryUsage
        expr: |
          (1 - node_memory_MemAvailable_bytes / node_memory_MemTotal_bytes) * 100 > 90
        for: 5m
        labels:
          severity: critical
          team: infra
        annotations:
          summary: "节点 {{ $labels.instance }} 内存使用率 > 90%"
          description: "可用内存: {{ $value | printf \"%.1f\" }}%"

      # 磁盘空间预测告警
      - alert: DiskWillFillIn24Hours
        expr: |
          predict_linear(node_filesystem_free_bytes{mountpoint="/"}[2h], 24*3600) < 0
        for: 1m
        labels:
          severity: warning
          team: infra
        annotations:
          summary: "磁盘 / 预计 24 小时内满（节点: {{ $labels.instance }}）"

      # Pod 频繁重启
      - alert: PodCrashLooping
        expr: |
          rate(kube_pod_container_status_restarts_total[15m]) > 0
        for: 5m
        labels:
          severity: warning
          team: backend
        annotations:
          summary: "Pod {{ $labels.namespace }}/{{ $labels.pod }} 正在 CrashLoopBackOff"
          description: "容器 {{ $labels.container }} 在过去 15 分钟内重启"

      # 证书即将过期
      - alert: CertExpiringSoon
        expr: |
          probe_ssl_earliest_cert_expiry - time() < 86400 * 15
        for: 1m
        labels:
          severity: warning
          team: infra
        annotations:
          summary: "域名 {{ $labels.instance }} TLS 证书将在 15 天内过期"

      # 无数据告警（静默故障）
      - alert: NoData
        expr: absent(up{job="myapp"})
        for: 5m
        labels:
          severity: critical
          team: backend
        annotations:
          summary: "myapp 服务的 up 指标消失，可能 exporter 或服务发现故障"
```

#### Alertmanager 配置示例 (alertmanager.yml)

```yaml
global:
  resolve_timeout: 5m
  slack_api_url: "https://hooks.slack.com/services/xxx"

route:
  receiver: "default"
  group_by: ["alertname", "severity"]
  group_wait: 10s
  group_interval: 30s
  repeat_interval: 4h

  routes:
    - match:
        severity: critical
      receiver: "oncall"
      continue: true
    - match:
        team: infra
      receiver: "infra-team"

receivers:
  - name: "default"
    slack_configs:
      - channel: "#monitoring"
        title: "[{{ .Status | toUpper }}] {{ .CommonLabels.alertname }}"
        text: "{{ range .Alerts }}{{ .Annotations.description }}\n{{ end }}"

  - name: "oncall"
    slack_configs:
      - channel: "#oncall"
        title: "[CRITICAL] {{ .CommonLabels.alertname }}"
        text: "{{ range .Alerts }}*概要*: {{ .Annotations.summary }}\n*详情*: {{ .Annotations.description }}\n*Runbook*: {{ .Annotations.runbook_url }}\n{{ end }}"
    webhook_configs:
      - url: "https://pagerduty.example.com/webhook"

  - name: "infra-team"
    slack_configs:
      - channel: "#infra"
```

### Grafana 面板操作

| 场景 | 操作 | 说明 |
|------|------|------|
| 访问 Grafana | `http://<grafana>:3000` | 默认端口 3000，默认账号 admin/admin |
| 添加数据源 | 左侧菜单 -> Connections -> Data sources -> Add data source -> Prometheus | 填入 Prometheus Server URL（如 `http://prometheus:9090`） |
| 导入 Dashboard | 左侧菜单 -> Dashboards -> New -> Import | 输入 Dashboard ID 或粘贴 JSON |
| 新建 Dashboard | 左侧菜单 -> Dashboards -> New -> New Dashboard | 创建空面板开始构建 |
| 添加 Panel | Dashboard 页面 -> Add -> Visualization | 选择图表类型（Time series / Stat / Gauge / Table / Bar chart） |
| 编辑查询 | Panel 编辑 -> Query 标签页 | 输入 PromQL 查询语句 |
| 设置变量 | Dashboard Settings -> Variables -> Add variable | 创建动态变量（如 namespace、pod、instance）用于下拉切换 |
| 告警规则 | Panel 编辑 -> Alert -> Create alert rule | 配置 Grafana 内置告警（Grafana 8+） |
| 查看告警 | 左侧菜单 -> Alerting -> Alert rules | 查看和管理告警规则 |
| 导出 Dashboard JSON | Dashboard Settings -> JSON Model | 复制 JSON 用于版本控制和分享 |
| Panel 时间范围覆盖 | Panel 编辑 -> Time override | 独立覆盖该 Panel 的时间范围 |
| 设置刷新间隔 | Dashboard 右上角下拉 | 设置自动刷新（5s / 10s / 30s / 1m ...） |
| 添加 Annotation | Dashboard Settings -> Annotations -> Add annotation query | 将 K8s Events、部署事件等叠加到图表上 |

#### Grafana 常用 Panel 示例场景

| 场景 | 图表类型 | 查询示例 |
|------|----------|---------|
| 服务 QPS 趋势 | Time series | `sum(rate(http_requests_total{service="myapp"}[5m]))` |
| 接口延迟分位线 | Time series (多系列) | P50/P90/P99 三条分位线叠加对比 |
| 错误率 | Time series (带阈值线） | 配合 5% 阈值线 + 颜色标识 |
| 服务健康总览 | Stat | `up{job="myapp"}` 显示 1/0 |
| 当前内存使用 | Gauge | `sum(container_memory_working_set_bytes{namespace="production"}) by (pod)` |
| 最近错误日志数 | Stat | `sum(rate(logback_events_total{level="error"}[5m]))` |
| Pod 列表与状态 | Table | `kube_pod_status_phase` 按命名空间分组显示 |
| 节点资源热力图 | Heatmap | 按节点展示 CPU/内存使用分布 |
| 部署版本时间线 | State timeline | 展示服务版本随时间变化的滚动更新过程 |
| 请求 Top 10 接口 | Bar chart 横向 | `topk(10, sum(rate(http_requests_total[5m])) by (path))` |

#### Grafana 变量配置示例

```json
// 命名空间变量
Name: namespace
Type: Query
Query: label_values(kube_namespace_created, namespace)

// Pod 变量（级联过滤）
Name: pod
Type: Query
Query: label_values(kube_pod_info{namespace="$namespace"}, pod)

// 服务变量
Name: service
Type: Query
Query: label_values(http_requests_total, service)

// 环境变量（自定义值）
Name: environment
Type: Custom
Values: production, staging, development
```

### Loki 日志查询

Loki 是 Grafana 生态的日志聚合系统，使用 LogQL 查询语言，与 PromQL 风格高度一致。

| 场景 | LogQL / 操作 | 说明 |
|------|-------------|------|
| 查看所有日志 | `{job="myapp"}` | 基本日志流查询 |
| 按命名空间过滤 | `{namespace="production"}` | 过滤 K8s 命名空间日志 |
| 按 Pod 过滤 | `{namespace="production", pod=~"myapp-.*"}` | 正则匹配 Pod 名称 |
| 包含关键词 | `{job="myapp"} \|= "ERROR"` | 包含 ERROR 的日志行 |
| 不包含关键词 | `{job="myapp"} != "DEBUG"` | 排除 DEBUG 日志 |
| 正则过滤 | `{job="myapp"} \|~ "status=[45][0-9]{2}"` | 正则匹配 4xx 或 5xx 状态码 |
| 排除正则 | `{job="myapp"} !~ "healthcheck"` | 排除健康检查日志 |
| 统计日志行数 | `count_over_time({job="myapp"} \|= "ERROR" [5m])` | 过去 5 分钟 ERROR 日志数量 |
| 按级别统计 | `sum by (level) (count_over_time({job="myapp"} \| json [5m]))` | 按日志级别分组统计（需 json 解析） |
| 解析 JSON 日志 | `{job="myapp"} \| json \| status = "500"` | 解析 JSON 后按字段过滤 |
| 解析并提取字段 | `{job="myapp"} \| json \| line_format "{{.method}} {{.path}} {{.status}}"` | 提取字段并重新格式化输出 |
| 统计请求 Top 路径 | `topk(10, sum by (path) (count_over_time({job="myapp"} \| json [5m])))` | 请求量最高的 10 个接口路径 |
| 日志速率变化 | `rate({job="myapp"}[5m])` | 日志产生速率，用于异常检测 |
| 特定时间范围查询 | 在 Grafana Explore 界面选择时间范围 | 配合时间选择器精确回溯 |
| 多日志流合并 | `{job="myapp"} or {job="nginx"}` | 同时查看多个日志源 |
| Labels 快速定位 | 在 Grafana Explore -> 点击 "Log labels" | 浏览已有的标签键值，快速构建查询 |

#### Loki 常用排查场景

| 故障场景 | LogQL | 用途 |
|----------|-------|------|
| 查找特定错误ID | `{job="myapp"} \|= "trace_id=abc123"` | 根据 trace ID 捞全链路日志 |
| 查找慢请求 | `{job="myapp"} \| json \| duration > 3s` | 找出响应时间 > 3 秒的请求（需日志中包含 duration 字段） |
| 登录失败 | `{job="myapp"} \| json \| path="/api/login" \| status="401"` | 查找登录接口的认证失败 |
| 空指针异常 | `{job="myapp"} \|= "NullPointerException"` | 查找 NPE 堆栈 |
| OutOfMemory | `{job="myapp"} \|= "OutOfMemoryError"` | 查找 OOM 错误 |
| 数据库超时 | `{job="myapp"} \|= "SQLTimeoutException" or "connection timeout"` | 查找数据库连接超时日志 |
| 服务间调用失败 | `{job="myapp"} \| json \| upstream_status=~"5.."` | 查找上游服务返回 5xx 的日志 |

## 最佳实践

### Prometheus 最佳实践

1. **指标命名规范**：遵循 `namespace_subsystem_name_unit` 格式，如 `http_requests_total`、`node_memory_used_bytes`
2. **合理设置抓取间隔**：一般服务 15-30s，关键服务 5-10s，批量任务 60s+
3. **标签设计**：避免高基数标签（如 user_id、request_id），防止时间序列爆炸
4. **Counter 用 rate() 而非直接值**：Counter 只增不减，直接用值无意义，必须用 `rate()` 或 `increase()`
5. **Histogram 优于 Summary**：Histogram 可以在服务端按任意分位数聚合，Summary 只能在客户端计算
6. **告警规则添加 runbook_url**：每条告警关联对应的处理手册链接，加速响应
7. **使用 recording rules 预计算**：将高频使用的复杂查询预先计算，提高 Dashboard 加载速度

### Grafana 最佳实践

1. **Dashboard 版控**：将 Dashboard JSON 提交到 Git 仓库，通过 Grafana Provisioning 或 CI 自动部署
2. **变量化 Dashboard**：用 Grafana 变量让一个 Dashboard 适配多环境/多服务，避免重复创建
3. **注释关键事件**：部署、配置变更、故障事件通过 Annotation 标记在时间线上
4. **色彩语义化**：绿色=正常、黄色=警告、红色=危险，保持一致
5. **合理选择图表**：趋势用折线、占比用饼图/柱状图、状态用 Stat/Gauge、明细用 Table

### Loki 最佳实践

1. **日志结构化**：应用输出 JSON 格式日志，方便 LogQL 按字段解析和过滤
2. **合理标签策略**：标签用于高频过滤（如 namespace、app、environment），内容过滤用查询时的 `|=` 和 `|~`
3. **低基数标签**：Loki 标签索引比 Prometheus 更受限，不要用 trace_id、user_id 做标签
4. **日志保留策略**：根据法规和存储成本设置合理的日志保留期（如 7-30 天）
5. **与 Trace 关联**：日志中注入 trace_id，通过 Grafana 实现 Metrics -> Logs -> Traces 三关联

### 告警分级与处理时效

| 级别 | 标签 | 响应时效 | 通知方式 | 示例 |
|------|------|---------|---------|------|
| critical | `severity: critical` | 5 分钟内 | PagerDuty + 电话 + Slack @channel | 服务宕机、数据库不可用、内存/磁盘即将耗尽 |
| warning | `severity: warning` | 30 分钟内 | Slack 频道 + 工单 | 错误率升高、CPU/内存偏高、证书即将过期 |
| info | `severity: info` | 工作日处理 | Slack 频道 | 配置变更、新实例注册、非关键指标波动 |

## Agent 使用提示

<!-- Agent 在调用该工具时应遵循的规范 -->

### 安全边界

| 操作类型 | 自动执行 | 需确认 | 说明 |
|----------|----------|--------|------|
| PromQL 查询（数据检索） | 是 | | 只读查询，但在生产环境大量数据可能影响 Prometheus 性能 |
| Grafana Dashboard 查看 | 是 | | 只读浏览面板 |
| Loki 日志查询 | 是 | | 只读查询，注意大时间范围可能产生大量数据传输 |
| 创建/修改 Dashboard | | 是 | UI 操作，可能覆盖已有配置 |
| 修改告警规则 | | **需要审批** | 直接影响监控灵敏度，误改可能漏报或产生告警风暴 |
| 修改 Alertmanager 配置 | | **需要审批** | 变更通知路由，可能导致告警无法触达 |
| 静默告警 (Silence) | | 是 | 临时静默需明确过期时间，记录原因 |
| 重载 Prometheus 配置 | | **警告** | 配置错误可能导致指标断流或告警失效 |
| 删除 Dashboard / Panel | | 是 | 需确认影响范围 |
| 清理 TSDB / Loki 数据 | | **禁止** | 清理监控历史数据不可逆，Agent 绝不能自动执行 |
| 修改数据源配置 | | **警告** | 修改错误可导致所有关联 Dashboard 失效 |
| 批量导出 Dashboard JSON | 是 | | 只读导出，可用于版本控制 |

### 建议的权限模式

- **只读查询（可自动）**：PromQL 数据查询、Grafana Dashboard 查看、Loki 日志检索、导出 Dashboard JSON
- **面板编辑（需确认）**：创建/修改 Panel、调整 Dashboard 布局、修改变量
- **告警配置（需审批）**：创建/修改告警规则、修改阈值、调整评估频率
- **配置变更（需运维审批）**：重载 Prometheus、修改 Alertmanager 路由、修改数据源
- **数据清理（用户必须手动执行）**：TSDB 数据压缩/清理、Loki 日志删除

### Agent 行为规范

1. Agent 不应主动在生产环境的 Grafana/Prometheus 上进行配置修改
2. 辅助编写 PromQL 时，应解释 `rate()` 与 `irate()` 的区别、Counter 与 Gauge 的使用场景
3. 推荐告警规则时，应包含 `for` 持续时间（避免瞬时抖动告警）和合理的阈值
4. 日志查询中如发现敏感信息（密码、token、身份证号等），Agent 应提醒用户注意日志脱敏
5. 辅助分析故障时，Agent 应先查指标（PromQL）再查日志（Loki），形成从宏观到微观的排查路径
6. 建议的排查链路：Grafana Dashboard 概览 -> 可疑指标深入 -> PromQL 切片分析 -> Loki 捞具体日志 -> 关联 Trace
7. 不得以 Agent 身份通过 API 删除告警规则、静默告警（除非用户明确要求并指定过期时间）

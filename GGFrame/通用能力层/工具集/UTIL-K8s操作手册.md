---
type: tool-manual
tool_id: "UTIL-003"
tool_name: "Kubernetes操作手册"
category: "容器编排"

tags:
  - type/tool-manual
  - tool/kubernetes
created: "2026-05-24"
updated: "2026-05-24"
---

# Kubernetes 操作手册

## 常用命令

### 集群与节点

| 场景 | 命令 | 说明 |
|------|------|------|
| 查看集群信息 | `kubectl cluster-info` | 查看集群的 control plane 和核心服务地址 |
| 查看节点列表 | `kubectl get nodes` | 列出所有节点及其状态 |
| 查看节点详情 | `kubectl describe node <node-name>` | 查看节点的资源、标签、条件和事件 |
| 查看节点资源使用 | `kubectl top node` | 查看各节点的 CPU/内存使用情况（需 metrics-server） |
| 查看节点标签 | `kubectl get nodes --show-labels` | 显示每个节点的标签 |
| 给节点打标签 | `kubectl label node <node-name> disktype=ssd` | 添加标签用于亲和性调度 |
| 给节点打污点（禁止调度） | `kubectl taint node <node-name> key=value:NoSchedule` | 阻止 Pod 调度到该节点 |
| 节点置为不可调度 | `kubectl cordon <node-name>` | 标记节点不可调度（已有 Pod 不受影响） |
| 驱逐节点上的 Pod | `kubectl drain <node-name> --ignore-daemonsets --delete-emptydir-data` | 安全迁移节点上的所有 Pod |
| 恢复节点调度 | `kubectl uncordon <node-name>` | 恢复节点为可调度状态 |

### 资源查看与操作

| 场景 | 命令 | 说明 |
|------|------|------|
| 列出所有命名空间 | `kubectl get ns` | 查看所有命名空间 |
| 列出所有 Pod | `kubectl get pods` | 当前命名空间下的 Pod |
| 列出所有命名空间的 Pod | `kubectl get pods -A` 或 `--all-namespaces` | 全集群范围查看 Pod |
| 广泛输出（更多列） | `kubectl get pods -o wide` | 显示 IP、节点等信息 |
| 按标签过滤 | `kubectl get pods -l app=nginx` | 按标签选择器过滤资源 |
| JSON 格式输出 | `kubectl get pod <pod-name> -o json` | 获取资源的完整 JSON |
| YAML 格式输出 | `kubectl get pod <pod-name> -o yaml` | 获取资源的完整 YAML |
| 自定义列输出 | `kubectl get pods -o custom-columns=NAME:.metadata.name,STATUS:.status.phase,NODE:.spec.nodeName` | 只显示关心的字段 |
| 监听资源变化 | `kubectl get pods -w` | watch 模式，实时监听状态变化 |
| 查看 Pod 详情 | `kubectl describe pod <pod-name>` | 查看 Pod 的详细事件、状态、容器信息 |
| 查看资源 events | `kubectl get events --sort-by=.metadata.creationTimestamp` | 按时间排序查看集群事件 |
| 查看指定资源 events | `kubectl describe pod <pod-name> \| grep -A 10 Events` | 只看该 Pod 相关事件 |

### Pod 管理

| 场景 | 命令 | 说明 |
|------|------|------|
| 创建 Pod（YAML） | `kubectl apply -f pod.yaml` | 声明式创建/更新 Pod |
| 快速运行临时 Pod | `kubectl run nginx --image=nginx:1.25` | 命令行快速创建 Pod（仅用于测试） |
| 运行交互式测试 Pod | `kubectl run -it debug --image=busybox --rm -- sh` | 创建临时 Pod 并进入 shell，退出后自动删除 |
| 查看 Pod 日志 | `kubectl logs <pod-name>` | 查看 Pod 中第一个容器的日志 |
| 查看指定容器日志 | `kubectl logs <pod-name> -c <container-name>` | 多容器 Pod 中指定容器日志 |
| 实时跟踪日志 | `kubectl logs -f <pod-name>` | 持续跟踪日志输出 |
| 查看最近 100 行日志 | `kubectl logs --tail=100 <pod-name>` | 查看最近的日志 |
| 查看上一次容器日志 | `kubectl logs <pod-name> --previous` | 容器崩溃重启后查看上一次的日志 |
| 查看带时间戳日志 | `kubectl logs <pod-name> --timestamps` | 每条日志附带时间戳 |
| 进入 Pod 执行命令 | `kubectl exec -it <pod-name> -- bash` | 交互式进入 Pod 内部 |
| 在 Pod 中执行单条命令 | `kubectl exec <pod-name> -- ls /app` | 执行单条命令并返回结果 |
| 端口转发到本地 | `kubectl port-forward pod/<pod-name> 8080:80` | 将 Pod 的 80 端口映射到本机 8080 |
| 端口转发到 Service | `kubectl port-forward svc/<svc-name> 8080:80` | 将 Service 端口映射到本地 |
| 复制文件到 Pod | `kubectl cp /local/file.txt <pod-name>:/app/file.txt` | 将本地文件复制到 Pod 内 |
| 复制文件从 Pod | `kubectl cp <pod-name>:/app/log.txt ./log.txt` | 从 Pod 复制文件到本地 |
| 删除 Pod | `kubectl delete pod <pod-name>` | 删除 Pod（Deployment 管理的会自动重建） |
| 强制删除 Pod | `kubectl delete pod <pod-name> --force --grace-period=0` | 立即强制删除卡在 Terminating 的 Pod |

### Deployment 管理

| 场景 | 命令 | 说明 |
|------|------|------|
| 查看 Deployment 列表 | `kubectl get deploy` | 列出当前命名空间的所有 Deployment |
| 查看 Deployment 详情 | `kubectl describe deploy <name>` | 查看滚动更新策略、副本状态、事件 |
| 创建 Deployment | `kubectl create deploy nginx --image=nginx:1.25 --replicas=3` | 命令行快速创建 |
| 应用 YAML | `kubectl apply -f deploy.yaml` | 声明式创建或更新 |
| 扩容副本 | `kubectl scale deploy <name> --replicas=5` | 调整副本数 |
| 更新镜像 | `kubectl set image deploy/<name> <container>=nginx:1.26` | 更新容器镜像触发滚动更新 |
| 查看滚动更新状态 | `kubectl rollout status deploy/<name>` | 观察滚动更新的进度 |
| 查看滚动更新历史 | `kubectl rollout history deploy/<name>` | 查看历史版本列表 |
| 查看指定版本详情 | `kubectl rollout history deploy/<name> --revision=3` | 查看某个版本的镜像和配置 |
| 回滚到上一个版本 | `kubectl rollout undo deploy/<name>` | 回滚到上一个正常版本 |
| 回滚到指定版本 | `kubectl rollout undo deploy/<name> --to-revision=3` | 回滚到指定的历史版本 |
| 暂停滚动更新 | `kubectl rollout pause deploy/<name>` | 暂停当前操作，进行金丝雀验证 |
| 恢复滚动更新 | `kubectl rollout resume deploy/<name>` | 继续执行被暂停的滚动更新 |
| 重启 Deployment | `kubectl rollout restart deploy/<name>` | 触发 Pod 逐个重建（不改变镜像） |
| 删除 Deployment | `kubectl delete deploy <name>` | 删除 Deployment 及其管理的 Pod |
| 导出 Deployment YAML | `kubectl get deploy <name> -o yaml > backup.yaml` | 备份当前 Deployment 的配置 |

#### Deployment YAML 示例

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: myapp
  namespace: production
  labels:
    app: myapp
spec:
  replicas: 3
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxSurge: 1
      maxUnavailable: 0
  selector:
    matchLabels:
      app: myapp
  template:
    metadata:
      labels:
        app: myapp
        version: "v1.2.0"
    spec:
      terminationGracePeriodSeconds: 30
      containers:
        - name: app
          image: myrepo/myapp:v1.2.0
          imagePullPolicy: IfNotPresent
          ports:
            - containerPort: 8080
              protocol: TCP
          resources:
            requests:
              cpu: 200m
              memory: 256Mi
            limits:
              cpu: 500m
              memory: 512Mi
          readinessProbe:
            httpGet:
              path: /actuator/health/readiness
              port: 8080
            initialDelaySeconds: 10
            periodSeconds: 5
          livenessProbe:
            httpGet:
              path: /actuator/health/liveness
              port: 8080
            initialDelaySeconds: 30
            periodSeconds: 10
          env:
            - name: SPRING_PROFILES_ACTIVE
              value: "k8s"
            - name: DB_HOST
              valueFrom:
                secretKeyRef:
                  name: db-secret
                  key: host
          volumeMounts:
            - name: config
              mountPath: /app/config
              readOnly: true
      volumes:
        - name: config
          configMap:
            name: myapp-config
```

### Service 与 Ingress

| 场景 | 命令 | 说明 |
|------|------|------|
| 查看 Service 列表 | `kubectl get svc` | 列出所有 Service |
| 查看 Service 详情 | `kubectl describe svc <svc-name>` | 查看端口映射、Selector、Endpoint |
| 查看 Endpoint | `kubectl get endpoints <svc-name>` | 查看 Service 后端的 Pod IP 列表 |
| 暴露 Deployment 为 Service | `kubectl expose deploy <deploy-name> --port=80 --target-port=8080 --type=ClusterIP` | 创建 ClusterIP 类型的 Service |
| 创建 NodePort Service | `kubectl expose deploy <name> --port=80 --target-port=8080 --type=NodePort` | 通过节点端口暴露服务 |
| 查看 Ingress 列表 | `kubectl get ingress` | 列出 Ingress 资源 |
| 查看 Ingress 详情 | `kubectl describe ingress <name>` | 查看路由规则和 TLS 配置 |
| 应用 Ingress YAML | `kubectl apply -f ingress.yaml` | 创建或更新 Ingress |
| 删除 Service | `kubectl delete svc <svc-name>` | 删除 Service（不影响 Pod） |

#### Service YAML 示例

```yaml
apiVersion: v1
kind: Service
metadata:
  name: myapp-svc
  namespace: production
  labels:
    app: myapp
spec:
  type: ClusterIP
  selector:
    app: myapp
  ports:
    - name: http
      port: 80
      targetPort: 8080
      protocol: TCP
    - name: metrics
      port: 9090
      targetPort: 9090
      protocol: TCP
  sessionAffinity: None
```

#### Ingress YAML 示例

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: myapp-ingress
  namespace: production
  annotations:
    nginx.ingress.kubernetes.io/rewrite-target: /
    cert-manager.io/cluster-issuer: letsencrypt-prod
    nginx.ingress.kubernetes.io/proxy-body-size: "10m"
spec:
  ingressClassName: nginx
  tls:
    - hosts:
        - api.example.com
      secretName: api-tls
  rules:
    - host: api.example.com
      http:
        paths:
          - path: /api
            pathType: Prefix
            backend:
              service:
                name: myapp-svc
                port:
                  number: 80
```

### ConfigMap 与 Secret

| 场景 | 命令 | 说明 |
|------|------|------|
| 查看 ConfigMap 列表 | `kubectl get configmap` | 列出 ConfigMap |
| 创建 ConfigMap（文件） | `kubectl create configmap app-config --from-file=app.properties` | 从文件创建 |
| 创建 ConfigMap（键值对） | `kubectl create configmap app-config --from-literal=DB_HOST=postgres --from-literal=DB_PORT=5432` | 从命令行字面量创建 |
| 创建 ConfigMap（目录） | `kubectl create configmap app-config --from-file=config/` | 从目录批量导入 |
| 查看 ConfigMap 内容 | `kubectl get configmap app-config -o yaml` | 查看完整配置 |
| 查看 Secret 列表 | `kubectl get secrets` | 列出 Secret |
| 创建 Opaque Secret | `kubectl create secret generic db-secret --from-literal=username=admin --from-literal=password=S3cret!` | 从字面量创建通用 Secret |
| 创建 TLS Secret | `kubectl create secret tls api-tls --cert=cert.pem --key=key.pem` | 创建 TLS 类型的 Secret |
| 创建 Docker 仓库 Secret | `kubectl create secret docker-registry regcred --docker-server=registry.example.com --docker-username=admin --docker-password=S3cret!` | 用于拉取私有镜像仓库 |
| 查看 Secret 内容（值经过 Base64） | `kubectl get secret db-secret -o yaml` | 注意：Secret 中的值是 Base64 编码，非加密 |
| 解码 Secret 值 | `kubectl get secret db-secret -o jsonpath='{.data.password}' \| base64 -d` | 解码查看明文 |
| 删除 ConfigMap | `kubectl delete configmap app-config` | 删除 ConfigMap |
| 删除 Secret | `kubectl delete secret db-secret` | 删除 Secret |

#### ConfigMap 挂载示例

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: myapp
spec:
  template:
    spec:
      containers:
        - name: app
          image: myapp:v1
          # 方式一：作为环境变量注入
          envFrom:
            - configMapRef:
                name: app-config
          # 方式二：单个 key 注入为环境变量
          env:
            - name: DB_HOST
              valueFrom:
                configMapKeyRef:
                  name: app-config
                  key: DB_HOST
          # 方式三：作为文件挂载到容器
          volumeMounts:
            - name: config-volume
              mountPath: /app/config
              readOnly: true
      volumes:
        - name: config-volume
          configMap:
            name: app-config
```

### 故障排查

| 场景 | 命令 | 说明 |
|------|------|------|
| Pod 启动失败排查流程 | 见下方说明 | 故障排查的标准步骤 |
| 查看 Pod 状态 | `kubectl get pod <name> -o wide` | 快速检查 Pod 状态（Running / Pending / CrashLoopBackOff / ImagePullBackOff） |
| 查看 Pod 异常原因 | `kubectl describe pod <name>` | 查看 Events 了解调度、拉镜像、启动各阶段的问题 |
| 查看上一个容器崩溃日志 | `kubectl logs <pod-name> --previous` | CrashLoopBackOff 时查看崩溃前的日志 |
| 查看资源使用 | `kubectl top pod` | 查看 Pod 的 CPU/内存实际使用 |
| 查看节点资源 | `kubectl top node` | 查看各节点资源使用 |
| 进入 Pod 调试 | `kubectl exec -it <pod-name> -- sh` | 进入容器内排查网络/文件/进程问题 |
| 网络诊断 Pod | `kubectl run -it net-debug --image=nicolaka/netshoot --rm -- bash` | 创建包含 curl/dig/nc/tcpdump 的网络诊断 Pod |
| DNS 测试 | `kubectl run -it dns-test --image=busybox --rm -- nslookup kubernetes.default` | 测试集群内 DNS 解析 |
| 查看 RBAC 权限 | `kubectl auth can-i create pods --as=system:serviceaccount:default:myapp-sa` | 验证 ServiceAccount 的权限 |
| 查看资源配额 | `kubectl get resourcequota` | 查看命名空间的资源限制 |
| 导出调试信息 | `kubectl get pod <name> -o yaml > debug-pod.yaml` | 导出 Pod 完整配置用于离线分析 |
| 获取集群 events | `kubectl get events -A --sort-by='.lastTimestamp' \| tail -50` | 查看最近 50 条集群事件 |

#### 故障排查标准流程

```
1. kubectl get pod <name> -o wide
   -> 检查 STATUS 列：Pending / CrashLoopBackOff / ImagePullBackOff / Error / Unknown
   -> 检查 READY 列：0/1 表示未就绪

2. kubectl describe pod <name>
   -> 看 Events 区域，定位问题阶段（调度/拉镜像/启动/健康检查）

3. kubectl logs <name> --tail=100
   -> 查看应用日志，关注 ERROR 和异常堆栈
   -> CrashLoopBackOff 时加 --previous 看上一次崩溃日志

4. kubectl exec -it <name> -- sh (如果容器能启动)
   -> 检查文件系统、环境变量、网络连通性
   -> 手动运行启动命令验证

5. 常见问题的解决方案：
   - ImagePullBackOff -> 检查镜像名、tag、imagePullSecrets
   - CrashLoopBackOff -> 查看日志定位应用层错误或资源不足
   - Pending -> 检查节点资源（kubectl top node）、节点选择器、PVC 绑定
   - Error / OOMKilled -> 增加 memory limit 或排查内存泄漏
   - 健康检查失败 -> 检查 readinessProbe/livenessProbe 路径和延迟配置
```

### Helm（包管理）

| 场景 | 命令 | 说明 |
|------|------|------|
| 添加 Helm 仓库 | `helm repo add bitnami https://charts.bitnami.com/bitnami` | 添加第三方 Chart 仓库 |
| 更新仓库索引 | `helm repo update` | 拉取最新的 Chart 列表 |
| 搜索 Chart | `helm search repo nginx` | 在已添加的仓库中搜索 |
| 安装 Chart | `helm install my-release bitnami/nginx -n production --values values.yaml` | 安装 Chart 到指定命名空间 |
| 列出已安装 Release | `helm list -A` | 查看所有命名空间的 Release |
| 查看 Release 详情 | `helm status my-release` | 查看 Release 状态和资源 |
| 查看 Release 的值 | `helm get values my-release` | 查看安装时传入的自定义值 |
| 升级 Release | `helm upgrade my-release bitnami/nginx --values values.yaml` | 更新 Chart 配置或版本 |
| 回滚 Release | `helm rollback my-release 3` | 回滚到历史版本 3 |
| 查看历史版本 | `helm history my-release` | 查看 Release 的所有版本 |
| 卸载 Release | `helm uninstall my-release` | 卸载 Release，删除所有关联资源 |

## 最佳实践

1. **声明式管理**：统一使用 YAML 文件 + `kubectl apply` 管理资源，避免命令行直接创建
2. **资源限制必须设置**：每个容器都要配置 `resources.requests` 和 `resources.limits`，防止资源争抢
3. **健康检查**：生产服务必须配置 `readinessProbe` 和 `livenessProbe`，确保流量只打到健康的 Pod
4. **Pod 反亲和性**：关键服务的多个副本应配置 `podAntiAffinity` 分布到不同节点
5. **滚动更新策略**：设置 `maxUnavailable: 0` 保证零停机，`maxSurge: 1` 控制灰度速度
6. **Secret 安全**：机密数据使用 Secret 存储，配合 Sealed Secrets 或 External Secrets Operator 管理
7. **命名空间隔离**：按环境（dev/staging/prod）和团队划分命名空间，设置 ResourceQuota 和 NetworkPolicy
8. **镜像版本固定**：生产环境使用精确 tag 或 digest，不要使用 `latest`
9. **优雅终止**：设置 `terminationGracePeriodSeconds`，应用监听 SIGTERM 信号完成收尾工作
10. **日志集中收集**：日志输出到 stdout/stderr，由 DaemonSet 日志采集器（如 Fluentd）统一发送到存储

## Agent 使用提示

<!-- Agent 在调用该工具时应遵循的规范 -->

### 安全边界

| 命令类型 | 自动执行 | 需确认 | 说明 |
|----------|----------|--------|------|
| `kubectl get`（查看资源） | 是 | | 只读查询，无副作用 |
| `kubectl describe`（查看详情） | 是 | | 只读查询 |
| `kubectl logs`（查看日志） | 是 | | 只读，建议限制 `--tail` 避免输出过载 |
| `kubectl top`（查看资源使用） | 是 | | 只读，需 metrics-server |
| `kubectl cluster-info` | 是 | | 只读集群信息 |
| `kubectl auth can-i` | 是 | | 权限检查，无副作用 |
| `kubectl port-forward` | | 是 | 建立本地到集群的隧道 |
| `kubectl exec`（进入 Pod） | | **警告** | 在 Pod 内执行命令，需明确告知操作意图 |
| `kubectl apply` | | 是 | 创建或更新资源，应提供 diff 预览 |
| `kubectl create` | | 是 | 创建新资源 |
| `kubectl edit` | | 是 | 编辑资源，YAML 变更需审慎 |
| `kubectl delete` | | **严格** | 删除资源不可逆，必须二次确认 |
| `kubectl scale` | | 是 | 改变副本数，影响可用性 |
| `kubectl rollout undo/restart` | | 是 | 回滚或重启，可能触发服务中断 |
| `kubectl drain / cordon` | | **严格** | 节点操作影响调度，需运维确认 |
| `kubectl taint` | | **严格** | 修改节点污点，影响全局调度 |
| `helm install / upgrade / uninstall` | | **严格** | 安装/升级/卸载 Release，可能影响生产 |

### 建议的权限模式

- **只读操作（可自动）**：`kubectl get`、`kubectl describe`、`kubectl logs`（建议加 `--tail` 限制）、`kubectl top`、`kubectl auth can-i`
- **调试操作（需确认）**：`kubectl exec`、`kubectl port-forward`、`kubectl cp`
- **资源修改（需确认 + 预览 diff）**：`kubectl apply`、`kubectl create`、`kubectl edit`、`kubectl scale`
- **危险操作（必须用户手动确认）**：`kubectl delete`（尤其删除命名空间）、`kubectl drain`、`kubectl taint`、`kubectl delete ns`
- **生产命名空间（严格保护）**：任何对 `production` 命名空间的写操作都需用户逐条确认

### Agent 行为规范

1. 对生产环境的操作必须先 `kubectl config current-context` 确认当前上下文，避免操作错误集群
2. 执行 `kubectl apply` 前，建议先 `kubectl diff -f` 展示变更内容
3. 在 `kubectl exec` 进入容器执行命令时，Agent 必须告知用户执行了什么命令及目的
4. 不要使用 `kubectl apply -f` 配合 URL（远程 YAML），应引导用户审查后本地保存再 apply
5. 删除操作前，Agent 必须先列出将要删除的资源，并请求用户确认
6. 不能以 Agent 身份修改或删除 RBAC 资源（Role、ClusterRole、RoleBinding）
7. Secret 的值不能通过 Agent 对话输出明文，发现 Secret 泄露应提醒用户轮换
8. 遇到 `CrashLoopBackOff` 或 `ImagePullBackOff` 的 Pod，Agent 应收集日志和事件信息辅助分析，而非直接重启或删除重建

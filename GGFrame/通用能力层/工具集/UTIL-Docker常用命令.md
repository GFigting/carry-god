---
type: tool-manual
tool_id: "UTIL-001"
tool_name: "Docker常用命令"
category: "容器技术"

tags:
  - type/tool-manual
  - tool/docker
created: "2026-05-24"
updated: "2026-05-24"
---

# Docker 常用命令 操作手册

## 常用命令

### 镜像管理

| 场景 | 命令 | 说明 |
|------|------|------|
| 搜索镜像 | `docker search nginx` | 在 Docker Hub 搜索镜像 |
| 拉取镜像 | `docker pull nginx:1.25` | 拉取指定 tag 的镜像 |
| 拉取 latest | `docker pull nginx` | 不指定 tag 则默认 latest |
| 查看本地镜像 | `docker images` | 列出本地所有镜像 |
| 查看镜像详情 | `docker inspect nginx:1.25` | 查看镜像的元数据和层信息 |
| 查看镜像历史 | `docker history nginx:1.25` | 查看镜像构建历史和每层大小 |
| 删除镜像 | `docker rmi nginx:1.25` | 删除指定镜像 |
| 强制删除镜像 | `docker rmi -f nginx:1.25` | 即使有容器使用也强制删除 |
| 清理悬空镜像 | `docker image prune` | 删除没有标签的悬空镜像 `<none>:<none>` |
| 清理所有未使用镜像 | `docker image prune -a` | 删除所有未被任何容器使用的镜像 |
| 导出镜像 | `docker save -o nginx.tar nginx:1.25` | 将镜像导出为 tar 文件 |
| 导入镜像 | `docker load -i nginx.tar` | 从 tar 文件加载镜像 |
| 给镜像打标签 | `docker tag nginx:1.25 myrepo/nginx:v1` | 为镜像添加新标签，常用于推送到私有仓库 |
| 推送镜像 | `docker push myrepo/nginx:v1` | 推送镜像到仓库 |

### 容器运行管理

| 场景 | 命令 | 说明 |
|------|------|------|
| 运行容器（前台） | `docker run nginx` | 前台运行，Ctrl+C 停止 |
| 运行容器（后台） | `docker run -d --name web nginx` | 后台运行并命名 |
| 运行并映射端口 | `docker run -d -p 8080:80 nginx` | 宿主机 8080 映射到容器 80 |
| 运行并挂载目录 | `docker run -d -v /host/path:/container/path nginx` | 挂载数据卷实现持久化 |
| 运行并设置环境变量 | `docker run -d -e MYSQL_ROOT_PASSWORD=pass mysql:8` | 通过环境变量配置容器 |
| 运行并限制资源 | `docker run -d --cpus=2 --memory=512m nginx` | 限制 CPU 核数和内存上限 |
| 运行交互式容器 | `docker run -it ubuntu bash` | 以交互模式运行，分配终端 |
| 进入正在运行的容器 | `docker exec -it web bash` | 在运行中的容器内执行命令 |
| 查看运行中容器 | `docker ps` | 列出正在运行的容器 |
| 查看所有容器 | `docker ps -a` | 包含已停止的容器 |
| 查看容器日志 | `docker logs web` | 查看容器的标准输出 |
| 查看容器日志（实时） | `docker logs -f web` | 持续跟踪日志 |
| 查看容器日志（最近N行） | `docker logs --tail 50 web` | 查看最近 50 行日志 |
| 停止容器 | `docker stop web` | 优雅停止（SIGTERM 后超时 SIGKILL） |
| 立即停止容器 | `docker kill web` | 立即发送 SIGKILL |
| 重启容器 | `docker restart web` | 重启容器 |
| 启动已停止的容器 | `docker start web` | 启动已存在的停止状态容器 |
| 删除容器 | `docker rm web` | 删除已停止的容器 |
| 强制删除运行中容器 | `docker rm -f web` | 强制删除（先停止再删除） |
| 删除所有已停止容器 | `docker container prune` | 批量清理 |
| 查看容器资源使用 | `docker stats` | 实时显示 CPU/内存/网络/IO |
| 查看容器详情 | `docker inspect web` | 查看容器的完整配置信息 |
| 查看容器内进程 | `docker top web` | 列出容器内的进程 |
| 从容器复制文件到宿主机 | `docker cp web:/app/log.txt ./log.txt` | 在容器和宿主机间复制文件 |
| 从宿主机复制文件到容器 | `docker cp ./config.yaml web:/app/` | 复制到容器内 |

### 网络管理

| 场景 | 命令 | 说明 |
|------|------|------|
| 查看网络列表 | `docker network ls` | 列出所有 Docker 网络 |
| 创建 bridge 网络 | `docker network create mynet` | 创建自定义桥接网络（默认 driver） |
| 创建带子网的网络 | `docker network create --subnet=172.20.0.0/16 mynet` | 指定子网创建网络 |
| 将容器连接网络 | `docker network connect mynet web` | 将运行中的容器加入网络 |
| 断开容器网络 | `docker network disconnect mynet web` | 将容器从网络断开 |
| 查看网络详情 | `docker network inspect mynet` | 查看网络配置和已连接容器 |
| 删除网络 | `docker network rm mynet` | 删除自定义网络 |
| 清理未使用网络 | `docker network prune` | 删除所有未被容器使用的网络 |
| 运行容器时指定网络 | `docker run -d --network=mynet nginx` | 启动时直接加入指定网络 |

### 数据卷管理

| 场景 | 命令 | 说明 |
|------|------|------|
| 查看数据卷列表 | `docker volume ls` | 列出所有数据卷 |
| 创建数据卷 | `docker volume create mydata` | 创建命名数据卷 |
| 查看数据卷详情 | `docker volume inspect mydata` | 查看卷的挂载点等元数据 |
| 删除数据卷 | `docker volume rm mydata` | 删除指定数据卷 |
| 清理未使用数据卷 | `docker volume prune` | 删除所有未被任何容器引用的卷 |
| 挂载数据卷运行 | `docker run -d -v mydata:/data nginx` | 使用命名卷持久化数据 |
| 挂载当前目录 | `docker run -d -v $(pwd):/app nginx` | 将宿主机目录挂载到容器 |
| 只读挂载 | `docker run -d -v $(pwd)/config:/etc/nginx:ro nginx` | 只读挂载，容器内不可修改 |

### Docker Compose 常用命令

| 场景 | 命令 | 说明 |
|------|------|------|
| 启动服务（后台） | `docker compose up -d` | 根据 compose.yaml 启动所有服务 |
| 启动指定服务 | `docker compose up -d web` | 仅启动某个服务及其依赖 |
| 查看运行状态 | `docker compose ps` | 查看 compose 管理的容器状态 |
| 查看日志 | `docker compose logs -f` | 查看所有服务日志 |
| 查看指定服务日志 | `docker compose logs -f web` | 跟踪指定服务日志 |
| 停止服务 | `docker compose stop` | 停止所有服务，不删除容器 |
| 停止并删除 | `docker compose down` | 停止并删除容器和网络 |
| 停止删除+数据卷 | `docker compose down -v` | 同时删除匿名卷（慎重） |
| 重新构建并启动 | `docker compose up -d --build` | Dockerfile 变更后重新构建镜像 |
| 拉取最新镜像 | `docker compose pull` | 拉取 compose 中定义的所有服务镜像 |
| 在运行的服务中执行命令 | `docker compose exec web bash` | 进入 compose 管理的服务容器 |
| 查看 compose 配置 | `docker compose config` | 验证和查看合并后的 compose 配置 |

### 系统维护

| 场景 | 命令 | 说明 |
|------|------|------|
| 查看 Docker 系统信息 | `docker info` | 查看 Docker 守护进程的系统级信息 |
| 查看磁盘使用情况 | `docker system df` | 查看镜像/容器/卷的磁盘占用 |
| 一键清理（慎用） | `docker system prune -a` | 清理所有未使用的镜像、容器、网络、构建缓存 |
| 查看 Docker 版本 | `docker version` | 查看客户端和服务端版本 |

## 最佳实践

### Dockerfile 最佳实践

1. **选择精简基础镜像**：优先使用 `alpine` 或 `distroless` 变体减小镜像体积，如 `node:20-alpine` 而非 `node:20`
2. **多阶段构建**：构建阶段使用完整 SDK，运行阶段仅保留运行时产物
3. **合并 RUN 层**：多个 `RUN` 命令用 `&&` 连接，减少镜像层数
4. **COPY 优于 ADD**：除非需要自动解压 tar 包，否则统一使用 `COPY`
5. **.dockerignore 文件**：排除 `node_modules`、`.git`、日志文件等，加速构建上下文传输
6. **固定版本 tag**：`FROM node:20.11.0-alpine` 而非 `FROM node:latest`，保证构建可重复
7. **非 root 用户运行**：`USER node` 降低安全风险
8. **HEALTHCHECK 指令**：添加健康检查确保容器状态可观测

#### 多阶段构建示例（前端）

```dockerfile
# 阶段一：构建
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build

# 阶段二：运行
FROM nginx:1.25-alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
HEALTHCHECK --interval=30s --timeout=3s CMD wget -qO- http://localhost/health || exit 1
CMD ["nginx", "-g", "daemon off;"]
```

#### 多阶段构建示例（后端 Java）

```dockerfile
# 阶段一：构建
FROM maven:3.9-eclipse-temurin-21-alpine AS builder
WORKDIR /app
COPY pom.xml .
RUN mvn dependency:go-offline
COPY src ./src
RUN mvn package -DskipTests

# 阶段二：运行
FROM eclipse-temurin:21-jre-alpine
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
USER appuser
COPY --from=builder /app/target/*.jar app.jar
EXPOSE 8080
HEALTHCHECK --interval=30s --timeout=3s CMD wget -qO- http://localhost:8080/actuator/health || exit 1
ENTRYPOINT ["java", "-jar", "app.jar"]
```

### Docker Compose 文件示例

```yaml
version: "3.8"
services:
  app:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: myapp
    restart: unless-stopped
    ports:
      - "8080:8080"
    environment:
      - SPRING_PROFILES_ACTIVE=docker
      - DB_HOST=db
      - DB_PORT=5432
    depends_on:
      db:
        condition: service_healthy
    volumes:
      - ./logs:/app/logs
    networks:
      - app-net
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8080/actuator/health"]
      interval: 30s
      timeout: 5s
      retries: 3

  db:
    image: postgres:16-alpine
    container_name: myapp-db
    restart: unless-stopped
    environment:
      - POSTGRES_DB=myapp
      - POSTGRES_USER=myapp
      - POSTGRES_PASSWORD_FILE=/run/secrets/db_password
    secrets:
      - db_password
    volumes:
      - pgdata:/var/lib/postgresql/data
    networks:
      - app-net
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U myapp"]
      interval: 10s
      timeout: 5s
      retries: 5

  nginx:
    image: nginx:1.25-alpine
    container_name: myapp-nginx
    restart: unless-stopped
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf:ro
      - ./nginx/certs:/etc/nginx/certs:ro
    depends_on:
      - app
    networks:
      - app-net

volumes:
  pgdata:

networks:
  app-net:
    driver: bridge

secrets:
  db_password:
    file: ./secrets/db_password.txt
```

### 日常运维最佳实践

1. **容器无状态设计**：所有持久化数据通过 volume 挂载，容器本身可以随时销毁重建
2. **一个容器一个进程**：遵循单一职责原则，不把数据库和应用塞进同一容器
3. **日志输出到 stdout/stderr**：用 `docker logs` 或日志驱动（如 fluentd）统一收集
4. **资源限制**：生产环境必须设置 `--cpus` 和 `--memory`，防止单容器耗尽宿主机资源
5. **定期清理**：设置 cron 定时执行 `docker system prune -f`，防止磁盘堆积
6. **镜像安全扫描**：使用 `docker scan` 或 Trivy 扫描镜像漏洞
7. **tag 管理策略**：生产镜像使用语义化版本 tag（`v1.2.3`），禁止 `latest` 上生产

## Agent 使用提示

<!-- Agent 在调用该工具时应遵循的规范 -->

### 安全边界

| 命令类型 | 自动执行 | 需确认 | 说明 |
|----------|----------|--------|------|
| `docker ps`, `docker images`, `docker logs` | 是 | | 只读命令，无副作用 |
| `docker inspect`, `docker stats`, `docker info` | 是 | | 查看元数据，无副作用 |
| `docker network ls`, `docker volume ls` | 是 | | 查看网络和卷信息 |
| `docker compose ps`, `docker compose logs` | 是 | | compose 只读操作 |
| `docker build` | | 是 | 构建镜像，可能耗时较长 |
| `docker run`（新容器） | | 是 | 创建容器，可能占用端口和资源 |
| `docker start / stop / restart` | | 是 | 改变容器运行状态 |
| `docker exec` | | **警告** | 在容器内执行命令，需明确告知用户意图 |
| `docker rm`, `docker rmi` | | 是 | 删除操作，需用户确认 |
| `docker system prune` | | **禁止** | 批量清理不可逆，Agent 绝不能自动执行 |
| `docker volume rm`, `docker volume prune` | | **禁止** | 删除数据卷可能造成数据永久丢失 |
| `docker compose down -v` | | **禁止** | 删除数据卷，造成数据永久丢失 |
| `docker push` | | 是 | 推送镜像，涉及仓库写操作 |
| `docker network rm` | | 是 | 删除网络，需确认不影响其他容器 |

### 建议的权限模式

- **只读操作（可自动）**：`docker ps`、`docker images`、`docker logs`、`docker inspect`、`docker stats`、`docker info`、`docker compose ps`、`docker compose logs`、`docker compose config`
- **构建操作（需确认）**：`docker build`、`docker compose build`
- **运行管理（需确认）**：`docker run`、`docker start`、`docker stop`、`docker restart`、`docker compose up`、`docker compose down`
- **进入容器（需用户明确授权）**：`docker exec`，Agent 必须说明将在哪个容器执行什么命令
- **清理操作（用户必须手动确认）**：`docker rm`、`docker rmi`、`docker system prune`、`docker volume prune/rm`

### Agent 行为规范

1. 在容器内执行命令前，必须先 `docker ps` 确认目标容器存在且状态正常
2. 不得修改运行中容器的敏感环境变量（数据库密码、API 密钥等），建议通过重启容器更新
3. 修改容器挂载的配置文件时，提醒用户需重启容器才能生效
4. 批量删除镜像/容器前，必须列出将影响的对象清单，获得用户确认后再执行
5. 严禁 Agent 在容器内安装未经验证的软件包或执行来源不明的脚本
6. 使用 `docker run` 时，Agent 应避免使用 `--privileged` 模式，除非用户明确要求
7. 发现容器异常（如 CPU/内存飙升）时，Agent 应优先收集 `docker stats` 和 `docker logs --tail 100` 信息，而非直接重启

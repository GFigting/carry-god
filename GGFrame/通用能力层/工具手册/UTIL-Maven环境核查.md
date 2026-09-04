---
type: util
id: UTIL-MAVEN-001
title: Maven 环境核查手册
domain: build

tags:
  - type/util
  - domain/build
  - tool/maven
created: 2026-07-09
updated: 2026-07-09
---

# Maven 环境核查手册

## 目的

本手册用于确认 **IDEA Maven 环境** 与 **命令行 Maven 环境** 是否一致，降低 Agent 或开发者在终端执行 `mvn` 时出现依赖解析、JDK、私服配置、超时等问题的概率。

核心判断：IDEA 中能编译/测试，不代表终端 `mvn` 一定等价。需要分别核查 Maven home、JDK、`settings.xml`、本地仓库、profile 和环境变量。

## 适用场景

- Agent 需要运行 Maven 单测、编译或构建前
- IDEA 能跑通，但终端 `mvn` 失败或超时
- 新机器、新项目、切换 JDK/Maven/私服配置后
- 项目需要沉淀标准验证命令时

## IDEA 人工检查位置

### Maven 基础配置

路径：

```text
Settings > Build, Execution, Deployment > Build Tools > Maven
```

检查项：

| 项 | 需要确认 |
| --- | --- |
| Maven home path | 使用 IDEA Bundled Maven，还是本机安装 Maven |
| User settings file | 是否指向公司私服 `settings.xml` |
| Local repository | 是否为常用本地仓库 |
| JDK for importer | Maven 项目导入时使用哪个 JDK |

### Maven Runner 配置

路径：

```text
Settings > Build, Execution, Deployment > Build Tools > Maven > Runner
```

检查项：

| 项 | 需要确认 |
| --- | --- |
| JRE | 运行 Maven 时使用哪个 JDK |
| VM Options | 是否有额外 JVM 参数 |
| Environment variables | 是否配置了私服、代理、profile 等环境变量 |
| Skip tests | IDEA 是否默认跳过测试 |
| Profiles | 是否启用了特定 Maven profile |

### Project SDK

路径：

```text
File > Project Structure > Project
```

检查项：

| 项 | 需要确认 |
| --- | --- |
| SDK | 项目实际使用的 JDK |
| Language level | Java 语言级别是否与项目要求一致 |

## IDEA Terminal 核查命令

在 IDEA Terminal 中执行以下命令，确认“终端 `mvn` 实际使用的环境”。

### Maven 与 Java 来源

```powershell
Get-Command mvn | Format-List Source,Version
mvn -version

Get-Command java | Format-List Source,Version
java -version
javac -version
```

关注点：

- `mvn -version` 输出的 Maven 版本
- `mvn -version` 输出的 Java version / Java home
- `java` 与 `javac` 是否来自预期 JDK

### 环境变量

```powershell
echo $env:JAVA_HOME
echo $env:MAVEN_HOME
echo $env:M2_HOME
echo $env:MAVEN_OPTS
echo $env:MAVEN_USER_HOME
```

关注点：

- `JAVA_HOME` 是否与 IDEA Runner JRE 一致
- `MAVEN_HOME` / `M2_HOME` 是否指向预期 Maven
- `MAVEN_OPTS` 是否包含代理、内存、编码等特殊参数
- `MAVEN_USER_HOME` 是否导致读取了非默认 `.m2` 目录

### Effective Settings

```powershell
mvn help:effective-settings
```

关注点：

- `localRepository`
- `mirrors`
- `servers`
- `profiles`
- `proxies`

注意：输出可能包含私服账号、token、server id 等敏感信息。对外粘贴前必须脱敏。

### 项目 Maven 固定参数

```powershell
Test-Path .mvn/maven.config
Get-Content .mvn/maven.config -ErrorAction SilentlyContinue

Test-Path .mvn/jvm.config
Get-Content .mvn/jvm.config -ErrorAction SilentlyContinue
```

关注点：

- 是否存在项目级 Maven 参数
- 是否固定 profile、settings、skipTests、JVM 参数

### Effective POM

```powershell
mvn -pl {module-path} help:effective-pom -DskipTests
```

示例：

```powershell
mvn -pl lasen-module-fc/lasen-module-fc-service help:effective-pom -DskipTests
```

关注点：

- 模块是否能被 Maven 正确识别
- 依赖、插件、profile 最终是否符合预期

## Agent 使用 Maven 的分级边界

### 轻量验证：默认可用

只跑单模块、单测试类：

```powershell
mvn -pl {module-path} -Dtest={TestClassName} -DfailIfNoTests=false test
```

适用：

- 单个配置类
- 单个工具类
- 单个业务方法的单元测试
- 不依赖数据库、Nacos、Redis、外部 API 的测试

### 中等验证：必要时使用

只编译单模块，不跑测试：

```powershell
mvn -pl {module-path} -DskipTests compile
```

如果当前模块依赖本仓库内其他未安装模块：

```powershell
mvn -pl {module-path} -am -DskipTests compile
```

说明：

- `-am` = `--also-make`，同时构建当前模块依赖的本项目模块
- 适合 API 模块或依赖模块也被修改的场景

### 重型验证：执行前先说明

多模块或全量构建：

```powershell
mvn clean install
```

风险：

- 编译耗时长
- 可能下载大量依赖
- 可能触发大量测试
- 可能依赖数据库、Nacos、Redis、私服、网络代理
- 更容易超时

Agent 默认不应随意执行全量构建。确需执行时，应先说明原因、范围和预计风险。

## 推荐项目验证命令沉淀格式

在项目 README 或工作记录中沉淀：

```markdown
### Maven 验证命令

- 单测：
  `mvn -pl xxx -Dtest=SomeTest -DfailIfNoTests=false test`
- 单模块编译：
  `mvn -pl xxx -DskipTests compile`
- 含依赖模块编译：
  `mvn -pl xxx -am -DskipTests compile`
```

## 排查顺序

当 IDEA 能跑、终端失败时，按顺序检查：

1. `mvn -version` 的 Maven 与 Java 是否和 IDEA 一致
2. IDEA Maven `User settings file` 是否和终端 `effective-settings` 一致
3. 本地仓库是否一致
4. 是否缺少公司私服 mirror/server 配置
5. 是否缺少 profile
6. 是否需要代理或 VPN
7. 是否因为首次编译下载依赖或编译模块过大导致超时
8. 是否误跑了全量构建，应收窄为 `-pl` 单模块命令

## 结论模板

```markdown
### Maven 环境核查结论

- IDEA Maven home:
- IDEA Runner JRE:
- IDEA User settings:
- Terminal `mvn -version`:
- Terminal Java home:
- Effective settings localRepository:
- 私服 mirror/server: 已确认 / 待确认
- 推荐验证命令:
- 风险:
```

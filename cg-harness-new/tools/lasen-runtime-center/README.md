# 项目运行中心（轻量版）

启动运行中心：

```powershell
Set-Location 'D:\songgf\Projects\all-work\carry-god\cg-harness-new\tools\lasen-runtime-center'
.\start-runtime-center.ps1
```

浏览器打开 `http://127.0.0.1:10240`。

默认端口为 `10240`；脚本会检测端口占用，复用已运行的运行中心，并在就绪后自动打开浏览器。指定其他端口：

```powershell
.\start-runtime-center.ps1 -Port 49711
```

个人启动入口见 [docs/personal-startup.md](docs/personal-startup.md)：可统一或分别启动 LASEN、FMS 后端及运行中心。

它每 10 秒探测以下服务：

- LASEN 前端（81）、后端健康检查（49700）、后端实时日志页（49701）
- FMS 前端（80）、后端健康检查（50110）、后端实时日志页（50111）

该工具只读探测服务状态，不采集前端日志，也不提供服务启停操作。

服务名称、地址和对应个人启动入口统一维护在 `runtime-services.json`；变更端口或新增服务时只修改该文件。

后端 classpath 启动脚本会将运行时文件集中在本目录的 `runtime/`：

- `runtime/lasen-fc/classpath/`、`runtime/fms/classpath/`：classpath JAR
- `runtime/*/logs/`：应用日志、stdout、stderr
- `runtime/*/work/`：依赖解析过程中生成的临时工作文件

后端启动会保留最近 5 个工作目录。重新启动后端前，超过 50MB 的 `stdout.log`、`stderr.log` 会轮转，最多保留 3 份历史输出。

LASEN FC 与 FMS 启动时都会显式覆盖 Spring 的 `logging.file.name` 与 Logback 的 `LOG_FILE`，分别统一写入 `runtime/lasen-fc/logs/application.log`、`runtime/fms/logs/application.log`，供 49701、50111 实时日志页读取。

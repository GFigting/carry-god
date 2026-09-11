# 项目运行中心：个人启动手册

所有个人启动入口均集中在本工具目录；项目仓库不保留启动脚本、日志查看器或其专属启动说明。运行中心地址为 `http://127.0.0.1:10240`。统一入口会启动（或复用）项目运行中心、前端、后端与后端实时日志页。

## 单独启动

```powershell
Set-Location 'D:\songgf\Projects\all-work\carry-god\cg-harness-new\tools\lasen-runtime-center'
.\scripts\start-lasen-fc.ps1 -NacosDiscoveryIp '10.8.8.121' -CustomEnvTag 'songgangfu'
.\scripts\start-fms.ps1 -NacosDiscoveryIp '10.8.8.121'
```

## 统一启动

```powershell
Set-Location 'D:\songgf\Projects\all-work\carry-god\cg-harness-new\tools\lasen-runtime-center'
.\start-project.ps1 -Project All -NacosDiscoveryIp '10.8.8.121' -CustomEnvTag 'songgangfu'
```

`-Project` 可取 `LASEN`、`FMS` 或 `All`。服务已健康时会复用，不会重复启动；需加载重新编译的后端代码时，显式增加 `-Restart`。

统一启动会继续尝试同一项目内的其余服务，并在最后汇总“成功或已复用 / 失败”结果；存在失败项时命令返回失败状态，但运行中心仍保持可访问。

`-NoLogViewer` 不启动后端实时日志页；`-NoBrowser` 不自动打开运行中心浏览器。

两个前端脚本均从 `runtime-services.json` 加载 `VITE_PORT`；LASEN 还会加载 `VITE_HEADER_TAG_CONTENT` 与 `VITE_HEADER_TAG_ENABLE=true`。后端脚本会将 `logging.file.name` 和 `LOG_FILE` 同时指定到运行中心，避免 Spring 配置回退到用户目录下的默认日志路径。

## 运行时文件

- `runtime/lasen-fc/classpath/`、`runtime/fms/classpath/`：classpath JAR
- `runtime/*/logs/`：应用日志、stdout、stderr
- `runtime/*/work/`：依赖解析的临时文件

其中应用主日志为 `runtime/lasen-fc/logs/application.log` 和 `runtime/fms/logs/application.log`。这些运行时文件都已被 Git 忽略。个人入口仅在运行中心目录维护启动与日志查看逻辑，不复制或改动业务代码。

`../runtime-services.json` 是统一启动使用的服务清单（项目、服务名称、地址、入口脚本和前端环境变量）；后端健康检查细节、运行路径与启动参数以对应脚本为准。

# FMS 本地启动：生成临时 classpath.jar，绕过 Windows 长命令行限制。
# 用法：.\scripts\start-fms-classpath.ps1 [-Restart]
# 前置：先在 IDEA 编译，并设置 NACOS_DISCOVERY_IP；脚本只解析依赖，不执行 Maven 编译或打包。
[CmdletBinding()]
param(
    [string]$NacosDiscoveryIp = $env:NACOS_DISCOVERY_IP,
    [ValidateRange(1, 300)]
    [int]$HealthWaitSeconds = 120,
    [switch]$NoWait,
    [switch]$NoLogViewer,
    [switch]$Restart,
    [string]$RuntimeDataDirectory = 'D:\songgf\Projects\all-work\carry-god\cg-harness-new\tools\lasen-runtime-center\runtime\fms'
)

$ErrorActionPreference = 'Stop'

$repositoryRoot = 'D:\songgf\Projects\fms-rear'
$moduleDirectory = Join-Path $repositoryRoot 'fms-module-server\fms-module-biz'
$mainClassesDirectory = Join-Path $moduleDirectory 'target\classes'
$mainClass = 'cn.codemonkey.fms.server.FmsServerApplication'
$serverPort = 50110
$healthUri = "http://127.0.0.1:$serverPort/actuator/health/readiness"
$logViewerPort = 50111
$logViewerUri = "http://127.0.0.1:$logViewerPort"
$logViewerScript = Join-Path $PSScriptRoot 'fms-log-viewer.mjs'
$runtimeDataDirectory = [IO.Path]::GetFullPath($RuntimeDataDirectory)
$classpathDirectory = Join-Path $runtimeDataDirectory 'classpath'
$workDirectory = Join-Path $runtimeDataDirectory 'work'
$logDirectory = Join-Path $runtimeDataDirectory 'logs'
$fmsLogFile = Join-Path $logDirectory 'application.log'
$stdoutLog = Join-Path $logDirectory 'stdout.log'
$stderrLog = Join-Path $logDirectory 'stderr.log'
$workDirectoriesToKeep = 5
$startupLogMaxBytes = 50MB
$startupLogArchivesToKeep = 3

function Test-Health {
    try {
        $response = Invoke-WebRequest -UseBasicParsing -Uri $healthUri -TimeoutSec 3
        return $response.StatusCode -eq 200
    } catch {
        return $false
    }
}

function Test-LogViewer {
    try {
        $response = Invoke-WebRequest -UseBasicParsing -Uri "$logViewerUri/" -TimeoutSec 1
        return $response.StatusCode -eq 200
    } catch {
        return $false
    }
}

function Start-LogViewer {
    if ($NoLogViewer) {
        return
    }
    if (-not (Test-Path $logViewerScript)) {
        Write-Warning "未找到实时日志页脚本：$logViewerScript"
        return
    }
    $listener = Get-NetTCPConnection -LocalPort $logViewerPort -State Listen -ErrorAction SilentlyContinue | Select-Object -First 1
    if ($listener) {
        $viewer = Get-CimInstance Win32_Process -Filter "ProcessId = $($listener.OwningProcess)"
        if ($viewer.Name -eq 'node.exe' -and ($viewer.CommandLine -notlike "*$logViewerScript*" -or $viewer.CommandLine -notlike "*$fmsLogFile*")) {
            Stop-Process -Id $listener.OwningProcess -Force
            Start-Sleep -Milliseconds 250
        }
    }
    if (-not (Test-LogViewer)) {
        $node = Get-Command node -ErrorAction SilentlyContinue
        if ($null -eq $node) {
            Write-Warning '未找到 Node.js，跳过实时日志页。'
            return
        }
        Start-Process -FilePath $node.Source -ArgumentList @($logViewerScript, '--port', $logViewerPort, '--log-file', $fmsLogFile) -WindowStyle Hidden
        $deadline = (Get-Date).AddSeconds(5)
        while ((Get-Date) -lt $deadline) {
            if (Test-LogViewer) {
                break
            }
            Start-Sleep -Milliseconds 250
        }
    }
    if (Test-LogViewer) {
        Write-Output "实时日志页：$logViewerUri"
        Start-Process $logViewerUri
    } else {
        Write-Warning "实时日志页启动失败；FMS 日志仍可在 $fmsLogFile 查看。"
    }
}

function Initialize-RuntimeDataDirectory {
    foreach ($directory in @($classpathDirectory, $workDirectory, $logDirectory)) {
        New-Item -ItemType Directory -Path $directory -Force | Out-Null
    }

    Get-ChildItem -LiteralPath $workDirectory -Directory -ErrorAction SilentlyContinue |
        Sort-Object LastWriteTime -Descending |
        Select-Object -Skip $workDirectoriesToKeep |
        ForEach-Object { Remove-Item -LiteralPath $_.FullName -Recurse -Force }
}

function Rotate-StartupLog {
    param([string]$LogFile)

    if (-not (Test-Path $LogFile) -or (Get-Item $LogFile).Length -lt $startupLogMaxBytes) {
        return
    }

    $directory = Split-Path -Parent $LogFile
    $baseName = [IO.Path]::GetFileNameWithoutExtension($LogFile)
    $archive = Join-Path $directory ("$baseName.$(Get-Date -Format 'yyyyMMddHHmmss').log")
    Move-Item -LiteralPath $LogFile -Destination $archive
    Get-ChildItem -LiteralPath $directory -File -Filter "$baseName.*.log" |
        Sort-Object LastWriteTime -Descending |
        Select-Object -Skip $startupLogArchivesToKeep |
        ForEach-Object { Remove-Item -LiteralPath $_.FullName -Force }
}

function Stop-ManagedService {
    $listeners = @(Get-NetTCPConnection -LocalPort $serverPort -State Listen -ErrorAction SilentlyContinue)
    if ($listeners.Count -eq 0) {
        return
    }

    $processIds = @($listeners | Select-Object -ExpandProperty OwningProcess -Unique)
    if ($processIds.Count -ne 1) {
        throw "端口 $serverPort 存在多个监听进程，拒绝自动停止：$($processIds -join ', ')。"
    }

    $processId = $processIds[0]
    $process = Get-Process -Id $processId -ErrorAction Stop
    $processInfo = Get-CimInstance Win32_Process -Filter "ProcessId = $processId" -ErrorAction Stop
    if ($process.ProcessName -notin @('java', 'javaw') -or $processInfo.CommandLine -notlike "*$mainClass*") {
        throw "端口 $serverPort 被 PID $processId（$($process.ProcessName)）占用，但无法确认它是 FMS，拒绝自动停止。"
    }

    Write-Output "停止 FMS，PID：$processId"
    Stop-Process -Id $processId -Force

    $deadline = (Get-Date).AddSeconds(20)
    while ((Get-Date) -lt $deadline) {
        if (-not (Get-NetTCPConnection -LocalPort $serverPort -State Listen -ErrorAction SilentlyContinue)) {
            return
        }
        Start-Sleep -Milliseconds 500
    }
    throw "FMS 停止后端口 $serverPort 未在 20 秒内释放。"
}

function Add-ManifestHeader {
    param(
        [System.Collections.Generic.List[string]]$Lines,
        [string]$Name,
        [string]$Value
    )

    $prefix = "$Name`: "
    $firstChunkLength = 70 - $prefix.Length
    $offset = 0
    $firstChunk = $Value.Substring(0, [Math]::Min($firstChunkLength, $Value.Length))
    $Lines.Add("$prefix$firstChunk")
    $offset += $firstChunk.Length

    while ($offset -lt $Value.Length) {
        $chunkLength = [Math]::Min(69, $Value.Length - $offset)
        $Lines.Add(' ' + $Value.Substring($offset, $chunkLength))
        $offset += $chunkLength
    }
}

Initialize-RuntimeDataDirectory
Start-LogViewer

if ((Test-Health) -and -not $Restart) {
    Write-Output "FMS 已运行：$healthUri"
    return
}

if ($Restart) {
    Stop-ManagedService
} elseif (Get-NetTCPConnection -LocalPort $serverPort -State Listen -ErrorAction SilentlyContinue) {
    throw "端口 $serverPort 已被占用但健康检查失败。请先人工确认，或使用 -Restart 仅重启已确认的 FMS 进程。"
}

if (-not (Test-Path $mainClassesDirectory)) {
    throw "缺少编译产物：$mainClassesDirectory。请先在 IDEA 编译；脚本不会执行 Maven 编译或打包。"
}

if ([string]::IsNullOrWhiteSpace($NacosDiscoveryIp)) {
    throw '缺少 NACOS_DISCOVERY_IP 环境变量。请先设置 $env:NACOS_DISCOVERY_IP。'
}

$runDirectory = Join-Path $workDirectory ([Guid]::NewGuid().ToString('N'))
New-Item -ItemType Directory -Path $runDirectory -Force | Out-Null
$dependencyFile = Join-Path $runDirectory 'runtime-classpath.txt'
$manifestFile = Join-Path $runDirectory 'MANIFEST.MF'
$classpathJar = Join-Path $classpathDirectory 'classpath.jar'

Push-Location $repositoryRoot
try {
    # 通过当前 reactor 解析依赖，避免本地仓库的旧模块元数据遗漏 Nacos 配置依赖。
    & mvn -q -pl fms-module-server/fms-module-biz -am dependency:build-classpath "-Dmdep.outputFile=$dependencyFile" '-Dmdep.pathSeparator=;' '-Dmdep.includeScope=runtime'
    if ($LASTEXITCODE -ne 0) {
        throw "Maven 依赖解析失败，退出码：$LASTEXITCODE。"
    }
} finally {
    Pop-Location
}

$moduleClassesDirectories = Get-ChildItem -Path $repositoryRoot -Recurse -Directory -Filter classes |
    Where-Object { $_.FullName -match '[\\/]target[\\/]classes$' } |
    ForEach-Object { $_.FullName }
$moduleArtifactNames = [System.Collections.Generic.HashSet[string]]::new([StringComparer]::OrdinalIgnoreCase)
foreach ($classesDirectory in $moduleClassesDirectories) {
    $moduleArtifactNames.Add((Split-Path (Split-Path $classesDirectory -Parent) -Parent | Split-Path -Leaf)) | Out-Null
}
$dependencyPaths = (Get-Content -Raw $dependencyFile).Trim() -split ';' |
    Where-Object { $_ } |
    Where-Object {
        if ($_ -match '[\\/]com[\\/]codemonkey[\\/]boot[\\/](?<artifact>[^\\/]+)[\\/]') {
            return -not $moduleArtifactNames.Contains($Matches.artifact)
        }
        return $true
    }
$classpathPaths = @($mainClassesDirectory) + $moduleClassesDirectories + $dependencyPaths |
    Select-Object -Unique

$classpathUris = foreach ($path in $classpathPaths) {
    $resolvedPath = [IO.Path]::GetFullPath($path)
    if (-not (Test-Path $resolvedPath)) {
        throw "Classpath 路径不存在：$resolvedPath"
    }
    if ((Get-Item $resolvedPath).PSIsContainer) {
        $resolvedPath = $resolvedPath.TrimEnd('\', '/') + [IO.Path]::DirectorySeparatorChar
    }
    ([Uri]$resolvedPath).AbsoluteUri
}

$manifestLines = [System.Collections.Generic.List[string]]::new()
$manifestLines.Add('Manifest-Version: 1.0')
Add-ManifestHeader -Lines $manifestLines -Name 'Class-Path' -Value ($classpathUris -join ' ')
[IO.File]::WriteAllText($manifestFile, (($manifestLines -join "`r`n") + "`r`n"), [Text.Encoding]::ASCII)

Add-Type -AssemblyName System.IO.Compression.FileSystem
if (Test-Path $classpathJar) {
    Remove-Item -LiteralPath $classpathJar -Force
}
$archive = [IO.Compression.ZipFile]::Open($classpathJar, [IO.Compression.ZipArchiveMode]::Create)
try {
    $entry = $archive.CreateEntry('META-INF/MANIFEST.MF')
    $writer = [IO.StreamWriter]::new($entry.Open(), [Text.Encoding]::ASCII)
    try {
        $writer.Write([IO.File]::ReadAllText($manifestFile, [Text.Encoding]::ASCII))
    } finally {
        $writer.Dispose()
    }
} finally {
    $archive.Dispose()
}

$arguments = @(
    "-Dspring.cloud.nacos.discovery.ip=$NacosDiscoveryIp",
    "-Dlogging.file.name=$fmsLogFile",
    "-DLOG_FILE=$fmsLogFile",
    '-Dfile.encoding=UTF-8',
    '-cp', $classpathJar,
    $mainClass
)
Rotate-StartupLog -LogFile $stdoutLog
Rotate-StartupLog -LogFile $stderrLog
$process = Start-Process -FilePath 'java' -ArgumentList $arguments -WorkingDirectory $moduleDirectory `
    -RedirectStandardOutput $stdoutLog -RedirectStandardError $stderrLog -WindowStyle Hidden -PassThru

Write-Output "FMS 启动中，PID：$($process.Id)"
Write-Output "日志：$stdoutLog"

if ($NoWait) {
    return
}

$deadline = (Get-Date).AddSeconds($HealthWaitSeconds)
while ((Get-Date) -lt $deadline) {
    if (Test-Health) {
        Write-Output "FMS 已就绪：$healthUri"
        return
    }
    if ($process.HasExited) {
        $stdout = Get-Content -Raw $stdoutLog -ErrorAction SilentlyContinue
        $stderr = Get-Content -Raw $stderrLog -ErrorAction SilentlyContinue
        throw "FMS 已退出，退出码：$($process.ExitCode)。`n$stdout`n$stderr"
    }
    Start-Sleep -Seconds 2
}

throw "FMS 在 $HealthWaitSeconds 秒内未就绪，PID：$($process.Id)，日志：$stdoutLog"

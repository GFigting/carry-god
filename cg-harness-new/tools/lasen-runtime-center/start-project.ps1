[CmdletBinding()]
param(
    [ValidateSet('LASEN', 'FMS', 'All')]
    [string]$Project = 'All',
    [string]$NacosDiscoveryIp = $env:NACOS_DISCOVERY_IP,
    [string]$CustomEnvTag = $env:CUSTOM_ENV_TAG,
    [switch]$Restart,
    [switch]$NoLogViewer,
    [switch]$NoBrowser
)

$toolRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$serviceConfig = Get-Content -Raw (Join-Path $toolRoot 'runtime-services.json') | ConvertFrom-Json
& (Join-Path $toolRoot 'start-runtime-center.ps1') -NoBrowser:$NoBrowser

$selectedProjects = if ($Project -eq 'All') { @('LASEN', 'FMS') } else { @($Project) }
$results = [System.Collections.Generic.List[object]]::new()

foreach ($service in $serviceConfig.services | Where-Object { $_.startScript -and $_.project -in $selectedProjects }) {
    $entrypoint = Join-Path $toolRoot $service.startScript
    try {
        if ($service.project -eq 'LASEN' -and $service.id -eq 'backend') {
            & $entrypoint -NacosDiscoveryIp $NacosDiscoveryIp -CustomEnvTag $CustomEnvTag -Restart:$Restart -NoLogViewer:$NoLogViewer
        } elseif ($service.project -eq 'FMS' -and $service.id -eq 'backend') {
            & $entrypoint -NacosDiscoveryIp $NacosDiscoveryIp -Restart:$Restart -NoLogViewer:$NoLogViewer
        } else {
            & $entrypoint
        }
        $results.Add([pscustomobject]@{ Project = $service.project; Service = $service.name; Result = '成功或已复用'; Detail = $service.url })
    } catch {
        $results.Add([pscustomobject]@{ Project = $service.project; Service = $service.name; Result = '失败'; Detail = $_.Exception.Message })
        Write-Warning "$($service.project) $($service.name) 启动失败：$($_.Exception.Message)"
    }
}

$results | Format-Table -AutoSize | Out-Host
$failedCount = @($results | Where-Object Result -eq '失败').Count
if ($failedCount -gt 0) {
    throw "$failedCount 项服务未成功启动；其余服务已完成启动或复用。"
}

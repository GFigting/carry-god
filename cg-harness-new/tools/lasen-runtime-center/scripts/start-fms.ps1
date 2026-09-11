[CmdletBinding()]
param(
    [string]$NacosDiscoveryIp = $env:NACOS_DISCOVERY_IP,
    [ValidateRange(1, 300)]
    [int]$HealthWaitSeconds = 120,
    [switch]$NoWait,
    [switch]$NoLogViewer,
    [switch]$Restart
)

$targetScript = Join-Path $PSScriptRoot 'start-fms-classpath.ps1'
& $targetScript @PSBoundParameters

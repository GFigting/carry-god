[CmdletBinding()]
param(
    [string]$NacosDiscoveryIp = $env:NACOS_DISCOVERY_IP,
    [string]$CustomEnvTag = $env:CUSTOM_ENV_TAG,
    [ValidateRange(1, 300)]
    [int]$HealthWaitSeconds = 120,
    [switch]$NoWait,
    [switch]$NoLogViewer,
    [switch]$Restart
)

$targetScript = Join-Path $PSScriptRoot 'start-lasen-fc-classpath.ps1'
& $targetScript @PSBoundParameters

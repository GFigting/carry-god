param(
  [string]$Root = (Split-Path -Parent $PSScriptRoot)
)

$ErrorActionPreference = 'Stop'
$rootPath = (Resolve-Path -LiteralPath $Root).Path
$errors = New-Object System.Collections.Generic.List[string]
$warnings = New-Object System.Collections.Generic.List[string]

function Add-Error([string]$Message) {
  $script:errors.Add($Message) | Out-Null
}

function Add-Warning([string]$Message) {
  $script:warnings.Add($Message) | Out-Null
}

function Assert-File([string]$RelativePath) {
  $path = Join-Path $rootPath $RelativePath
  if (-not (Test-Path -LiteralPath $path -PathType Leaf)) {
    Add-Error "Missing required file: $RelativePath"
  }
}

function Read-Utf8File([string]$Path) {
  return Get-Content -Raw -Encoding UTF8 -LiteralPath $Path
}

function Get-RelativeToGitRoot([string]$Path) {
  $gitRoot = (& git -C $rootPath rev-parse --show-toplevel 2>$null)
  if ($LASTEXITCODE -ne 0 -or [string]::IsNullOrWhiteSpace($gitRoot)) {
    return $null
  }
  $full = (Resolve-Path -LiteralPath $Path).Path
  $prefix = (Resolve-Path -LiteralPath $gitRoot).Path.TrimEnd('\', '/')
  if ($full.StartsWith($prefix, [System.StringComparison]::OrdinalIgnoreCase)) {
    return $full.Substring($prefix.Length).TrimStart('\', '/') -replace '\\', '/'
  }
  return $null
}

$requiredFiles = @(
  'README.md',
  'AGENTS.md',
  'core/operating-model.md',
  'core/loading-protocol.md',
  'workflow/software-delivery.md',
  'workflow/task-lifecycle.md',
  'workflow/quality-gates.md',
  'workflow/next-action.md',
  'workflow/project-initialization.md',
  'registry/capabilities.yaml',
  'registry/project-context.template.yaml',
  'templates/task-feature.md',
  'templates/task-bugfix.md',
  'templates/task-research.md',
  'templates/code-review-report.md',
  'templates/release-report.md'
)

foreach ($file in $requiredFiles) {
  Assert-File $file
}

$capabilityFile = Join-Path $rootPath 'registry/capabilities.yaml'
if (Test-Path -LiteralPath $capabilityFile) {
  $raw = Read-Utf8File $capabilityFile
  $entries = [regex]::Matches($raw, '(?ms)^\s+- id:\s*(?<id>[^\r\n]+).*?(?=^\s+- id:|\z)')
  $ids = @()
  $names = @()
  $deepSkills = @()

  foreach ($entry in $entries) {
    $block = $entry.Value
    $id = $entry.Groups['id'].Value.Trim()
    $name = ([regex]::Match($block, '(?m)^\s+name:\s*(.+)$')).Groups[1].Value.Trim()
    $path = ([regex]::Match($block, '(?m)^\s+path:\s*(.+)$')).Groups[1].Value.Trim()
    $deepSkill = ([regex]::Match($block, '(?m)^\s+deep_skill:\s*(.+)$')).Groups[1].Value.Trim()

    $ids += $id
    $names += $name

    if ([string]::IsNullOrWhiteSpace($name)) {
      Add-Error "Capability $id has no name"
    }
    if ([string]::IsNullOrWhiteSpace($path)) {
      Add-Error "Capability $id has no path"
    } elseif (-not (Test-Path -LiteralPath (Join-Path $rootPath $path) -PathType Leaf)) {
      Add-Error "Capability $id path does not exist: $path"
    }

    if (-not [string]::IsNullOrWhiteSpace($deepSkill)) {
      $deepSkills += $deepSkill
      $skillPath = Join-Path $rootPath $deepSkill
      if (-not (Test-Path -LiteralPath $skillPath -PathType Leaf)) {
        Add-Error "Capability $id deep_skill does not exist: $deepSkill"
      } else {
        $skillRaw = Read-Utf8File $skillPath
        $skillName = ([regex]::Match($skillRaw, '(?m)^name:\s*(.+)$')).Groups[1].Value.Trim()
        $description = ([regex]::Match($skillRaw, '(?m)^description:\s*(.+)$')).Groups[1].Value.Trim()
        $expectedName = Split-Path -Leaf (Split-Path -Parent $skillPath)
        if ($skillName -ne $expectedName) {
          Add-Error "Skill name mismatch for ${deepSkill}: expected $expectedName, got $skillName"
        }
        if ([string]::IsNullOrWhiteSpace($description)) {
          Add-Error "Skill description is empty: $deepSkill"
        }
      }
    }
  }

$duplicateIds = $ids | Group-Object | Where-Object { $_.Count -gt 1 }
  foreach ($group in $duplicateIds) {
    Add-Error "Duplicate capability id: $($group.Name)"
  }
$duplicateNames = $names | Group-Object | Where-Object { $_.Count -gt 1 }
  foreach ($group in $duplicateNames) {
    Add-Error "Duplicate capability name: $($group.Name)"
  }

  $sourceFile = Join-Path $rootPath 'registry/skill-sources.yaml'
  if (Test-Path -LiteralPath $sourceFile) {
    $sourceRaw = Read-Utf8File $sourceFile
    foreach ($deepSkill in $deepSkills) {
      if ($sourceRaw -notmatch ([regex]::Escape($deepSkill))) {
        Add-Error "Deep skill is not recorded in registry/skill-sources.yaml: $deepSkill"
      }
    }
  } elseif ($deepSkills.Count -gt 0) {
    Add-Error 'registry/skill-sources.yaml is required when deep_skill mappings exist'
  }
}

$taskFeature = Read-Utf8File (Join-Path $rootPath 'templates/task-feature.md')
$taskBugfix = Read-Utf8File (Join-Path $rootPath 'templates/task-bugfix.md')
$templateAnchors = @('AC-01', 'Given/When/Then', 'S-01')
foreach ($anchor in $templateAnchors) {
  $anchorPattern = [regex]::Escape($anchor)
  if ($taskFeature -notmatch $anchorPattern) {
    Add-Error "templates/task-feature.md missing anchor: $anchor"
  }
}

$bugfixAnchors = @('AC-01', 'Given/When/Then', 'analysis.md')
foreach ($anchor in $bugfixAnchors) {
  $anchorPattern = [regex]::Escape($anchor)
  if ($taskBugfix -notmatch $anchorPattern) {
    Add-Error "templates/task-bugfix.md missing anchor: $anchor"
  }
}

$taskLifecycle = Read-Utf8File (Join-Path $rootPath 'workflow/task-lifecycle.md')
$recoveryPhrases = @('awaiting_confirmation', 'blocked', 'ready', 'in_progress', 'review', 'revision', 'cancelled')
foreach ($phrase in $recoveryPhrases) {
  $phrasePattern = [regex]::Escape($phrase)
  if ($taskLifecycle -notmatch $phrasePattern) {
    Add-Error "workflow/task-lifecycle.md missing state anchor: $phrase"
  }
}

$codegraph = Read-Utf8File (Join-Path $rootPath 'adapters/codex/codegraph.md')
$legacyCodegraphRefs = @('codegraph init', 'codegraph status', 'codegraph_search', 'codegraph_impact', 'codegraph_context')
foreach ($legacy in $legacyCodegraphRefs) {
  $legacyPattern = [regex]::Escape($legacy)
  if ($codegraph -match $legacyPattern) {
    Add-Error "adapters/codex/codegraph.md still references obsolete CodeGraph command or tool: $legacy"
  }
}
$requiredCodegraphRefs = @('codegraph-mcp', 'reindex_workspace', 'index_directory', 'get_edit_context', 'analyze_impact')
foreach ($required in $requiredCodegraphRefs) {
  $requiredPattern = [regex]::Escape($required)
  if ($codegraph -notmatch $requiredPattern) {
    Add-Error "adapters/codex/codegraph.md missing current CodeGraph reference: $required"
  }
}

$localIgnore = Join-Path $rootPath '.gitignore'
if (-not (Test-Path -LiteralPath $localIgnore -PathType Leaf)) {
  Add-Error 'Missing framework .gitignore'
} else {
  $ignoreRaw = Read-Utf8File $localIgnore
  foreach ($pattern in @('requirements-inbox/*/', 'reports/*/', 'designs/*/')) {
    if ($ignoreRaw -notmatch ([regex]::Escape($pattern))) {
      Add-Error "Framework .gitignore missing pattern: $pattern"
    }
  }

  $relativeIgnore = Get-RelativeToGitRoot $localIgnore
  if ($null -ne $relativeIgnore) {
    $gitRoot = & git -C $rootPath rev-parse --show-toplevel 2>$null
    $trackedIgnore = & git -C $gitRoot ls-files -- $relativeIgnore 2>$null
    if ([string]::IsNullOrWhiteSpace(($trackedIgnore -join ''))) {
      Add-Warning "Framework .gitignore is not tracked by Git yet: $relativeIgnore"
    }
  }
}

Write-Host "Framework validation root: $rootPath"
if ($warnings.Count -gt 0) {
  Write-Host ''
  Write-Host 'Warnings:'
  foreach ($warning in $warnings) {
    Write-Host "  - $warning"
  }
}

if ($errors.Count -gt 0) {
  Write-Host ''
  Write-Host 'Errors:'
  foreach ($errorItem in $errors) {
    Write-Host "  - $errorItem"
  }
  exit 1
}

Write-Host 'Framework validation passed.'

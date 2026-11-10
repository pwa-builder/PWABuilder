$ErrorActionPreference = 'Stop'
$workflow = Get-Content (Join-Path $PSScriptRoot '..\..\workflows\deploy-msstore-to-preview.yml') -Raw
$match = [regex]::Match($workflow, '(?ms)        id: pushed-image\r?\n.*?        run: \|\r?\n(?<script>.*?)(?=^  [a-z][\w-]*:)')
if (-not $match.Success) { throw 'Windows image publication step not found.' }
$publish = [scriptblock]::Create(($match.Groups['script'].Value -replace '(?m)^          ', ''))

function docker {
    $global:LASTEXITCODE = 0
    if ($args[0] -eq 'push' -and $global:windowsDeploymentTest.FailPush) {
        $global:LASTEXITCODE = 1
    }
    if ($args[0] -eq 'image') {
        "pwabuilder.azurecr.io/pwa-windows@sha256:$('a' * 64)"
    }
}

function az {
    $global:windowsDeploymentTest.Commands.Add(($args -join ' '))
    $global:LASTEXITCODE = $(if ($global:windowsDeploymentTest.FailLock) { 1 } else { 0 })
}

$originalTag = $env:IMAGE_TAG
$originalOutput = $env:GITHUB_OUTPUT
$outputPath = [System.IO.Path]::GetTempFileName()
try {
    $env:IMAGE_TAG = 'pwabuilder.azurecr.io/pwa-windows:staging-commit-123-1'
    $env:GITHUB_OUTPUT = $outputPath
    foreach ($case in @(
        @{ Name = 'Publishes a locked unique tag' }
        @{ Name = 'Stops when pushing fails'; FailPush = $true }
        @{ Name = 'Stops when locking fails'; FailLock = $true }
    )) {
        Clear-Content -LiteralPath $outputPath
        $global:windowsDeploymentTest = @{
            Commands = [System.Collections.Generic.List[string]]::new()
            FailPush = $case.FailPush
            FailLock = $case.FailLock
        }
        $failed = $false
        try { & $publish } catch { $failed = $true }
        $output = Get-Content -LiteralPath $outputPath -Raw
        if ($case.FailPush -or $case.FailLock) {
            if (-not $failed -or $output) { throw "$($case.Name): must not publish a deployable output on failure." }
        } else {
            if ($failed -or $output.Trim() -ne "image_reference=$env:IMAGE_TAG") {
                throw 'Windows must deploy the unique tag, not the digest.'
            }
        }
        if (-not $case.FailPush -and
            ($global:windowsDeploymentTest.Commands.Count -ne 1 -or
             $global:windowsDeploymentTest.Commands[0] -notlike 'acr repository update *--image pwa-windows:staging-commit-123-1*--write-enabled false*--delete-enabled false*')) {
            throw 'The unique Windows image tag must be locked before deployment.'
        }
        Write-Host "PASS: $($case.Name)"
    }
} finally {
    $env:IMAGE_TAG = $originalTag
    $env:GITHUB_OUTPUT = $originalOutput
    Remove-Item -LiteralPath $outputPath -Force
    Remove-Variable windowsDeploymentTest -Scope Global -ErrorAction SilentlyContinue
}

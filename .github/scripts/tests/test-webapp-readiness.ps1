$ErrorActionPreference = 'Stop'
$scriptPath = Join-Path $PSScriptRoot '..\wait-webapp-ready.ps1'
if (-not (Test-Path -LiteralPath $scriptPath)) { throw 'Deployment readiness script is missing.' }

function Invoke-WebRequest {
    param($Uri, $TimeoutSec, $MaximumRedirection, [switch] $SkipHttpErrorCheck)
    $global:readinessTest.Requests++
    if ($TimeoutSec -gt 1) { throw 'Request exceeds the remaining timeout.' }
    if ($MaximumRedirection -ne 0 -or -not $SkipHttpErrorCheck) { throw 'Must inspect HTTP status without following redirects.' }
    if ($global:readinessTest.Responses.Count -gt 1) {
        $response = $global:readinessTest.Responses.Dequeue()
    } else {
        $response = $global:readinessTest.Responses.Peek()
    }
    if ($response -eq 'connection-error') { throw 'Connection refused' }
    @{ StatusCode = [int] $response }
}

function Start-Sleep {
    Microsoft.PowerShell.Utility\Start-Sleep -Milliseconds 100
}

function az {
    $command = $args -join ' '
    $global:readinessTest.Commands.Add($command)
    $global:LASTEXITCODE = $(if ($global:readinessTest.FailDownload) { 1 } else { 0 })
    if ($command -like 'webapp list *') {
        '[{"name":"test-app","resourceGroup":"test-group"}]'
    }
}

$cases = @(
    @{ Name = 'Accepts HTTP 200'; Responses = @(200) }
    @{ Name = 'Discovers the staging resource group'; Responses = @(200); DiscoverResourceGroup = $true }
    @{ Name = 'Retries warming-up responses'; Responses = @(409, 503, 200) }
    @{ Name = 'Retries connection failures'; Responses = @('connection-error', 200) }
    @{ Name = 'Does not accept redirects as readiness'; Responses = @(302, 200) }
    @{ Name = 'Times out and downloads diagnostics'; Responses = @(503); ExpectFailure = $true }
    @{ Name = 'Does not accept redirects on timeout'; Responses = @(302); ExpectFailure = $true }
    @{ Name = 'Still fails when diagnostics download fails'; Responses = @(503); ExpectFailure = $true; FailDownload = $true }
)

foreach ($case in $cases) {
    $global:readinessTest = @{
        Requests = 0
        Responses = [System.Collections.Generic.Queue[object]]::new()
        Commands = [System.Collections.Generic.List[string]]::new()
        FailDownload = $case.FailDownload
    }
    foreach ($response in $case.Responses) { $global:readinessTest.Responses.Enqueue($response) }
    $failure = $null
    try {
        $resourceGroup = if ($case.DiscoverResourceGroup) { '' } else { 'test-group' }
        & $scriptPath -AppName test-app -ResourceGroup $resourceGroup -Slot staging `
            -Url 'https://test-app-staging.azurewebsites.net/' -TimeoutSeconds 1 `
            -PollIntervalSeconds 1 -RequestTimeoutSeconds 1
    } catch {
        $failure = $_
    }
    if ($case.ExpectFailure) {
        if (-not $failure -or $failure.Exception.Message -notlike '*did not become ready*') {
            throw "$($case.Name): must fail explicitly on readiness timeout, got $failure"
        }
        if ($global:readinessTest.Commands.Count -ne 1 -or
            $global:readinessTest.Commands[0] -notlike 'webapp log download *--name test-app*--resource-group test-group*--slot staging*--log-file *startup-logs.zip*') {
            throw "$($case.Name): must collect diagnostics for the failed slot"
        }
    } else {
        if ($failure) { throw $failure }
        if ($global:readinessTest.Requests -ne $case.Responses.Count) {
            throw "$($case.Name): must wait for HTTP 200"
        }
        $expectedCommands = if ($case.DiscoverResourceGroup) { 1 } else { 0 }
        if ($global:readinessTest.Commands.Count -ne $expectedCommands) { throw 'Successful readiness must not download logs.' }
    }
    Remove-Variable readinessTest -Scope Global
    Write-Host "PASS: $($case.Name)"
}

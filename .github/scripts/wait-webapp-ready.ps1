param(
    [Parameter(Mandatory)][string] $AppName,
    [Parameter(Mandatory)][string] $Slot,
    [Parameter(Mandatory)][uri] $Url,
    [string] $ResourceGroup,
    [ValidateRange(1, 3600)][int] $TimeoutSeconds = 1800,
    [ValidateRange(1, 60)][int] $PollIntervalSeconds = 15,
    [ValidateRange(1, 60)][int] $RequestTimeoutSeconds = 30
)

$ErrorActionPreference = 'Stop'
if (-not $ResourceGroup) {
    $appsJson = & az webapp list --only-show-errors --output json
    if ($LASTEXITCODE -ne 0) { throw 'Could not list App Services for readiness verification.' }
    $apps = @($appsJson -join "`n" | ConvertFrom-Json | Where-Object { $_.name -eq $AppName })
    if ($apps.Count -ne 1) { throw "Could not uniquely find App Service '$AppName'." }
    $ResourceGroup = $apps[0].resourceGroup
}

$timer = [System.Diagnostics.Stopwatch]::StartNew()
while ($timer.Elapsed.TotalSeconds -lt $TimeoutSeconds) {
    $remaining = $TimeoutSeconds - $timer.Elapsed.TotalSeconds
    $requestTimeout = [Math]::Min($RequestTimeoutSeconds, [Math]::Max(1, [Math]::Floor($remaining)))
    try {
        $response = Invoke-WebRequest -Uri $Url -TimeoutSec $requestTimeout `
            -MaximumRedirection 0 -SkipHttpErrorCheck
        if ($response.StatusCode -eq 200) {
            Write-Host "Ready: $AppName/$Slot returned HTTP 200."
            return
        }
        Write-Host "Waiting for $AppName/${Slot}: HTTP $($response.StatusCode)."
    } catch {
        Write-Host "Waiting for $AppName/${Slot}: $($_.Exception.Message)"
    }
    $remainingMilliseconds = [Math]::Max(0, ($TimeoutSeconds - $timer.Elapsed.TotalSeconds) * 1000)
    if ($remainingMilliseconds -gt 0) {
        Start-Sleep -Milliseconds ([int] [Math]::Min($PollIntervalSeconds * 1000, $remainingMilliseconds))
    }
}

$logDirectory = if ($env:RUNNER_TEMP) { $env:RUNNER_TEMP } else { [System.IO.Path]::GetTempPath() }
$logPath = Join-Path $logDirectory "$AppName-$Slot-startup-logs.zip"
Write-Host "Readiness timed out. Downloading platform diagnostics to $logPath."
& az webapp log download --name $AppName --resource-group $ResourceGroup --slot $Slot `
    --log-file $logPath --only-show-errors
if ($LASTEXITCODE -ne 0) { Write-Warning "Could not download diagnostics for $AppName/$Slot." }
throw "$AppName/$Slot did not become ready (HTTP 200) within $TimeoutSeconds seconds."

param(
    [Parameter(Mandatory)][ValidateSet('Deploy', 'Delete')][string] $Operation,
    [Parameter(Mandatory)][string] $AppName,
    [Parameter(Mandatory)][int] $PullRequestNumber,
    [Parameter(Mandatory)][string] $Repository,
    [string] $SourceSlot,
    [string] $ImageReference,
    [string] $ExpectedHeadSha
)

$ErrorActionPreference = 'Stop'
if ($PullRequestNumber -le 0) { throw 'A positive PR number is required.' }
$slot = "pr-$PullRequestNumber"

function Invoke-Azure([string[]] $Arguments) {
    $result = & az @Arguments --only-show-errors --output json
    if ($LASTEXITCODE -ne 0) {
        throw "Azure CLI failed: $($Arguments[0..2] -join ' ')"
    }
    if ($result) { return ($result -join "`n" | ConvertFrom-Json) }
}

function Set-SlotConfiguration([string] $Url, [object] $Properties) {
    $path = [System.IO.Path]::GetTempFileName()
    try {
        if (-not $IsWindows) {
            [System.IO.File]::SetUnixFileMode($path,
                [System.IO.UnixFileMode]::UserRead -bor [System.IO.UnixFileMode]::UserWrite)
        }
        @{ properties = $Properties } | ConvertTo-Json -Depth 20 -Compress |
            Set-Content -LiteralPath $path -Encoding utf8
        # Keep configuration values out of arguments, logs, and app-wide sticky metadata.
        Invoke-Azure @('rest', '--method', 'put', '--url', $Url, '--body', "@$path") | Out-Null
    } finally {
        Remove-Item -LiteralPath $path -Force
    }
}

# Recheck after acquiring the workflow concurrency lock, including cleanup after reopening.
$prJson = & gh api "repos/$Repository/pulls/$PullRequestNumber"
if ($LASTEXITCODE -ne 0) { throw 'Could not verify the current PR state.' }
$pr = $prJson -join "`n" | ConvertFrom-Json
if ($Operation -eq 'Deploy') {
    if (-not $SourceSlot -or -not $ImageReference -or -not $ExpectedHeadSha) {
        throw 'Deploy requires a source slot, immutable image reference, and expected PR head SHA.'
    }
    if ($pr.state -eq 'closed') {
        # GitHub keeps only one pending concurrency job; a late build can displace cleanup.
        $Operation = 'Delete'
    } elseif ($pr.state -ne 'open' -or $pr.head.sha -ne $ExpectedHeadSha -or
        $pr.head.repo.full_name -ne $Repository -or $pr.base.ref -ne 'main') {
        Write-Host 'Skipping deployment: PR is superseded or outside the trusted PR scope.'
        return
    }
} elseif ($pr.state -ne 'closed') {
    Write-Host 'Skipping cleanup: PR is open again.'
    return
}

$apps = @(Invoke-Azure @('webapp', 'list'))
$app = @($apps | Where-Object { $_.name -eq $AppName })
if ($app.Count -ne 1) { throw "Could not uniquely find App Service '$AppName' in the configured subscription." }
$resourceGroup = $app[0].resourceGroup
$target = @('--name', $AppName, '--resource-group', $resourceGroup, '--slot', $slot)
$slots = @(Invoke-Azure @('webapp', 'deployment', 'slot', 'list', '--name', $AppName, '--resource-group', $resourceGroup))
$exists = @($slots | Where-Object { ($_.name -split '/')[-1] -eq $slot }).Count -gt 0

if ($Operation -eq 'Delete') {
    if ($exists) {
        Invoke-Azure (@('webapp', 'deployment', 'slot', 'delete') + $target) | Out-Null
        Write-Host "Deleted $AppName/$slot."
    } else {
        Write-Host "No slot to delete for $AppName/$slot."
    }
    return
}

$source = @('--name', $AppName, '--resource-group', $resourceGroup, '--slot', $SourceSlot)
$config = Invoke-Azure (@('webapp', 'config', 'show') + $source)
if ($config.autoSwapSlotName) {
    throw "Disable auto-swap on $AppName/$SourceSlot before cloning PR slots."
}
$identity = Invoke-Azure (@('webapp', 'identity', 'show') + $source)
$userIdentities = @()
if ($identity.userAssignedIdentities) {
    $userIdentities = @($identity.userAssignedIdentities.PSObject.Properties)
}
if ($identity.type -like '*SystemAssigned*' -and $userIdentities.Count -eq 0) {
    throw "The system-assigned identity of $AppName/$SourceSlot cannot be cloned. Attach a preauthorized user-assigned identity before enabling PR deployments."
}
$clientId = $null
if ($userIdentities.Count -gt 0) {
    $selected = if ($config.acrUserManagedIdentityID) {
        @($userIdentities | Where-Object { $_.Value.clientId -eq $config.acrUserManagedIdentityID })
    } else { $userIdentities }
    if ($selected.Count -ne 1) {
        throw "Cannot uniquely select a preauthorized user-assigned identity for $AppName/$SourceSlot. Configure acrUserManagedIdentityID to select an attached identity."
    }
    $clientId = $selected[0].Value.clientId
} elseif ($config.acrUseManagedIdentityCreds) {
    throw "Managed-identity registry access for $AppName/$SourceSlot requires an attached user-assigned identity."
}
$sourceSite = Invoke-Azure (@('webapp', 'show') + $source)
if (-not $sourceSite.id) { throw 'Azure did not return the source slot resource ID.' }
$targetId = $sourceSite.id -replace '/slots/[^/]+$', "/slots/$slot"
if ($targetId -eq $sourceSite.id) { throw 'Expected a source deployment slot resource ID.' }
$apiVersion = '2023-12-01'
$sourceUrl = "https://management.azure.com$($sourceSite.id)"
$targetUrl = "https://management.azure.com$targetId"
$settings = Invoke-Azure @('rest', '--method', 'post', '--url', "$sourceUrl/config/appsettings/list?api-version=$apiVersion")
$connections = Invoke-Azure @('rest', '--method', 'post', '--url', "$sourceUrl/config/connectionstrings/list?api-version=$apiVersion")
if ($null -eq $settings.properties -or $null -eq $connections.properties) {
    throw 'Azure did not return source app settings and connection string properties.'
}
if ($clientId) {
    $settings.properties | Add-Member -NotePropertyName AZURE_CLIENT_ID -NotePropertyValue $clientId -Force
    $runtimeIdentity = $settings.properties.PSObject.Properties['AppSettings__AzureManagedIdentityApplicationId']
    if ($runtimeIdentity -and [string]::IsNullOrWhiteSpace($runtimeIdentity.Value)) {
        $runtimeIdentity.Value = $clientId
    }
}
if (-not $exists) {
    Invoke-Azure (@('webapp', 'deployment', 'slot', 'create') + $target +
        @('--configuration-source', $SourceSlot, '--container-image-name', $ImageReference)) | Out-Null
}
if ($userIdentities.Count -gt 0) {
    Invoke-Azure (@('webapp', 'identity', 'assign') + $target + @('--identities') + @($userIdentities.Name)) | Out-Null
}
if ($sourceSite.virtualNetworkSubnetId) {
    $subnet = $sourceSite.virtualNetworkSubnetId
    $vnet = $subnet -replace '/subnets/[^/]+$', ''
    # The source subnet is already delegated; avoid requiring permissions on the whole VNet.
    Invoke-Azure (@('webapp', 'vnet-integration', 'add') + $target +
        @('--vnet', $vnet, '--subnet', $subnet, '--skip-delegation-check')) | Out-Null
}
$targetConfig = @{ autoSwapSlotName = '' }
if ($config.acrUseManagedIdentityCreds) {
    $targetConfig.acrUseManagedIdentityCreds = $true
    $targetConfig.acrUserManagedIdentityID = $clientId
}
Invoke-Azure (@('webapp', 'config', 'set') + $target +
    @('--generic-configurations', ($targetConfig | ConvertTo-Json -Compress))) | Out-Null
Set-SlotConfiguration "$targetUrl/config/appsettings?api-version=$apiVersion" $settings.properties
Set-SlotConfiguration "$targetUrl/config/connectionstrings?api-version=$apiVersion" $connections.properties
Invoke-Azure (@('webapp', 'config', 'container', 'set') + $target +
    @('--container-image-name', $ImageReference)) | Out-Null
Invoke-Azure (@('webapp', 'restart') + $target) | Out-Null
$deployed = Invoke-Azure (@('webapp', 'show') + $target)
if (-not $deployed.defaultHostName) { throw 'Azure did not return the PR slot hostname.' }
$url = "https://$($deployed.defaultHostName)"
if ($env:GITHUB_OUTPUT) { "url=$url" | Out-File -FilePath $env:GITHUB_OUTPUT -Append -Encoding utf8 }
if ($env:GITHUB_STEP_SUMMARY) {
    "PR #${PullRequestNumber}: [$AppName/$slot]($url)" |
        Out-File -FilePath $env:GITHUB_STEP_SUMMARY -Append -Encoding utf8
}
Write-Host "Deployed $AppName/$slot to $url."

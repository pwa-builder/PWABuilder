$ErrorActionPreference = 'Stop'
$scriptPath = Join-Path $PSScriptRoot '..\manage-pr-slot.ps1'

function az {
    $command = $args -join ' '
    $global:prSlotTest.Commands.Add($command)
    $global:LASTEXITCODE = 0
    if ($command -like 'rest --method put *') {
        $bodyIndex = [Array]::IndexOf($args, '--body')
        $global:prSlotTest.BodyFiles.Add($args[$bodyIndex + 1].Substring(1))
    }
    if ($global:prSlotTest.FailCommand -and $command.StartsWith($global:prSlotTest.FailCommand)) {
        $global:LASTEXITCODE = 1
        return
    }
    switch -Wildcard ($command) {
        'webapp list *' { '[{"name":"test-app","resourceGroup":"test-group"}]' }
        'webapp deployment slot list *' { ConvertTo-Json -InputObject @($global:prSlotTest.Slots) -Compress }
        'webapp config show *' { $global:prSlotTest.Config | ConvertTo-Json -Compress -Depth 10 }
        'webapp identity show *' { $global:prSlotTest.Identity | ConvertTo-Json -Compress -Depth 10 }
        'webapp show *--slot staging *' {
            @{ id = '/subscriptions/test/resourceGroups/test-group/providers/Microsoft.Web/sites/test-app/slots/staging'; virtualNetworkSubnetId = $global:prSlotTest.Subnet } |
                ConvertTo-Json -Compress
            break
        }
        'webapp show *' { '{"defaultHostName":"test-app-pr-123.azurewebsites.net"}' }
        'rest --method post *config/appsettings/list*' { @{ properties = $global:prSlotTest.Settings } | ConvertTo-Json -Compress }
        'rest --method post *config/connectionstrings/list*' { @{ properties = $global:prSlotTest.ConnectionStrings } | ConvertTo-Json -Compress -Depth 10 }
        'rest --method put *' {
            $bodyIndex = [Array]::IndexOf($args, '--body')
            $path = $args[$bodyIndex + 1].Substring(1)
            $body = Get-Content -LiteralPath $path -Raw | ConvertFrom-Json -AsHashtable
            $global:prSlotTest.Bodies.Add(@{ Command = $command; Body = $body })
            '{}'
        }
        default { '{}' }
    }
}

function gh {
    $global:LASTEXITCODE = 0
    if ($global:prSlotTest.FailCommand -eq 'gh') {
        $global:LASTEXITCODE = 1
        return
    }
    $global:prSlotTest.Pr | ConvertTo-Json -Compress -Depth 10
}

function Assert-True([bool] $Condition, [string] $Message) {
    if (-not $Condition) { throw $Message }
}

$cases = @(
    @{ Name = 'Creates a PR slot from staging'; Operation = 'Deploy'; Expect = 'create' }
    @{ Name = 'Updates an existing slot without recreating it'; Operation = 'Deploy'; Slots = @(@{ name = 'test-app/pr-123' }); Expect = 'update' }
    @{ Name = 'Late build cleans up a closed PR even if it displaced pending cleanup'; Operation = 'Deploy'; State = 'closed'; Slots = @(@{ name = 'test-app/pr-123' }); Expect = 'delete' }
    @{ Name = 'Does not deploy an obsolete commit'; Operation = 'Deploy'; Sha = 'newer'; Expect = 'skip' }
    @{ Name = 'Deletes a closed PR slot'; Operation = 'Delete'; State = 'closed'; Slots = @(@{ name = 'test-app/pr-123' }); Expect = 'delete' }
    @{ Name = 'Missing slot cleanup is idempotent'; Operation = 'Delete'; State = 'closed'; Expect = 'absent' }
    @{ Name = 'Does not delete a reopened PR slot'; Operation = 'Delete'; Expect = 'skip' }
    @{ Name = 'Copies user-assigned identities'; Operation = 'Deploy'; Identity = @{ type = 'UserAssigned'; userAssignedIdentities = @{ '/subscriptions/test/identities/pull' = @{ clientId = 'client' } } }; Expect = 'identity' }
    @{ Name = 'Copies sticky settings and typed connection strings'; Operation = 'Deploy'; Settings = @{ StickySetting = 'test-value'; QuotedSetting = 'spaces "quotes" & symbols' }; ConnectionStrings = @{ StagingDatabase = @{ value = 'test-connection'; type = 'SQLAzure' } }; Expect = 'settings' }
    @{ Name = 'Copies sticky settings again when updating a slot'; Operation = 'Deploy'; Slots = @(@{ name = 'test-app/pr-123' }); Settings = @{ StickySetting = 'updated-value' }; Expect = 'settings' }
    @{ Name = 'Uses existing user identity when source also has system identity'; Operation = 'Deploy'; Identity = @{ type = 'SystemAssigned, UserAssigned'; userAssignedIdentities = @{ '/subscriptions/test/identities/pull' = @{ clientId = 'client' } } }; Config = @{ acrUseManagedIdentityCreds = $true }; Expect = 'combined-identity' }
    @{ Name = 'Selects reusable identity for a runtime setting that defaulted to system identity'; Operation = 'Deploy'; Identity = @{ type = 'SystemAssigned, UserAssigned'; userAssignedIdentities = @{ '/subscriptions/test/identities/pull' = @{ clientId = 'client' } } }; Settings = @{ AppSettings__AzureManagedIdentityApplicationId = '' }; Expect = 'runtime-identity' }
    @{ Name = 'Reuses configured ACR identity when multiple identities are attached'; Operation = 'Deploy'; Identity = @{ type = 'SystemAssigned, UserAssigned'; userAssignedIdentities = @{ '/subscriptions/test/identities/pull' = @{ clientId = 'client' }; '/subscriptions/test/identities/other' = @{ clientId = 'other-client' } } }; Config = @{ acrUseManagedIdentityCreds = $true; acrUserManagedIdentityID = 'client' }; Expect = 'combined-identity' }
    @{ Name = 'Rejects ambiguous user identity selection'; Operation = 'Deploy'; Identity = @{ type = 'SystemAssigned, UserAssigned'; userAssignedIdentities = @{ '/subscriptions/test/identities/pull' = @{ clientId = 'client' }; '/subscriptions/test/identities/other' = @{ clientId = 'other-client' } } }; Expect = 'error' }
    @{ Name = 'Rejects unattached configured ACR identity'; Operation = 'Deploy'; Identity = @{ type = 'UserAssigned'; userAssignedIdentities = @{ '/subscriptions/test/identities/pull' = @{ clientId = 'client' } } }; Config = @{ acrUseManagedIdentityCreds = $true; acrUserManagedIdentityID = 'unattached' }; Expect = 'error' }
    @{ Name = 'Joins staging subnet for new slot'; Operation = 'Deploy'; Subnet = '/subscriptions/test/resourceGroups/network/providers/Microsoft.Network/virtualNetworks/staging/subnets/apps'; Expect = 'network' }
    @{ Name = 'Reapplies subnet integration for an existing slot'; Operation = 'Deploy'; Slots = @(@{ name = 'test-app/pr-123' }); Subnet = '/subscriptions/test/resourceGroups/network/providers/Microsoft.Network/virtualNetworks/staging/subnets/apps'; Expect = 'network' }
    @{ Name = 'Rejects unprovisioned system-assigned identity'; Operation = 'Deploy'; Identity = @{ type = 'SystemAssigned'; principalId = 'principal' }; Expect = 'error' }
    @{ Name = 'Rejects auto-swap configuration'; Operation = 'Deploy'; Config = @{ autoSwapSlotName = 'production' }; Expect = 'error' }
    @{ Name = 'Surfaces Azure listing errors'; Operation = 'Deploy'; Fail = 'webapp deployment slot list'; Expect = 'error' }
    @{ Name = 'Surfaces slot creation errors'; Operation = 'Deploy'; Fail = 'webapp deployment slot create'; Expect = 'error' }
    @{ Name = 'Surfaces slot deletion errors'; Operation = 'Delete'; State = 'closed'; Slots = @(@{ name = 'test-app/pr-123' }); Fail = 'webapp deployment slot delete'; Expect = 'error' }
    @{ Name = 'Surfaces settings read errors'; Operation = 'Deploy'; Fail = 'rest --method post'; Expect = 'error' }
    @{ Name = 'Surfaces settings copy errors'; Operation = 'Deploy'; Fail = 'rest --method put'; Expect = 'error' }
    @{ Name = 'Surfaces identity assignment errors'; Operation = 'Deploy'; Identity = @{ type = 'UserAssigned'; userAssignedIdentities = @{ '/subscriptions/test/identities/pull' = @{ clientId = 'client' } } }; Fail = 'webapp identity assign'; Expect = 'error' }
    @{ Name = 'Surfaces subnet integration errors'; Operation = 'Deploy'; Subnet = '/subscriptions/test/resourceGroups/network/providers/Microsoft.Network/virtualNetworks/staging/subnets/apps'; Fail = 'webapp vnet-integration add'; Expect = 'error' }
    @{ Name = 'Fails closed when GitHub is unavailable'; Operation = 'Deploy'; Fail = 'gh'; Expect = 'error' }
)

foreach ($case in $cases) {
    $global:prSlotTest = [pscustomobject]@{
        Commands = [System.Collections.Generic.List[string]]::new()
        Slots = $(if ($case.ContainsKey('Slots')) { $case.Slots } else { @() })
        Config = $(if ($case.ContainsKey('Config')) { $case.Config } else { @{ autoSwapSlotName = '' } })
        Identity = $(if ($case.ContainsKey('Identity')) { $case.Identity } else { @{ type = 'None' } })
        FailCommand = $case.Fail
        Settings = $(if ($case.ContainsKey('Settings')) { $case.Settings } else { @{} })
        ConnectionStrings = $(if ($case.ContainsKey('ConnectionStrings')) { $case.ConnectionStrings } else { @{} })
        Subnet = $case.Subnet
        Bodies = [System.Collections.Generic.List[object]]::new()
        BodyFiles = [System.Collections.Generic.List[string]]::new()
        Pr = @{
            state = $(if ($case.State) { $case.State } else { 'open' })
            head = @{
                sha = $(if ($case.Sha) { $case.Sha } else { 'expected' })
                repo = @{ full_name = 'owner/repo' }
            }
            base = @{ ref = 'main' }
        }
    }
    $failed = $false
    try {
        & $scriptPath -Operation $case.Operation -AppName test-app -SourceSlot staging `
            -PullRequestNumber 123 -Repository owner/repo -ExpectedHeadSha expected `
            -ImageReference 'registry/image@sha256:abc'
    } catch {
        $failed = $true
        if ($case.Expect -ne 'error') { throw }
    }
    Assert-True ($failed -eq ($case.Expect -eq 'error')) "$($case.Name): unexpected error result"
    $creates = @($global:prSlotTest.Commands | Where-Object { $_ -like 'webapp deployment slot create *' })
    $deletes = @($global:prSlotTest.Commands | Where-Object { $_ -like 'webapp deployment slot delete *' })
    $updates = @($global:prSlotTest.Commands | Where-Object { $_ -like 'webapp config container set *' })
    switch ($case.Expect) {
        'create' {
            Assert-True ($creates.Count -eq 1 -and $creates[0] -like '*--configuration-source staging*') 'Must clone staging'
            Assert-True ($updates.Count -eq 1 -and $updates[0] -like '*--slot pr-123*') 'Must deploy only to PR slot'
        }
        'update' { Assert-True ($creates.Count -eq 0 -and $updates.Count -eq 1) 'Must reuse existing slot' }
        'delete' { Assert-True ($deletes.Count -eq 1 -and $deletes[0] -like '*--slot pr-123*') 'Must delete only PR slot' }
        'absent' { Assert-True ($deletes.Count -eq 0) 'Must not delete a missing slot' }
        'skip' { Assert-True ($global:prSlotTest.Commands.Count -eq 0) 'Must not contact Azure for stale PR events' }
        'identity' { Assert-True (@($global:prSlotTest.Commands | Where-Object { $_ -like 'webapp identity assign *--identities /subscriptions/test/identities/pull*' }).Count -eq 1) 'Must assign source user identity' }
        'settings' {
            $appSettings = @($global:prSlotTest.Bodies | Where-Object { $_.Command -like '*slots/pr-123/config/appsettings?*' })
            Assert-True ($appSettings.Count -eq 1) 'Must write settings to PR slot'
            Assert-True ($appSettings[0].Body.properties.StickySetting -eq $case.Settings.StickySetting) 'Must retain sticky setting values'
            if ($case.Settings.QuotedSetting) {
                Assert-True ($appSettings[0].Body.properties.QuotedSetting -eq $case.Settings.QuotedSetting) 'Must preserve quotes and special characters'
            }
            if ($case.ConnectionStrings) {
                $connections = @($global:prSlotTest.Bodies | Where-Object { $_.Command -like '*slots/pr-123/config/connectionstrings?*' })
                Assert-True ($connections.Count -eq 1) 'Must copy typed connection strings'
                Assert-True ($connections[0].Body.properties.StagingDatabase.type -eq 'SQLAzure') 'Must preserve connection string type'
                Assert-True ($connections[0].Body.properties.StagingDatabase.value -eq 'test-connection') 'Must preserve connection string value'
            }
        }
        'combined-identity' {
            $identityConfig = @($global:prSlotTest.Commands | Where-Object { $_ -like 'webapp config set *acrUserManagedIdentityID*' })
            Assert-True ($identityConfig.Count -eq 1 -and $identityConfig[0] -like '*"acrUserManagedIdentityID":"client"*') 'Must select preauthorized user identity for ACR'
        }
        'runtime-identity' {
            $appSettings = @($global:prSlotTest.Bodies | Where-Object { $_.Command -like '*slots/pr-123/config/appsettings?*' })
            Assert-True ($appSettings[0].Body.properties.AppSettings__AzureManagedIdentityApplicationId -eq 'client') 'Must explicitly select user identity for C# runtime'
            Assert-True ($appSettings[0].Body.properties.AZURE_CLIENT_ID -eq 'client') 'Must explicitly select user identity for DefaultAzureCredential'
        }
        'network' {
            $networkCommands = @($global:prSlotTest.Commands | Where-Object { $_ -like 'webapp vnet-integration add *' })
            Assert-True ($networkCommands.Count -eq 1 -and $networkCommands[0] -like "*--slot pr-123*--subnet $($case.Subnet)*") 'Must join the source subnet on PR slot only'
            Assert-True ($networkCommands[0] -like '*--skip-delegation-check*') 'Must not require read access to the whole VNet'
        }
        'error' { Assert-True ($updates.Count -eq 0) 'Must not deploy after an error' }
    }
    foreach ($path in $global:prSlotTest.BodyFiles) {
        Assert-True (-not (Test-Path -LiteralPath $path)) 'Temporary configuration file must be removed'
    }
    Assert-True (@($global:prSlotTest.Commands | Where-Object { $_ -like '*slotConfigNames*' }).Count -eq 0) 'Must not change app-wide sticky setting metadata'
    $writes = @($global:prSlotTest.Commands | Where-Object { $_ -like 'rest --method put *' })
    Assert-True (@($writes | Where-Object { $_ -notlike '*slots/pr-123/*' }).Count -eq 0) 'Settings writes must target PR slot only'
    Assert-True (@($global:prSlotTest.Commands | Where-Object { $_ -like '*test-connection*' -or $_ -like '*test-value*' }).Count -eq 0) 'Do not put configuration values in command arguments'
    Remove-Variable prSlotTest -Scope Global
    Write-Host "PASS: $($case.Name)"
}

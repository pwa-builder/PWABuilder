$key = 'HKLM:\SOFTWARE\Microsoft\Windows\CurrentVersion\AppModelUnlock'
$isDeveloperMode = (Get-ItemProperty -Path $key -Name AllowDevelopmentWithoutDevLicense).AllowDevelopmentWithoutDevLicense

if($isDeveloperMode)
{
    $appxmanifest = 'EdgeHTML-sideload\AppxManifest.xml'

    if(Test-Path $appxmanifest) {
        try {
            Add-AppxPackage -Register $appxmanifest

            Write-Host "$$APP_DISPLAY_NAME$$ installed. Launching..."
			
			$app = Get-StartApps "$$APP_DISPLAY_NAME$$"

			# If it's an array, then we found multiple matching apps. Grab the last one.
			if ($app -is [array]) {
				Write-Host "Warning: found multiple apps installed named $$APP_DISPLAY_NAME$$. Launching best guess. If the wrong app launches, find the right one in your start menu."
				$app = $app[-1];
			}

			if ($app) {
				start ("shell:AppsFolder\" + $app.AppId)
			} else {
				Write-Host "Couldn't find installed app. If there are no errors above, you can find the app in your start menu"
			}
        } catch {
            $ErrorMessage = $_.Exception.Message
            Write-Host "Error installing package: " + $ErrorMessage
        }
    } else {
        Write-Host "Missing AppxManifest.xml"
    }
}
else {
    Write-Host "Error: The App was not installed.  It is likely because your computer needs to be in developer mode to install this test app. Please change your system to developer mode and run this script again."
}

Write-Host "Press any key to continue ..."
$host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")

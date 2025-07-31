# Check that we're on a supported Windows version
$currentWindowsVersion = (Get-WmiObject Win32_OperatingSystem).Version -as [Version]
$minWindowsVersion = "10.0.19041" -as [Version]
if ($currentWindowsVersion -And $currentWindowsVersion -lt $minWindowsVersion) {
	throw "To install your app, you need to be running Windows version " + $minWindowsVersion + " or greater"
}

# Install the app using pwainstaller.exe
Write-Host "Installing $$APP_DISPLAY_NAME$$..."
$currentDir = Get-Location
$msixPath = ($currentDir.Path + "\" + "$$MSIX_FILE_NAME$$")
$installProc = Start-Process -FilePath "utils\pwainstaller.exe" -ArgumentList `"$msixPath`" -NoNewWindow -PassThru
$handle = $installProc.Handle # cache pro.Handle, see https://stackoverflow.com/a/23797762/536
$exitedNormally = $installProc.WaitForExit(10000)

# Launch the app
if ($installProc.ExitCode -eq 0) {
	$app = Get-StartApps "$$APP_DISPLAY_NAME$$"

	# If it's an array, then we found multiple matching apps. Grab the last one.
	if ($app -is [array]) {
		Write-Host "Warning: found multiple apps installed named $$APP_DISPLAY_NAME$$. Launching best guess. If the wrong app launches, find the right one in your start menu."
		$app = $app[-1];
	}

	if ($app) {
		Write-Host "Launching $$APP_DISPLAY_NAME$$..."
		start ("shell:AppsFolder\" + $app.AppId)
	} else {
		Write-Host "Couldn't find installed app. If there are no errors above, you can find the app in your start menu"
	}
} else {
	Write-Error ("Installation failed, exit code " + $installProc.ExitCode)
	Read-Host -Prompt "Press enter to exit"
}
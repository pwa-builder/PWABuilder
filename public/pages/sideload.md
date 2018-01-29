# Sideloading PWAs in Windows 10

Until the relase of "Redstone 4" in early 2018, testing installation PWAs in  Windows is a little more challenging as Service Worker support is not yet on by default in non-browser scenarios. As such, in order to test with Service Workers intact, you’ll need to follow these steps.

## Not on the Windows Insider "Fast" ring yet?

Before you can proceed, you’ll need a machine running the latest Windows Insider "Fast" builds. Here’s what you need to do:

1. Grab your Windows 10 machine (or launch a [Windows 10 VM](https://developer.microsoft.com/en-us/microsoft-edge/tools/vms/)).
2. Join the [Windows Insiders](https://insider.windows.com/en-us/) program.
3. Set up the machine to get Windows Insider builds (`Settings > Update & Security > Windows Insider Program`).
4. Join the “Fast” ring for builds.
5. Update the computer.

## Already on the "Fast" ring?

1. Be sure Windows is in "developer mode" (`Settings > Update & Security > For Developers`)
2. Visit [PWA Builder](https://preview.pwabuilder.com) and enter your PWA’s URL.
3. Follow the steps, skipping over any that are unnecessary, until you reach the "build" step.
4. Tap the "Download" button under "Windows 10" to get your PWA’s AppX container.
5. Unzip the AppX and open it in the File Explorer.
6. Right click (or use the context menu) on `projects\PWA\Store packages\windows10\test_install.ps1` and choose "Run with powershell".
7. Open your app from the Start Menu.

Now you should be good to go. Happy testing!
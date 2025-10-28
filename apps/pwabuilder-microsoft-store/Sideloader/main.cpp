#include "pch.h"
#include <unknwn.h>
#include <winrt/Windows.ApplicationModel.h>
#include <winrt/Windows.Foundation.h>
#include <winrt/Windows.Management.Deployment.h>
#include <string>
#include <iostream>


using namespace winrt;
using namespace Windows::Foundation;
using namespace Windows::Management::Deployment;
using namespace Windows::Storage;
using namespace winrt;
using namespace Windows::Foundation;

int InstallPWA(const std::wstring& msixPath)
{
    std::wcout << L"Installing: " << msixPath << std::endl;
    Uri uri(msixPath);
    PackageManager packageManager;
    AddPackageOptions options;
    options.AllowUnsigned(true);
    options.DeferRegistrationWhenPackagesAreInUse(true);
    IPackageManager9 packageManger9 = packageManager.as<IPackageManager9>();
    auto result = packageManger9.AddPackageByUriAsync(uri, options).get();
    if (result.ExtendedErrorCode() == 0)
    {
        std::wcout << L"Install complete" << std::endl;
    }
    else
    {
        std::wcout << result.ErrorText().c_str() << std::endl;
    }
    return result.ExtendedErrorCode();
}

int wmain(int argc, wchar_t* argv[])
{
    init_apartment();

    if (argc != 2)
    {
        std::wstring appName = argv[0];
        std::wcout << L"Usage: " << appName << L" [path to msix file]" << std::endl;
        return -1;
    }
    
    return InstallPWA(argv[1]);
}

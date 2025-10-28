//*********************************************************
//
// Copyright (c) Microsoft. All rights reserved.
// THIS CODE IS PROVIDED *AS IS* WITHOUT WARRANTY OF
// ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING ANY
// IMPLIED WARRANTIES OF FITNESS FOR A PARTICULAR
// PURPOSE, MERCHANTABILITY, OR NON-INFRINGEMENT.
//
//*********************************************************

#include "framework.h"
#include <string>
#include "edgehelper.h"

int APIENTRY wWinMain(_In_ HINSTANCE hInstance,
    _In_opt_ HINSTANCE hPrevInstance,
    _In_ LPWSTR    lpCmdLine,
    _In_ int       nCmdShow)
{
    UNREFERENCED_PARAMETER(hPrevInstance);
    UNREFERENCED_PARAMETER(lpCmdLine);

    EdgeHelper edgeHelper;

    std::wstring path = edgeHelper.GetAppExecutableDirectory();
    path.append(L"\\pwa.json");
    //auto path = L"D:\\Dev\\dale-stammen-edge-pwa-store\\PWALauncher\\Debug\\pwa.json";
    
    return edgeHelper.LaunchPWA(path);
}

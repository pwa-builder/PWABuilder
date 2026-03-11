// Copyright (C) Microsoft Corporation. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

#pragma once

#include "framework.h"
#include "TraceLogging.h"
#include <string>

class EdgeHelper
{
public:
    HRESULT LaunchPWA(const std::wstring& pwaUrl, const std::wstring& appId, const std::wstring& aumid);
    HRESULT LaunchPWA(const std::wstring& paramsFilePath);
    std::wstring GetAppExecutableDirectory();

private:
    HRESULT LaunchUrl(const std::wstring url);
    int GetEdgeVersion(const std::wstring& edgeFilePath);
    std::wstring FindEdgeStablePath();
    std::wstring GetAppAumid();

    HRESULT GetEdgeProxyPath(
        const std::wstring& strDirectoryPath,
        const std::wstring& strWildcard,
        std::wstring& filePath,
        BOOL bRecurse
    );

    TraceLogging m_logger;
};



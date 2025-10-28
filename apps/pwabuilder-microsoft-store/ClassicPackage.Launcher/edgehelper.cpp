#include "framework.h"
#include "edgehelper.h"
#include "rapidjson/document.h" // will include "rapidjson/rapidjson.h"
#include "rapidjson/filereadstream.h"
#include "rapidjson/error/en.h"
#include <shellapi.h>
#include <appmodel.h>
#include <fstream>
#include <string>
#include <sstream>
#include <streambuf>
#include <memory>
#include <vector>

using namespace rapidjson;

static const std::wstring sGetEdgeUrl = L"microsoft-edge:https://go.microsoft.com/fwlink/?linkid=2152620";
static const std::wstring sEdgeTooOldUrl = L"microsoft-edge:https://go.microsoft.com/fwlink/?linkid=2158139";

std::wstring EdgeHelper::GetAppAumid()
{
    UINT32 length = 0;
    LONG rc = GetCurrentPackageFamilyName(&length, NULL);
    if (rc != ERROR_INSUFFICIENT_BUFFER)
    {
        if (rc == APPMODEL_ERROR_NO_PACKAGE)
            m_logger.Log(L"Process has no package identity");
        else
        {
            std::wstringstream message;
            message << L"Error" << rc << " in GetCurrentPackageFamilyName";
            m_logger.Log(message.str());
        }
        return L"";
    }

    std::vector<wchar_t> familyName;
    familyName.resize(length);
    if (familyName.size() != length)
    {
        m_logger.Log(L"Error allocating memory for PackageFamilyName\n");
        return L"";
    }

    rc = GetCurrentPackageFamilyName(&length, familyName.data());
    if (rc != ERROR_SUCCESS)
    {
        std::wstringstream message;
        message << L"Error" << rc << " retrieving PackageFamilyName";
        m_logger.Log(message.str());
        return L"";
    }
    std::wstring aumid(familyName.data());
    aumid.append(L"!App");
    return aumid;
}

std::wstring EdgeHelper::GetAppExecutableDirectory()
{
    const UINT32 filter = PACKAGE_FILTER_HEAD | PACKAGE_FILTER_DIRECT;
    UINT32 count;
    UINT32 length = 0;
    std::unique_ptr<BYTE[]> package_buffer;
    LONG return_value = ::GetCurrentPackageInfo(filter, &length, nullptr, &count);
    if (return_value == ERROR_INSUFFICIENT_BUFFER) {
        package_buffer = std::make_unique<BYTE[]>(length);
    }

    auto hr = ::GetCurrentPackageInfo(filter, &length, package_buffer.get(), &count);
    if (hr == ERROR_SUCCESS) {
        const PACKAGE_INFO* package_info =
            reinterpret_cast<PACKAGE_INFO*>(package_buffer.get());
        if (package_info->path) {
            return package_info->path;
        }
    }
    return L"";
}

std::wstring get_file_contents(const std::wstring& filename)
{
    std::ifstream in(filename, std::ios::in | std::ios::binary);
    if (in)
    {
        return(std::wstring((std::istreambuf_iterator<char>(in)), std::istreambuf_iterator<char>()));
    }
    return L"";
}


std::wstring GetDirectory(const std::wstring& path)
{
    size_t found = path.find_last_of(L"/\\");
    return(path.substr(0, found));
}

HRESULT EdgeHelper::GetEdgeProxyPath(
    const std::wstring& strDirectoryPath,
    const std::wstring& strWildcard,
    std::wstring& filePath,
    BOOL bRecurse
)
{
    HRESULT hrResult = S_OK;
    WIN32_FIND_DATA FileData;
    std::wstring strQuery;
    HANDLE hSearch;
    DWORD dwLastError = 0;

    // Build full query string
    strQuery = strDirectoryPath + L"\\" + strWildcard;
    hSearch = FindFirstFile(strQuery.c_str(), &FileData);

    if (hSearch != INVALID_HANDLE_VALUE)
    {
        if (!(FileData.dwFileAttributes & FILE_ATTRIBUTE_DIRECTORY))
        {
            filePath = std::wstring(strDirectoryPath + L"\\" + std::wstring(FileData.cFileName));
        }
        FindClose(hSearch);
        hSearch = INVALID_HANDLE_VALUE;
    }
    else
    {
        dwLastError = GetLastError();

        if ((dwLastError != ERROR_FILE_NOT_FOUND) &&
            (dwLastError != ERROR_PATH_NOT_FOUND) &&
            (dwLastError != ERROR_BAD_NETPATH))
        {
            hrResult = HRESULT_FROM_WIN32(dwLastError);
        }
    }

    if (SUCCEEDED(hrResult) && bRecurse)
    {
        strQuery = strDirectoryPath + L"\\*";
        hSearch = FindFirstFile(strQuery.c_str(), &FileData);

        if (hSearch != INVALID_HANDLE_VALUE)
        {
            do
            {
                if (_wcsicmp(FileData.cFileName, L".") &&
                    _wcsicmp(FileData.cFileName, L".."))
                {
                    if (FileData.dwFileAttributes & FILE_ATTRIBUTE_DIRECTORY)
                    {
                        if (FAILED(hrResult = GetEdgeProxyPath(
                            std::wstring(strDirectoryPath + L"\\" + std::wstring(FileData.cFileName)),
                            strWildcard,
                            filePath,
                            bRecurse)))
                        {
                            break;
                        }
                    }
                }
            } while (FindNextFile(hSearch, &FileData));

            FindClose(hSearch);
            hSearch = INVALID_HANDLE_VALUE;

            if ((dwLastError = GetLastError()) != ERROR_NO_MORE_FILES)
            {
                hrResult = HRESULT_FROM_WIN32(dwLastError);
            }
        }
        else
        {
            dwLastError = GetLastError();

            if ((dwLastError != ERROR_FILE_NOT_FOUND) &&
                (dwLastError != ERROR_PATH_NOT_FOUND) &&
                (dwLastError != ERROR_BAD_NETPATH))
            {
                hrResult = HRESULT_FROM_WIN32(dwLastError);
            }
        }
    }

    if (hSearch != INVALID_HANDLE_VALUE)
    {
        FindClose(hSearch);
        hSearch = INVALID_HANDLE_VALUE;
    }

    return hrResult;
}

std::wstring EdgeHelper::FindEdgeStablePath() {
    std::wstring path;

    static constexpr const wchar_t* kEdgePathVariables[] = {
      L"%PROGRAMFILES%",  // With or without " (x86)" according to exe bitness.
      L"%PROGRAMFILES(X86)%",  // Always "C:\Program Files (x86)"
      L"%PROGRAMW6432%",       // Always "C:\Program Files" under WoW64.
      L"%LOCALAPPDATA%"
    };
    std::wstring sub_path(L"\\Microsoft\\Edge\\Application\\");
    for (const wchar_t* variable : kEdgePathVariables) {

        std::wstring edge_root_dir(variable);
        edge_root_dir.append(sub_path);
        wchar_t szPath[MAX_PATH];
        DWORD ret = ExpandEnvironmentStringsW(edge_root_dir.c_str(), szPath, MAX_PATH);
        if (!ret || ret > MAX_PATH) {
            wprintf(L"Failed to expand localappdata path\n");
        }
        else {
            DWORD ftyp = GetFileAttributesW(szPath);
            if (ftyp == INVALID_FILE_ATTRIBUTES) {
                wprintf(L"Failed to find Edge binary at %s\n", szPath);
            }
            else {
                path = szPath;
                wprintf(L"Found Edge Stable channel installation under %s\n", path.c_str());
                break;
            }
        }
    }
    return path;
}

HRESULT EdgeHelper::LaunchUrl(const std::wstring url)
{
    HRESULT hr = 0;

    SHELLEXECUTEINFO ShExecInfo = { 0 };
    ShExecInfo.cbSize = sizeof(SHELLEXECUTEINFO);
    ShExecInfo.fMask = SEE_MASK_NOCLOSEPROCESS;
    ShExecInfo.hwnd = NULL;
    ShExecInfo.lpVerb = NULL;
    ShExecInfo.lpFile = url.c_str();
    ShExecInfo.lpParameters = NULL;
    ShExecInfo.lpDirectory = NULL;
    ShExecInfo.nShow = SW_SHOW;
    ShExecInfo.hInstApp = NULL;
    bool result = ShellExecuteEx(&ShExecInfo);
    if (result == false)
    {
        hr = HRESULT_FROM_WIN32(GetLastError());
        std::wstringstream message;
        message << L"LaunchUrl::ShellExecuteEx failed to launch URL:" << url << " Error:" << HRESULT_FROM_WIN32(GetLastError());
        m_logger.Log(message.str());
    }
    return hr;
}

HRESULT EdgeHelper::LaunchPWA(const std::wstring& paramsFilePath)
{
    std::wstring appId;
    std::wstring pwaUrl;
    std::wstring aumid;
    std::wstring appData = get_file_contents(paramsFilePath);

    GenericDocument<UTF16<>> d;
    d.Parse(appData.c_str());
    if (d.HasParseError())
    {
        std::wstringstream message;
        message << L"rapidjson parsing error: " << GetParseError_En(d.GetParseError()) << " in file: " <<  paramsFilePath << std::endl;
        m_logger.Log(message.str());
        return E_FAIL;
    }

    if (!d.HasMember(L"appid"))
    {
        std::wstringstream message;
        message << L"pwa.json file is missing the appid parameter" << std::endl;
        m_logger.Log(message.str());
        return E_INVALIDARG;
    }

    GenericValue<UTF16<>>& value = d[L"appid"];
    appId = value.GetString();

    if (!d.HasMember(L"appurl"))
    {
        std::wstringstream message;
        message << L"pwa.json file is missing the appurl parameter" << std::endl;
        m_logger.Log(message.str());
        return E_INVALIDARG;
    }

    value = d[L"appurl"];
    pwaUrl = value.GetString();

    aumid = GetAppAumid();
    return LaunchPWA(pwaUrl, appId, aumid);
}

HRESULT EdgeHelper::LaunchPWA(const std::wstring& pwaUrl, const std::wstring& appId, const std::wstring& aumid)
{
    std::wstring parameters;
    parameters.append(L"--windows-store-app");
    parameters.append(L" --app-fallback-url=");
    parameters.append(pwaUrl);
    parameters.append(L" --app-id=");
    parameters.append(appId);
    m_logger.Log(parameters);

    parameters.append(L" --ip-aumid=");
    parameters.append(aumid);
    parameters.append(L" --profile-directory=Default --ip-edge-aumid=Microsoft.MicrosoftEdge.stable_8wekyb3d8bbwe!Edge");
    m_logger.Log(parameters);

    std::wstring path = FindEdgeStablePath();
    DWORD ftyp = GetFileAttributesW(path.c_str());
    if (ftyp == INVALID_FILE_ATTRIBUTES) {
        m_logger.Log(L"Failed to find Edge Stable channel installation.");
        // notify user that they need to install Edge to run the Store PWA app
        LaunchUrl(sGetEdgeUrl);
        return 4;
    }
    SetCurrentDirectory(path.c_str());

    std::wstring msedge_path;
    GetEdgeProxyPath(path, L"msedge.exe", msedge_path, true);
    std::wstring msedge_directory = GetDirectory(msedge_path);

    ftyp = GetFileAttributesW(msedge_path.c_str());
    if (ftyp == INVALID_FILE_ATTRIBUTES) {
        std::wstringstream message;
        message << L"Failed to find msedge.exe under path " << msedge_path.c_str();
        m_logger.Log(message.str());
        // notify user that they need to install Edge to run the Store PWA app
        LaunchUrl(sGetEdgeUrl);
        return 5;
    }
    
    // OK cool, we have Chromium Edge. 
    // Is it Edge version 88 or later? If not, redirect to the "Edge Too Old" page.
    auto edgeMajorVersion = GetEdgeVersion(msedge_path);
    if (edgeMajorVersion != -1 && edgeMajorVersion < 88)
    {
        // If we were able to fetch the Edge version and it's less than 88, tell the user he needs to update Edge.
        LaunchUrl(sEdgeTooOldUrl);
        return 5;
    }
    
    SHELLEXECUTEINFO ShExecInfo = { 0 };
    ShExecInfo.cbSize = sizeof(SHELLEXECUTEINFO);
    ShExecInfo.fMask = SEE_MASK_NOCLOSEPROCESS;
    ShExecInfo.hwnd = NULL;
    ShExecInfo.lpVerb = NULL;
    ShExecInfo.lpFile = msedge_path.c_str();
    ShExecInfo.lpParameters = parameters.c_str();
    ShExecInfo.lpDirectory = msedge_directory.c_str();
    ShExecInfo.nShow = SW_SHOW;
    ShExecInfo.hInstApp = NULL;
    if (ShellExecuteEx(&ShExecInfo))
    {
        if (ShExecInfo.hProcess != 0)
        {
            WaitForSingleObject(ShExecInfo.hProcess, INFINITE);
        }
    }
    else
    {
        std::wstringstream message;
        message << L"ShellExecuteEx failed to start msedge.exe. Error:" << HRESULT_FROM_WIN32(GetLastError());
        m_logger.Log(message.str());
        return 6;
    }

    return 0;
}

int EdgeHelper::GetEdgeVersion(const std::wstring& edgeFilePath)
{
    auto edgePathCStr = edgeFilePath.c_str();
    auto fileVersionInfoSize = GetFileVersionInfoSizeW(edgePathCStr, NULL);
    if (fileVersionInfoSize == 0)
    {
        // Eh, we couldn't the version size info. Punt.
        return -1;
    }

    auto versionInfo = new BYTE[fileVersionInfoSize];
    auto versionInfoResult = GetFileVersionInfoW(edgePathCStr, 0, fileVersionInfoSize, versionInfo);
    if (versionInfoResult == 0)
    {
        // We couldn't get the version. Punt.
        return -1;
    }

    void* fixedInfo;
    unsigned int vSize;
    auto vQueryResult = VerQueryValue(versionInfo, L"\\", &fixedInfo, &vSize);
    if (!vQueryResult)
    {
        // We couldn't query the version data.
        return -1;
    }

    VS_FIXEDFILEINFO* aInfo = (VS_FIXEDFILEINFO*)fixedInfo;
    auto edgeMajorVersion = HIWORD(aInfo->dwFileVersionMS);
    return edgeMajorVersion;
}
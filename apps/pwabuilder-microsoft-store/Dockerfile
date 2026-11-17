# November 2026 servicing (KB5131090); retain Windows Server 2022 host compatibility.
FROM mcr.microsoft.com/windows/server:10.0.20348.5870

# Install .NET 10.0.404 SDK (includes the serviced 10.0.15 runtime)
RUN powershell -Command \
    "$ProgressPreference = 'SilentlyContinue'; \
    Invoke-WebRequest -Uri 'https://builds.dotnet.microsoft.com/dotnet/Sdk/10.0.404/dotnet-sdk-10.0.404-win-x64.exe' -OutFile 'dotnet-sdk-installer.exe'; \
    $expectedHash = 'c86b0aeb8c5ce0cd6dd290fb2b10bb112302d849d05cbcbcbc0ed4e5a15f66d1376e05bc77910bf66580d6a779390ec863e2bd6e51e7e21880d587b8b30c7b08'; \
    $actualHash = (Get-FileHash -Path 'dotnet-sdk-installer.exe' -Algorithm SHA512).Hash; \
    if ($actualHash -ne $expectedHash) { throw 'The .NET SDK installer checksum is invalid.'; } \
    Start-Process -FilePath 'dotnet-sdk-installer.exe' -ArgumentList '/quiet' -Wait; \
    Remove-Item 'dotnet-sdk-installer.exe'"

RUN ["powershell.exe", "Set-ExecutionPolicy RemoteSigned -Scope CurrentUser"]

# Install Windows SDK (needed for MSIX packaging tools)
RUN powershell  Invoke-WebRequest https://go.microsoft.com/fwlink/?linkid=2120843 -OutFile ./downloadsdk.exe
RUN ["powershell.exe", "Start-Process -Wait -FilePath ./downloadsdk.exe -ArgumentList '/quiet /norestart /log log.txt'"]
RUN ["powershell.exe", "Get-Content log.txt"]

# .NET SDK servicing does not patch Windows' built-in .NET Framework (KB5127687).
RUN powershell -Command \
    "$ErrorActionPreference = 'Stop'; \
    foreach ($framework in @('Framework', 'Framework64')) { \
        foreach ($assembly in @('System.Core.dll', 'Mscorlib.dll')) { \
            $path = Join-Path $env:WINDIR ('Microsoft.NET\' + $framework + '\v4.0.30319\' + $assembly); \
            $info = (Get-Item -LiteralPath $path).VersionInfo; \
            $version = [version]::new($info.FileMajorPart, $info.FileMinorPart, $info.FileBuildPart, $info.FilePrivatePart); \
            if ($version -lt [version]'4.8.4811.0') { throw ('Unpatched .NET Framework: ' + $path + ' (' + $version + '). Rebase onto a serviced Windows image.'); } \
        } \
    }"

WORKDIR /app
EXPOSE 5000

# Configure ASP.NET Core for Azure Web Apps
ENV ASPNETCORE_URLS=http://0.0.0.0:5000
ENV ASPNETCORE_ENVIRONMENT=Production
ENV WEBSITES_PORT=5000

# Copy project file and restore dependencies
COPY ["PWABuilder.MicrosoftStore.csproj", "."]
RUN dotnet restore "PWABuilder.MicrosoftStore.csproj"

# Copy source code and build
COPY . .
RUN dotnet build "PWABuilder.MicrosoftStore.csproj" -c Release -o /app/build

# Publish the application
RUN dotnet publish "PWABuilder.MicrosoftStore.csproj" -c Release -o /app/publish /p:UseAppHost=false

# Move published files to app directory
RUN powershell -Command "Copy-Item -Path '/app/publish/*' -Destination '/app' -Recurse -Force; Remove-Item -Path '/app/publish' -Recurse -Force"

# Run as ContainerUser for security
USER ContainerUser

ENTRYPOINT ["dotnet", "PWABuilder.MicrosoftStore.dll"]

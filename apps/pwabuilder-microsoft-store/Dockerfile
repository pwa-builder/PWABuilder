# Use a serviced Windows Server 2022 LTSC build compatible with GitHub Actions.
FROM mcr.microsoft.com/windows/server:10.0.20348.5499

# Install .NET 10.0 SDK (includes runtime)
RUN powershell -Command \
    "$ProgressPreference = 'SilentlyContinue'; \
    Invoke-WebRequest -Uri 'https://builds.dotnet.microsoft.com/dotnet/Sdk/10.0.400/dotnet-sdk-10.0.400-win-x64.exe' -OutFile 'dotnet-sdk-installer.exe'; \
    $expectedHash = 'fb86b8fa66db46f9caa696fcde2f2d040ea8bd61264c040e11ff716160693961993b10df8a346dd3dac9a8b72939e3e632d9a6f519de02c99d84cd6f7df500dc'; \
    $actualHash = (Get-FileHash -Path 'dotnet-sdk-installer.exe' -Algorithm SHA512).Hash; \
    if ($actualHash -ne $expectedHash) { throw 'The .NET SDK installer checksum is invalid.'; } \
    Start-Process -FilePath 'dotnet-sdk-installer.exe' -ArgumentList '/quiet' -Wait; \
    Remove-Item 'dotnet-sdk-installer.exe'"

RUN ["powershell.exe", "Set-ExecutionPolicy RemoteSigned -Scope CurrentUser"]

# Install Windows SDK (needed for MSIX packaging tools)
RUN powershell  Invoke-WebRequest https://go.microsoft.com/fwlink/?linkid=2120843 -OutFile ./downloadsdk.exe
RUN ["powershell.exe", "Start-Process -Wait -FilePath ./downloadsdk.exe -ArgumentList '/quiet /norestart /log log.txt'"]
RUN ["powershell.exe", "Get-Content log.txt"]

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

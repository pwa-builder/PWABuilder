# Use a serviced Windows Server 2022 LTSC build compatible with GitHub Actions.
FROM mcr.microsoft.com/windows/server:10.0.20348.5499

# Install .NET 10.0.403 SDK (includes the serviced 10.0.14 runtime)
RUN powershell -Command \
    "$ProgressPreference = 'SilentlyContinue'; \
    Invoke-WebRequest -Uri 'https://builds.dotnet.microsoft.com/dotnet/Sdk/10.0.403/dotnet-sdk-10.0.403-win-x64.exe' -OutFile 'dotnet-sdk-installer.exe'; \
    $expectedHash = 'cca8d82788252a8d13e778150a5e8393e204af274a12d19de7da10a0d98370a4edd5361ce5da73d0db13997fe5191e5db3a69c9665c6ddd6fba0d77845046f3c'; \
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

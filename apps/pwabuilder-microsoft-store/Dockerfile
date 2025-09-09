# Use Windows Server as the base image
FROM mcr.microsoft.com/windows/server:ltsc2022

# Install .NET 9.0 SDK (includes runtime)
RUN powershell -Command \
    "$ProgressPreference = 'SilentlyContinue'; \
    Invoke-WebRequest -Uri 'https://dotnetcli.azureedge.net/dotnet/Sdk/9.0.100/dotnet-sdk-9.0.100-win-x64.exe' -OutFile 'dotnet-sdk-installer.exe'; \
    Start-Process -FilePath 'dotnet-sdk-installer.exe' -ArgumentList '/quiet' -Wait; \
    Remove-Item 'dotnet-sdk-installer.exe'"

# Install Windows SDK (needed for MSIX packaging tools)
RUN powershell -Command \
    "$ProgressPreference = 'SilentlyContinue'; \
    Invoke-WebRequest -Uri 'https://go.microsoft.com/fwlink/?linkid=2196230' -OutFile 'winsdksetup.exe'; \
    Start-Process -FilePath 'winsdksetup.exe' -ArgumentList '/quiet', '/features', 'OptionId.WindowsDesktopDebuggers', 'OptionId.WindowsDesktopSoftwareDevelopmentKit', 'OptionId.WindowsSoftwareLogoToolkit' -Wait; \
    Remove-Item 'winsdksetup.exe'"

# Add Windows SDK tools to PATH
RUN setx PATH "%PATH%;C:\\Program Files (x86)\\Windows Kits\\10\\bin\\10.0.22621.0\\x64"

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

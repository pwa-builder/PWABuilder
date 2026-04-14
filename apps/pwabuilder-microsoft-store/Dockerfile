# Use Windows Server as the base image - using latest 2022 LTSC build for GitHub Actions compatibility
FROM mcr.microsoft.com/windows/server:ltsc2022-KB5070884

# Install .NET 10.0 SDK (includes runtime)
RUN powershell -Command \
    "$ProgressPreference = 'SilentlyContinue'; \
    Invoke-WebRequest -Uri 'https://dotnetcli.azureedge.net/dotnet/Sdk/10.0.100/dotnet-sdk-10.0.100-win-x64.exe' -OutFile 'dotnet-sdk-installer.exe'; \
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

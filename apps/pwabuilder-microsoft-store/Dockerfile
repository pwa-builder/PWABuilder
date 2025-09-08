# Use Windows Server Core as the base image for both build and runtime
FROM mcr.microsoft.com/dotnet/aspnet:9.0-windowsservercore-ltsc2022 AS base
WORKDIR /app
EXPOSE 8080

# Build stage with Windows SDK
FROM mcr.microsoft.com/dotnet/sdk:9.0-windowsservercore-ltsc2022 AS build

# Install Windows SDK (simplified approach)
RUN powershell -Command \
    "$ProgressPreference = 'SilentlyContinue'; \
    Invoke-WebRequest -Uri 'https://go.microsoft.com/fwlink/?linkid=2196127' -OutFile 'winsdksetup.exe'; \
    Start-Process -FilePath 'winsdksetup.exe' -ArgumentList '/quiet', '/features', 'OptionId.WindowsPerformanceToolkit', '/installpath', 'C:\\WinSDK' -Wait; \
    Remove-Item 'winsdksetup.exe'"

WORKDIR /src
COPY ["PWABuilder.MicrosoftStore.csproj", "."]
RUN dotnet restore "PWABuilder.MicrosoftStore.csproj"

COPY . .
WORKDIR "/src"
RUN dotnet build "PWABuilder.MicrosoftStore.csproj" -c Release -o /app/build

# Publish stage
FROM build AS publish
RUN dotnet publish "PWABuilder.MicrosoftStore.csproj" -c Release -o /app/publish /p:UseAppHost=false

# Final stage - runtime with Windows SDK tools
FROM mcr.microsoft.com/dotnet/aspnet:9.0-windowsservercore-ltsc2022 AS final

# Install Windows SDK in runtime image (needed for MSIX packaging tools)
RUN powershell -Command \
    "Invoke-WebRequest -Uri 'https://go.microsoft.com/fwlink/?linkid=2196127' -OutFile 'winsdksetup.exe'; \
    Start-Process -FilePath 'winsdksetup.exe' -ArgumentList '/quiet', '/installpath', 'C:\Program Files (x86)\Windows Kits\10' -Wait; \
    Remove-Item 'winsdksetup.exe'"

# Add Windows SDK tools to PATH
RUN setx PATH "%PATH%;C:\Program Files (x86)\Windows Kits\10\bin\10.0.22621.0\x64"

WORKDIR /app
COPY --from=publish /app/publish .

# Create a non-root user for security
RUN net user appuser /add && \
    net localgroup "Users" appuser /add

USER appuser

ENTRYPOINT ["dotnet", "PWABuilder.MicrosoftStore.dll"]

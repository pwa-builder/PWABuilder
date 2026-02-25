using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace PWABuilder.MicrosoftStore.Models
{
    public class AppSettings
    {
        /// <summary>
        /// The relative path to the pwa_builder.exe command line tool.
        /// </summary>
        public string PwaBuilderPath { get; set; } = string.Empty;

        /// <summary>
        /// The relative path to the pwainstaller.exe command line tool used for side-loading MSIX on a local machine.
        /// </summary>
        public string PwaInstallerPath { get; set; } = string.Empty;

        /// <summary>
        /// The path to the .ps1 Powershell script template for installing the app on the user's machine for testing.
        /// </summary>
        public string InstallScriptPath { get; set; } = string.Empty;

        /// <summary>
        /// The path to the resources.pri static resources file.
        /// </summary>
        public string PriPath { get; set; } = string.Empty;

        /// <summary>
        /// The output directory to store MSIX build artifacts in.
        /// </summary>
        public string OutputDirectory { get; set; } = string.Empty;

        /// <summary>
        /// Gets the path to the classic Windows (pre-Vibranium) app package template.
        /// </summary>
        public string ClassicWindowsAppPackagePath { get; set; } = string.Empty;

        /// <summary>
        /// Gets the path to the Spartan (EdgeHTML)-based app package template.
        /// </summary>
        public string SpartanWindowsAppPackagePath { get; set; } = string.Empty;

        /// <summary>
        /// Gets the path to the Spartan (EdgeHTML)-based app install script.
        /// </summary>
        public string SpartanInstallScriptPath { get; set; } = string.Empty;

        /// <summary>
        /// Gets the path to the next steps readme for Spartan (EdgeHTML) packages.
        /// </summary>
        public string SpartanReadmePath { get; set; } = string.Empty;

        /// <summary>
        /// Gets the path to the file containing Store-supported languages.
        /// </summary>
        /// <remarks>
        /// See https://docs.microsoft.com/en-us/windows/uwp/publish/supported-languages for live list of Store-supported languages.
        /// </remarks>
        public string StoreSupportedLanguagesPath { get; set; } = string.Empty;

        /// <summary>
        /// Gets the path to the readme file.
        /// </summary>
        public string ReadmePath { get; set; } = string.Empty;

        /// <summary>
        /// The path to the Windows SDK directory that contains tools like makeappx.exe and makepri.exe.
        /// </summary>
        public string WindowsSdkDirectory { get; set; } = string.Empty;

        /// <summary>
        /// The URL of the URL logging service.
        /// </summary>
        public string? UrlLoggerService { get; set; }

        /// <summary>
        /// The URL of the image generator API.
        /// </summary>
        public required Uri ImageGeneratorApiUrl { get; set; }

        /// <summary>
        /// App Insights connection string
        /// </summary>
        public string ApplicationInsightsConnectionString { get; set; } = string.Empty;

        /// <summary>
        /// The CosmosDB endpoint URL (e.g., https://your-account.documents.azure.com:443/)
        /// </summary>
        public string CosmosDbEndpoint { get; set; } = string.Empty;

        /// <summary>
        /// The CosmosDB database name
        /// </summary>
        public string CosmosDbDatabaseName { get; set; } = string.Empty;

        /// <summary>
        /// The CosmosDB container name for storing package analytics
        /// </summary>
        public string CosmosDbContainerName { get; set; } = string.Empty;

        /// <summary>
        /// The Azure Managed Identity Application ID for user-assigned managed identity authentication. If null or empty, the system-assigned managed identity will be used.
        /// </summary>
        public string? AzureManagedIdentityApplicationId { get; set; }
    }
}

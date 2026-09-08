using System;
using System.Text.RegularExpressions;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection.Extensions;
using Microsoft.Extensions.Options;
using PWABuilder.MicrosoftStore.Models;

namespace PWABuilder.MicrosoftStore.Jobs;

/// <summary>Registers the optional job API and validates its deployment prerequisites.</summary>
public static class WindowsPackageJobRegistration
{
    /// <summary>Registers durable job services only when explicitly enabled.</summary>
    public static IServiceCollection AddWindowsPackageJobs(this IServiceCollection services, IConfiguration configuration)
    {
        var section = configuration.GetSection("WindowsPackageJobs");
        services.TryAddSingleton(TimeProvider.System);
        services.AddOptions<WindowsPackageJobOptions>()
            .Bind(section)
            .ValidateDataAnnotations()
            .Validate(o => !o.Enabled ||
                (IsServiceUri(o.QueueServiceUri) && IsServiceUri(o.BlobServiceUri)
                 && IsStorageName(o.QueueName, 56) && IsStorageName(o.BlobContainerName, 63)
                 && !string.IsNullOrWhiteSpace(o.CosmosContainerName)),
                "Queued packaging requires explicit Azure service URIs and environment-specific queue, Blob, and Cosmos container names.")
            .Validate(o => o.RenewalSeconds * 3 <= o.VisibilitySeconds,
                "RenewalSeconds must be at most one third of VisibilitySeconds.")
            .Validate<IOptions<AppSettings>>((o, app) => !o.Enabled ||
                (IsServiceUri(app.Value.CosmosDbEndpoint)
                 && !string.IsNullOrWhiteSpace(app.Value.CosmosDbDatabaseName)
                 && o.CosmosContainerName != app.Value.CosmosDbContainerName),
                "Configure a Cosmos endpoint/database and a job container distinct from package analytics.")
            .ValidateOnStart();

        if (section.GetValue<bool>("Enabled"))
        {
            services.AddSingleton<IWindowsPackageJobStore, AzureWindowsPackageJobStore>();
            services.AddSingleton<IWindowsPackageJobQueue, AzureWindowsPackageJobQueue>();
            services.AddScoped<IWindowsPackageJobBuilder, WindowsPackageJobBuilder>();
            services.AddScoped<WindowsPackageJobProcessor>();
            services.AddHostedService<WindowsPackageJobWorker>();
        }
        return services;
    }

    /// <summary>Requires HTTPS service roots rather than signed URLs or credentials in configuration.</summary>
    private static bool IsServiceUri(string value) =>
        Uri.TryCreate(value, UriKind.Absolute, out var uri)
        && uri.Scheme is "https"
        && uri.AbsolutePath is "/"
        && string.IsNullOrEmpty(uri.UserInfo)
        && string.IsNullOrEmpty(uri.Query)
        && string.IsNullOrEmpty(uri.Fragment);

    /// <summary>Checks Azure queue/container names, reserving room for the poison suffix.</summary>
    private static bool IsStorageName(string name, int maxLength) =>
        name.Length >= 3 && name.Length <= maxLength
        && !name.Contains("--", StringComparison.Ordinal)
        && Regex.IsMatch(name, "^[a-z0-9][a-z0-9-]*[a-z0-9]$", RegexOptions.CultureInvariant);
}

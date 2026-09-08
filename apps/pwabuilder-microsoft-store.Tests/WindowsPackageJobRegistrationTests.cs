using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Options;
using PWABuilder.MicrosoftStore.Jobs;
using PWABuilder.MicrosoftStore.Models;
using Xunit;

namespace PWABuilder.MicrosoftStore.Tests;

public sealed class WindowsPackageJobRegistrationTests
{
    [Fact]
    public void Register_WhenDisabled_DoesNotRequireAzureOrRunWorkers()
    {
        var services = new ServiceCollection();
        services.AddWindowsPackageJobs(new ConfigurationBuilder().Build());
        using var provider = services.BuildServiceProvider();

        Assert.False(provider.GetRequiredService<IOptions<WindowsPackageJobOptions>>().Value.Enabled);
        Assert.Null(provider.GetService<IWindowsPackageJobStore>());
        Assert.Empty(provider.GetServices<IHostedService>());
        Assert.NotNull(provider.GetRequiredService<TimeProvider>());
    }

    [Fact]
    public void Register_WhenEnabledWithoutStorage_FailsValidation()
    {
        using var provider = CreateProvider(new Dictionary<string, string?>
        {
            ["WindowsPackageJobs:Enabled"] = "true"
        });
        Assert.Throws<OptionsValidationException>(() => provider.GetRequiredService<IOptions<WindowsPackageJobOptions>>().Value);
    }

    [Theory]
    [InlineData("RenewalSeconds", "60")]
    [InlineData("WorkerCount", "0")]
    [InlineData("QueueName", "UPPERCASE")]
    [InlineData("BlobServiceUri", "http://example.com")]
    [InlineData("CosmosContainerName", "package-analytics")]
    public void Register_WhenConfigurationIsUnsafe_FailsValidation(string property, string value)
    {
        var config = ValidConfiguration();
        config["WindowsPackageJobs:" + property] = value;
        using var provider = CreateProvider(config);
        Assert.Throws<OptionsValidationException>(() => provider.GetRequiredService<IOptions<WindowsPackageJobOptions>>().Value);
    }

    [Fact]
    public void Register_WhenEnabled_AddsBoundedHostedWorkers()
    {
        var services = CreateServices(ValidConfiguration());
        Assert.Contains(services, d => d.ServiceType == typeof(IHostedService) && d.ImplementationType == typeof(WindowsPackageJobWorker));
        using var provider = services.BuildServiceProvider();
        Assert.True(provider.GetRequiredService<IOptions<WindowsPackageJobOptions>>().Value.Enabled);
    }

    private static ServiceProvider CreateProvider(Dictionary<string, string?> config) =>
        CreateServices(config).BuildServiceProvider();

    private static ServiceCollection CreateServices(Dictionary<string, string?> config)
    {
        var services = new ServiceCollection();
        services.AddOptions<AppSettings>().Configure(settings =>
        {
            settings.CosmosDbEndpoint = "https://example.documents.azure.com";
            settings.CosmosDbDatabaseName = "pwabuilder";
            settings.CosmosDbContainerName = "package-analytics";
        });
        services.AddWindowsPackageJobs(new ConfigurationBuilder().AddInMemoryCollection(config).Build());
        return services;
    }

    private static Dictionary<string, string?> ValidConfiguration() => new()
    {
        ["WindowsPackageJobs:Enabled"] = "true",
        ["WindowsPackageJobs:QueueServiceUri"] = "https://example.queue.core.windows.net",
        ["WindowsPackageJobs:QueueName"] = "windows-package-jobs-nonprod",
        ["WindowsPackageJobs:BlobServiceUri"] = "https://example.blob.core.windows.net",
        ["WindowsPackageJobs:BlobContainerName"] = "windows-package-jobs-nonprod",
        ["WindowsPackageJobs:CosmosContainerName"] = "windows-package-jobs-nonprod"
    };
}

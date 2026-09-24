using Azure.Identity;
using Microsoft.Azure.Cosmos;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using System;
using System.Net.Http;
using System.Text.Json;
using System.Threading;
using System.Threading.Tasks;

namespace PWABuilder.MicrosoftStore.Services;

/// <summary>
/// Matches published Store PWAs to generated packages once every 24 hours.
/// </summary>
public sealed class StorePwaService : BackgroundService
{
    private readonly SfEdgeClient sfEdgeClient;
    private readonly IMsStorePackageStore packageStore;
    private readonly TimeProvider timeProvider;
    private readonly ILogger<StorePwaService> logger;

    /// <summary>
    /// Creates the publication sync using the packaging service's existing package store.
    /// </summary>
    public StorePwaService(
        SfEdgeClient sfEdgeClient,
        IMsStorePackageStore packageStore,
        TimeProvider timeProvider,
        ILogger<StorePwaService> logger)
    {
        this.sfEdgeClient = sfEdgeClient;
        this.packageStore = packageStore;
        this.timeProvider = timeProvider;
        this.logger = logger;
    }

    /// <inheritdoc/>
    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        if (!this.packageStore.IsEnabled)
        {
            this.logger.LogWarning("Store PWA publication sync is disabled because CosmosDB is not configured.");
            return;
        }

        try
        {
            await Task.Delay(TimeSpan.FromMinutes(5), this.timeProvider, stoppingToken);
            using var timer = new PeriodicTimer(TimeSpan.FromHours(24), this.timeProvider);
            do
            {
                try
                {
                    await SynchronizeAsync(stoppingToken);
                }
                catch (Exception error) when (error is HttpRequestException or JsonException or CosmosException or AuthenticationFailedException ||
                    (error is OperationCanceledException && !stoppingToken.IsCancellationRequested))
                {
                    this.logger.LogError(error, "Store PWA publication sync failed. It will be retried on the next daily run.");
                }
            }
            while (await timer.WaitForNextTickAsync(stoppingToken));
        }
        catch (OperationCanceledException) when (stoppingToken.IsCancellationRequested)
        {
            // Host shutdown cancels the initial delay, active requests, and the daily timer.
        }
    }

    /// <summary>
    /// Synchronizes the catalog, allowing an individual product failure to be retried on the next daily run.
    /// </summary>
    internal async Task SynchronizeAsync(CancellationToken cancellationToken)
    {
        var productCount = 0;
        var updatedCount = 0;
        var failedCount = 0;
        this.logger.LogInformation("Starting Store PWA publication sync.");
        await foreach (var productId in this.sfEdgeClient.GetPwaProductIdsAsync(cancellationToken))
        {
            productCount++;
            try
            {
                var packageIds = await this.sfEdgeClient.GetPackageIdsAsync(productId, cancellationToken);
                foreach (var packageId in packageIds)
                {
                    updatedCount += await this.packageStore.UpdateProductIdAsync(packageId, productId, cancellationToken);
                }
            }
            catch (Exception error) when (error is HttpRequestException or JsonException or CosmosException ||
                (error is OperationCanceledException && !cancellationToken.IsCancellationRequested))
            {
                failedCount++;
                this.logger.LogError(error, "Unable to sync Store product {ProductId}. It will be retried on the next daily run.", productId);
            }
        }

        this.logger.LogInformation(
            "Store PWA publication sync finished: {ProductCount} products scanned, {UpdatedCount} package records updated, {FailedCount} products failed.",
            productCount, updatedCount, failedCount);
    }
}

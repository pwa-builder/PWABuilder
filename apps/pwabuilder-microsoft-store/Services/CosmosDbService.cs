using Azure.Core;
using Azure.Identity;
using Microsoft.Azure.Cosmos;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using PWABuilder.MicrosoftStore.Models;
using PWABuilder.MicrosoftStore.Services;
using System;
using System.Net;
using System.Threading;
using System.Threading.Tasks;

namespace PWABuilder.MicrosoftStore;

/// <summary>
/// Provides access to CosmosDB using RBAC authentication via Azure Managed Identity.
/// Supports both system-assigned and user-assigned managed identities.
/// </summary>
public sealed class CosmosDbService : IMsStorePackageStore
{
    private readonly ILogger<CosmosDbService> logger;
    private readonly CosmosClient? cosmosClient;
    private readonly Container? container;
    private readonly bool isEnabled;

    /// <inheritdoc/>
    public bool IsEnabled => this.isEnabled;

    /// <inheritdoc/>
    public CosmosDbService(
        IOptions<AppSettings> settings,
        ILogger<CosmosDbService> logger)
    {
        this.logger = logger;

        var endpoint = settings.Value.CosmosDbEndpoint;
        var databaseName = settings.Value.CosmosDbDatabaseName;
        var containerName = settings.Value.CosmosDbContainerName;

        // Check if CosmosDB is properly configured
        if (string.IsNullOrWhiteSpace(endpoint) ||
            string.IsNullOrWhiteSpace(databaseName) ||
            string.IsNullOrWhiteSpace(containerName))
        {
            this.logger.LogWarning("CosmosDB settings are not configured. Skipping CosmosDB initialization.");
            this.isEnabled = false;
            return;
        }

        try
        {
            // Use Managed Identity for authentication
            // If AzureManagedIdentityApplicationId is specified, use user-assigned MI
            // Otherwise, use system-assigned MI
            TokenCredential credential = string.IsNullOrWhiteSpace(settings.Value.AzureManagedIdentityApplicationId)
                ? new ManagedIdentityCredential()
                : new ManagedIdentityCredential(settings.Value.AzureManagedIdentityApplicationId);

            // Create CosmosClient with RBAC authentication
            this.cosmosClient = new CosmosClient(
                accountEndpoint: endpoint,
                tokenCredential: credential,
                clientOptions: new CosmosClientOptions
                {
                    SerializerOptions = new CosmosSerializationOptions
                    {
                        PropertyNamingPolicy = CosmosPropertyNamingPolicy.CamelCase
                    }
                });

            var database = this.cosmosClient.GetDatabase(databaseName);
            this.container = database.GetContainer(containerName);
            this.isEnabled = true;

            this.logger.LogInformation("CosmosDB service initialized successfully for database '{DatabaseName}' and container '{ContainerName}'",
                databaseName, containerName);
        }
        catch (Exception ex)
        {
            this.logger.LogError(ex, "Failed to initialize CosmosDB service. Analytics will not be persisted to CosmosDB.");
            this.isEnabled = false;
        }
    }

    /// <summary>
    /// Creates a service using an existing package container.
    /// </summary>
    internal CosmosDbService(Container container, ILogger<CosmosDbService> logger)
    {
        this.container = container;
        this.logger = logger;
        this.isEnabled = true;
    }

    /// <inheritdoc/>
    public async Task<int> UpdateProductIdAsync(string packageId, string productId, CancellationToken cancellationToken)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(packageId);
        ArgumentException.ThrowIfNullOrWhiteSpace(productId);
        if (!this.isEnabled || this.container is null)
        {
            throw new InvalidOperationException("CosmosDB is not enabled. Cannot update package publication information.");
        }

        // Package identity names are case-insensitive. Include older documents without productId,
        // but avoid rewriting unchanged matches (writes also reset CosmosDB's TTL clock).
        var query = new QueryDefinition("""
            SELECT VALUE c.id FROM c
            WHERE STRINGEQUALS(c.packageId, @packageId, true)
            AND (NOT IS_DEFINED(c.productId) OR IS_NULL(c.productId) OR c.productId != @productId)
            """)
            .WithParameter("@packageId", packageId)
            .WithParameter("@productId", productId);

        using var results = this.container.GetItemQueryIterator<string>(query);
        var updatedCount = 0;
        while (results.HasMoreResults)
        {
            var page = await results.ReadNextAsync(cancellationToken);
            foreach (var id in page)
            {
                cancellationToken.ThrowIfCancellationRequested();
                try
                {
                    // Analytics saves each document with its id as the partition key.
                    await this.container.PatchItemAsync<PwaBuilderMsStorePackage>(
                        id,
                        new PartitionKey(id),
                        [PatchOperation.Set("/productId", productId)],
                        new PatchItemRequestOptions { EnableContentResponseOnWrite = false },
                        cancellationToken);
                    updatedCount++;
                }
                catch (CosmosException error) when (error.StatusCode is HttpStatusCode.NotFound)
                {
                    this.logger.LogInformation("Package {PackageDocumentId} expired or was removed before its product ID could be updated.", id);
                }
            }
        }

        return updatedCount;
    }

    /// <summary>
    /// Saves a document to the CosmosDB container.
    /// </summary>
    /// <typeparam name="T">The type of document to save.</typeparam>
    /// <param name="item">The item to save.</param>
    /// <param name="partitionKey">The partition key for the item.</param>
    /// <returns>True if successful, false otherwise.</returns>
    public async Task<bool> SaveItemAsync<T>(T item, string partitionKey)
    {
        if (!this.isEnabled || this.container is null)
        {
            this.logger.LogWarning("CosmosDB is not enabled. Skipping save operation.");
            return false;
        }

        try
        {
            await this.container.CreateItemAsync(
                item: item,
                partitionKey: new PartitionKey(partitionKey));

            return true;
        }
        catch (CosmosException ex) when (ex.StatusCode == System.Net.HttpStatusCode.Conflict)
        {
            // Item already exists - this is expected for duplicate submissions
            this.logger.LogInformation("Item with partition key '{PartitionKey}' already exists in CosmosDB", partitionKey);
            return true;
        }
        catch (Exception ex)
        {
            this.logger.LogError(ex, "Failed to save item to CosmosDB with partition key '{PartitionKey}'", partitionKey);
            return false;
        }
    }
}

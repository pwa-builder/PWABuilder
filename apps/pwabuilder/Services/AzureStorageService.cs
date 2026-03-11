using Azure.Identity;
using Azure.Storage.Blobs;
using Microsoft.Extensions.Options;
using PWABuilder.Models;

namespace PWABuilder.Services;

/// <summary>
/// Interface for accessing Azure Storage. When in local development, this will be implemented as an in-memory store. Otherwise, it will access the Azure Storage account for PWABuilder using Managed Identity.
/// </summary>
public interface IBlobStorageService
{
    /// <summary>
    /// Downloads a blob from Azure Storage.
    /// </summary>
    /// <param name="containerName">The container name.</param>
    /// <param name="blobName">The blob name.</param>
    /// <param name="cancellationToken"></param>
    /// <returns></returns>
    Task<Stream> DownloadBlobAsync(string containerName, string blobName, CancellationToken cancellationToken = default);

    /// <summary>
    /// Downloads a blob from Azure Storage as a byte array.
    /// </summary>
    /// <param name="containerName"></param>
    /// <param name="blobName"></param>
    /// <param name="cancellationToken"></param>
    /// <returns></returns>
    Task<byte[]> DownloadBlobAsBytesAsync(string containerName, string blobName, CancellationToken cancellationToken = default);

    /// <summary>
    /// Lists all blobs in a container.
    /// </summary>
    /// <param name="containerName">The name of the container to list files from</param>
    /// <param name="prefix">Optional prefix to filter blobs by name</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>Collection of blob names</returns>
    Task<IEnumerable<string>> ListBlobsAsync(string containerName, string? prefix = null, CancellationToken cancellationToken = default);
}

/// <summary>
/// Accesses PWABuilder's Azure Storage account. Access is controlled via Managed Identity.
/// </summary>
public class AzureStorageService : IBlobStorageService
{
    private readonly BlobServiceClient blobServiceClient;
    private readonly ILogger<AzureStorageService> logger;

    public AzureStorageService(IOptions<AppSettings> settings, ILogger<AzureStorageService> logger)
    {
        this.logger = logger;

        // Azure managed identity app ID:
        var managedIdentityAppId = settings.Value.AzureManagedIdentityApplicationId;

        // Create managed identity credential
        var credential = new ManagedIdentityCredential(clientId: managedIdentityAppId);

        // Connect to Azure Storage using managed identity
        var storageUri = new Uri($"https://{settings.Value.AzureStorageAccountName}.blob.core.windows.net");
        this.blobServiceClient = new BlobServiceClient(storageUri, credential);
    }

    /// <summary>
    /// Downloads a blob from Azure Storage.
    /// </summary>
    /// <param name="containerName">The name of the container containing the blob</param>
    /// <param name="blobName">The name of the blob to download</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>Stream containing the blob data</returns>
    public async Task<Stream> DownloadBlobAsync(string containerName, string blobName, CancellationToken cancellationToken = default)
    {
        try
        {
            var blobContainerClient = blobServiceClient.GetBlobContainerClient(containerName);
            var blobClient = blobContainerClient.GetBlobClient(blobName);

            var response = await blobClient.DownloadStreamingAsync(cancellationToken: cancellationToken);
            return response.Value.Content;
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error downloading blob {BlobName} from container {ContainerName}", blobName, containerName);
            throw;
        }
    }

    /// <summary>
    /// Downloads a blob from Azure Storage as a byte array.
    /// </summary>
    /// <param name="containerName">The name of the container containing the blob</param>
    /// <param name="blobName">The name of the blob to download</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>Byte array containing the blob data</returns>
    public async Task<byte[]> DownloadBlobAsBytesAsync(string containerName, string blobName, CancellationToken cancellationToken = default)
    {
        try
        {
            using var stream = await DownloadBlobAsync(containerName, blobName, cancellationToken);
            using var memoryStream = new MemoryStream();
            await stream.CopyToAsync(memoryStream, cancellationToken);
            return memoryStream.ToArray();
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error downloading blob {BlobName} from container {ContainerName} as bytes", blobName, containerName);
            throw;
        }
    }

    /// <summary>
    /// Lists all blobs in a container.
    /// </summary>
    /// <param name="containerName">The name of the container to list files from</param>
    /// <param name="prefix">Optional prefix to filter blobs by name</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>Collection of blob names</returns>
    public async Task<IEnumerable<string>> ListBlobsAsync(string containerName, string? prefix = null, CancellationToken cancellationToken = default)
    {
        try
        {
            var blobContainerClient = blobServiceClient.GetBlobContainerClient(containerName);
            var blobNames = new List<string>();

            await foreach (var blobItem in blobContainerClient.GetBlobsAsync(prefix: prefix, cancellationToken: cancellationToken))
            {
                blobNames.Add(blobItem.Name);
            }

            return blobNames;
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error listing blobs in container {ContainerName} with prefix {Prefix}", containerName, prefix);
            throw;
        }
    }
}

/// <summary>
/// In-memory implementation of IBlobStorageService for local development and testing.
/// </summary>
public class InMemoryBlobStorageService : IBlobStorageService
{
    public Task<byte[]> DownloadBlobAsBytesAsync(string containerName, string blobName, CancellationToken cancellationToken = default)
    {
        throw new NotImplementedException("In-memory blob storage does not support downloading blobs since we don't yet have an Upload method.");
    }

    /// <summary>
    /// Downloads a blob from the in-memory store.
    /// </summary>
    /// <param name="containerName"></param>
    /// <param name="blobName"></param>
    /// <param name="cancellationToken"></param>
    /// <returns></returns>
    public Task<Stream> DownloadBlobAsync(string containerName, string blobName, CancellationToken cancellationToken = default)
    {
        throw new NotImplementedException("In-memory blob storage does not support downloading blobs since we don't yet have an Upload method.");
    }

    /// <summary>
    /// Lists blobs in the in-memory store.
    /// </summary>
    /// <param name="containerName">The name of the container to list files from</param>
    /// <param name="prefix">Optional prefix to filter blobs by name</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>Collection of blob names</returns>
    public Task<IEnumerable<string>> ListBlobsAsync(string containerName, string? prefix = null, CancellationToken cancellationToken = default)
    {
        throw new NotImplementedException("In-memory blob storage does not support listing blobs since we don't yet have an Upload method.");
    }
}
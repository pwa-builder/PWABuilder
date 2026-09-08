using System.Threading;
using System.Threading.Tasks;

namespace PWABuilder.MicrosoftStore.Services;

/// <summary>
/// Updates publication information on stored Microsoft Store packages.
/// </summary>
public interface IMsStorePackageStore
{
    /// <summary>
    /// Whether the package store is configured and available for use.
    /// </summary>
    bool IsEnabled { get; }

    /// <summary>
    /// Sets the product ID on every matching package, returning the number of changed documents.
    /// </summary>
    Task<int> UpdateProductIdAsync(string packageId, string productId, CancellationToken cancellationToken);
}

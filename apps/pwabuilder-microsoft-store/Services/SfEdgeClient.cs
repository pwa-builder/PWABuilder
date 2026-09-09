using System;
using System.Collections.Generic;
using System.Net.Http;
using System.Runtime.CompilerServices;
using System.Text.Json;
using System.Threading;
using System.Threading.Tasks;

namespace PWABuilder.MicrosoftStore.Services;

/// <summary>
/// Reads published PWAs and their package identities from the Microsoft Store SFEdge API.
/// </summary>
public sealed class SfEdgeClient
{
    private const string BaseUrl = "https://storeedgefd.dsx.mp.microsoft.com/v9.0/";
    private const int PageSize = 15;
    private readonly IHttpClientFactory httpClientFactory;

    /// <summary>
    /// Creates an SFEdge client using managed HTTP connections.
    /// </summary>
    public SfEdgeClient(IHttpClientFactory httpClientFactory)
    {
        this.httpClientFactory = httpClientFactory;
    }

    /// <summary>
    /// Enumerates every page of Store PWAs, returning each product ID once.
    /// </summary>
    public async IAsyncEnumerable<string> GetPwaProductIdsAsync([EnumeratorCancellation] CancellationToken cancellationToken)
    {
        var seenProductIds = new HashSet<string>(StringComparer.OrdinalIgnoreCase);
        var skipItems = 0;
        while (true)
        {
            var path = FormattableString.Invariant(
                $"searchbytags?pageSize={PageSize}&skipItems={skipItems}&market=US&locale=en-US&architecture=x64&tags=AppExtension-microsoft.store.edgePWA&moId=Public&appVersion=22303.1401.0.0&oemId=Public&scmId=Public&deviceFamily=Windows.Desktop&catalogLocales=en-US&appmodels=uwp%2cwin32%2cwsa&deviceFamilyVersion=2814751249596416&cardsEnabled=true");
            using var response = await GetJsonAsync(path, cancellationToken);
            var payload = GetRequiredProperty(response.RootElement, "Payload", JsonValueKind.Object);
            if (!payload.TryGetProperty("Cards", out _))
            {
                // SFEdge switches from Cards to Products on the empty terminal page.
                var products = GetRequiredProperty(payload, "Products", JsonValueKind.Array);
                var totalItems = GetRequiredProperty(payload, "TotalItems", JsonValueKind.Number);
                if (products.GetArrayLength() is 0 && totalItems.TryGetInt32(out var total) && total is 0)
                {
                    yield break;
                }

                throw new JsonException("SFEdge returned product results instead of the requested cards.");
            }

            var cards = GetRequiredProperty(payload, "Cards", JsonValueKind.Array);
            if (cards.GetArrayLength() is 0)
            {
                yield break;
            }

            var previousCount = seenProductIds.Count;
            foreach (var card in cards.EnumerateArray())
            {
                cancellationToken.ThrowIfCancellationRequested();
                var productId = GetRequiredProperty(card, "ProductId", JsonValueKind.String).GetString();
                if (string.IsNullOrWhiteSpace(productId))
                {
                    throw new JsonException("SFEdge returned an empty product ID.");
                }

                if (seenProductIds.Add(productId))
                {
                    yield return productId;
                }
            }

            if (seenProductIds.Count == previousCount)
            {
                throw new JsonException("SFEdge pagination returned no new products.");
            }

            // Continue until an empty page rather than assuming TotalItems is an exact count.
            skipItems = checked(skipItems + cards.GetArrayLength());
        }
    }

    /// <summary>
    /// Reads the matching product-details envelope and extracts its package identity names.
    /// </summary>
    public async Task<IReadOnlyCollection<string>> GetPackageIdsAsync(string productId, CancellationToken cancellationToken)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(productId);
        var path = $"pages/pdp?productId={Uri.EscapeDataString(productId)}&appmodels=uwp%2Cwin32&appVersion=22307.701.0.0&architecture=x64&deviceFamily=Windows.Desktop&deviceFamilyVersion=2814751249596416&hydrateCount=0&itemType=Apps&key=forcepreview&locale=en-US&market=US";
        using var response = await GetJsonAsync(path, cancellationToken);
        if (response.RootElement.ValueKind is not JsonValueKind.Array)
        {
            throw new JsonException("SFEdge product details must be an array of response envelopes.");
        }

        foreach (var envelope in response.RootElement.EnumerateArray())
        {
            var payload = GetRequiredProperty(envelope, "Payload", JsonValueKind.Object);
            if (!payload.TryGetProperty("ProductId", out var id) ||
                id.ValueKind is not JsonValueKind.String ||
                !string.Equals(id.GetString(), productId, StringComparison.OrdinalIgnoreCase))
            {
                continue;
            }

            var families = GetRequiredProperty(payload, "PackageFamilyNames", JsonValueKind.Array);
            var packageIds = new HashSet<string>(StringComparer.OrdinalIgnoreCase);
            foreach (var family in families.EnumerateArray())
            {
                if (family.ValueKind is not JsonValueKind.String ||
                    family.GetString() is not string familyName)
                {
                    throw new JsonException($"SFEdge returned an invalid package family for product {productId}.");
                }

                // A family is <Package/Identity/Name>_<publisher hash>; identity names cannot contain underscores.
                var separator = familyName.IndexOf('_');
                if (separator <= 0 || separator == familyName.Length - 1 || separator != familyName.LastIndexOf('_'))
                {
                    throw new JsonException($"SFEdge returned an invalid package family for product {productId}.");
                }

                packageIds.Add(familyName[..separator]);
            }

            return packageIds;
        }

        throw new JsonException($"SFEdge did not return product details for {productId}.");
    }

    /// <summary>
    /// Sends an SFEdge request with the required agent identity and propagates HTTP or JSON failures.
    /// </summary>
    private async Task<JsonDocument> GetJsonAsync(string path, CancellationToken cancellationToken)
    {
        using var client = this.httpClientFactory.CreateClient();
        using var request = new HttpRequestMessage(HttpMethod.Get, BaseUrl + path);
        request.Headers.UserAgent.ParseAdd("StoreWeb PWABuilder");
        using var response = await client.SendAsync(request, cancellationToken);
        response.EnsureSuccessStatusCode();
        using var stream = await response.Content.ReadAsStreamAsync(cancellationToken);
        return await JsonDocument.ParseAsync(stream, cancellationToken: cancellationToken);
    }

    /// <summary>
    /// Validates required API fields so a changed response contract is reported rather than treated as an empty catalog.
    /// </summary>
    private static JsonElement GetRequiredProperty(JsonElement element, string name, JsonValueKind kind)
    {
        if (element.ValueKind is not JsonValueKind.Object ||
            !element.TryGetProperty(name, out var value) ||
            value.ValueKind != kind)
        {
            throw new JsonException($"SFEdge response is missing a valid {name} field.");
        }

        return value;
    }
}

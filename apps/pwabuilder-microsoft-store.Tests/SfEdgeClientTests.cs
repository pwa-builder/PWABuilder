using PWABuilder.MicrosoftStore.Services;
using System.Net;
using System.Text.Json;
using Xunit;

namespace PWABuilder.MicrosoftStore.Tests;

public sealed class SfEdgeClientTests
{
    /// <summary>
    /// Verifies all pages, including a partial final page, are read with duplicate products removed.
    /// </summary>
    [Fact]
    public async Task GetPwaProductIdsAsync_WhenCatalogHasMultiplePages_ReadsThroughEmptyPage()
    {
        var queries = new List<string>();
        var factory = new SfEdgeTestHttpClientFactory((request, _) =>
        {
            queries.Add(request.RequestUri!.Query);
            return Task.FromResult(queries.Count switch
            {
                1 => SfEdgeTestHttpClientFactory.Search(Enumerable.Range(0, 15).Select(i => $"Product{i}").ToArray()),
                2 => SfEdgeTestHttpClientFactory.Search("product14", "Product15"),
                3 => SfEdgeTestHttpClientFactory.Search(),
                _ => throw new InvalidOperationException("Unexpected search request.")
            });
        });
        var client = new SfEdgeClient(factory);

        var products = await ReadProductsAsync(client);

        Assert.Equal(Enumerable.Range(0, 16).Select(i => $"Product{i}"), products);
        Assert.Contains("pageSize=15&skipItems=0&", queries[0]);
        Assert.Contains("skipItems=15&", queries[1]);
        Assert.Contains("skipItems=17&", queries[2]);
        Assert.All(queries, query => Assert.Contains("tags=AppExtension-microsoft.store.edgePWA", query));
    }

    /// <summary>
    /// Verifies an empty catalog does not trigger another request.
    /// </summary>
    [Theory]
    [InlineData("""{"Payload":{"Products":[],"TotalItems":0,"PageSize":0}}""")]
    [InlineData("""{"Payload":{"Cards":[],"TotalItems":0,"PageSize":0}}""")]
    public async Task GetPwaProductIdsAsync_WhenCatalogIsEmpty_ReturnsNoProducts(string json)
    {
        var requests = 0;
        var client = new SfEdgeClient(new SfEdgeTestHttpClientFactory((_, _) =>
        {
            requests++;
            return Task.FromResult(SfEdgeTestHttpClientFactory.Json(json));
        }));

        Assert.Empty(await ReadProductsAsync(client));
        Assert.Equal(1, requests);
    }

    /// <summary>
    /// Verifies malformed search responses are failures, not successful empty scans.
    /// </summary>
    [Theory]
    [InlineData("{}")]
    [InlineData("""{"Payload":{}}""")]
    [InlineData("""{"Payload":{"Cards":null}}""")]
    [InlineData("""{"Payload":{"Cards":[{}]}}""")]
    [InlineData("""{"Payload":{"Cards":[{"ProductId":null}]}}""")]
    [InlineData("""{"Payload":{"Cards":[{"ProductId":" "}]}}""")]
    [InlineData("""{"Payload":{"Products":[]}}""")]
    [InlineData("""{"Payload":{"Products":[],"TotalItems":20}}""")]
    [InlineData("""{"Payload":{"Products":[{"ProductId":"Product1"}],"TotalItems":1}}""")]
    public async Task GetPwaProductIdsAsync_WhenResponseIsInvalid_ThrowsJsonException(string json)
    {
        var client = new SfEdgeClient(new SfEdgeTestHttpClientFactory((_, _) =>
            Task.FromResult(SfEdgeTestHttpClientFactory.Json(json))));

        await Assert.ThrowsAsync<JsonException>(() => ReadProductsAsync(client));
    }

    /// <summary>
    /// Verifies an API ignoring skipItems cannot cause an infinite scan.
    /// </summary>
    [Fact]
    public async Task GetPwaProductIdsAsync_WhenPageRepeats_ThrowsJsonException()
    {
        var requests = 0;
        var client = new SfEdgeClient(new SfEdgeTestHttpClientFactory((_, _) =>
        {
            requests++;
            return Task.FromResult(SfEdgeTestHttpClientFactory.Search("Product1"));
        }));

        await Assert.ThrowsAsync<JsonException>(() => ReadProductsAsync(client));
        Assert.Equal(2, requests);
    }

    /// <summary>
    /// Verifies only the requested product's details are used, with all distinct identity names extracted.
    /// </summary>
    [Fact]
    public async Task GetPackageIdsAsync_WhenPdpContainsMultipleEnvelopes_ReadsMatchingProductFamilies()
    {
        var client = new SfEdgeClient(new SfEdgeTestHttpClientFactory((request, _) =>
        {
            Assert.StartsWith("/v9.0/pages/pdp?", request.RequestUri!.PathAndQuery);
            Assert.Contains("productId=9NHKJB6LPPTV&", request.RequestUri.Query);
            return Task.FromResult(SfEdgeTestHttpClientFactory.Json("""
                [
                  {"Payload":{"PageObject":{"PackageFamilyNames":["Wrong.Nested_hash"]}}},
                  {"Payload":{"ProductId":"RELATED","PackageFamilyNames":["Wrong.Related_hash"]}},
                  {"Payload":{"ProductId":"9NHKJB6LPPTV","PackageFamilyNames":[
                    "42541BitShuva.ChavahMessianicRadio_y3m7a4hh6j3hy",
                    "42541BitShuva.ChavahMessianicRadio_otherhash",
                    "Company.App_hash",
                    "company.app_hash",
                    "Company.App2_hash"
                  ]}}
                ]
                """));
        }));

        var packageIds = await client.GetPackageIdsAsync("9NHKJB6LPPTV", CancellationToken.None);

        Assert.Equal(3, packageIds.Count);
        Assert.Contains("42541BitShuva.ChavahMessianicRadio", packageIds);
        Assert.Contains("Company.App", packageIds);
        Assert.Contains("Company.App2", packageIds);
    }

    /// <summary>
    /// Verifies empty package-family arrays are supported.
    /// </summary>
    [Fact]
    public async Task GetPackageIdsAsync_WhenProductHasNoFamilies_ReturnsEmptyCollection()
    {
        var client = new SfEdgeClient(new SfEdgeTestHttpClientFactory((_, _) =>
            Task.FromResult(SfEdgeTestHttpClientFactory.Product("Product1"))));

        Assert.Empty(await client.GetPackageIdsAsync("Product1", CancellationToken.None));
    }

    /// <summary>
    /// Verifies invalid or missing product details cannot produce guessed package matches.
    /// </summary>
    [Theory]
    [InlineData("{}")]
    [InlineData("[]")]
    [InlineData("""[{"Payload":{"ProductId":"Wrong","PackageFamilyNames":["Company.App_hash"]}}]""")]
    [InlineData("""[{"Payload":{"ProductId":"Product1"}}]""")]
    [InlineData("""[{"Payload":{"ProductId":"Product1","PackageFamilyNames":null}}]""")]
    [InlineData("""[{"Payload":{"ProductId":"Product1","PackageFamilyNames":[null]}}]""")]
    [InlineData("""[{"Payload":{"ProductId":"Product1","PackageFamilyNames":["Company.App"]}}]""")]
    [InlineData("""[{"Payload":{"ProductId":"Product1","PackageFamilyNames":["_hash"]}}]""")]
    [InlineData("""[{"Payload":{"ProductId":"Product1","PackageFamilyNames":["Company.App_"]}}]""")]
    [InlineData("""[{"Payload":{"ProductId":"Product1","PackageFamilyNames":["Company_App_hash"]}}]""")]
    public async Task GetPackageIdsAsync_WhenResponseIsInvalid_ThrowsJsonException(string json)
    {
        var client = new SfEdgeClient(new SfEdgeTestHttpClientFactory((_, _) =>
            Task.FromResult(SfEdgeTestHttpClientFactory.Json(json))));

        await Assert.ThrowsAsync<JsonException>(() => client.GetPackageIdsAsync("Product1", CancellationToken.None));
    }

    /// <summary>
    /// Verifies HTTP failures propagate rather than being interpreted as an empty catalog.
    /// </summary>
    [Fact]
    public async Task GetPwaProductIdsAsync_WhenApiFails_ThrowsHttpRequestException()
    {
        var client = new SfEdgeClient(new SfEdgeTestHttpClientFactory((_, _) =>
            Task.FromResult(SfEdgeTestHttpClientFactory.Json("{}", HttpStatusCode.ServiceUnavailable))));

        await Assert.ThrowsAsync<HttpRequestException>(() => ReadProductsAsync(client));
    }

    /// <summary>
    /// Verifies cancellation is passed to an in-flight HTTP request.
    /// </summary>
    [Fact]
    public async Task GetPackageIdsAsync_WhenCancelled_CancelsHttpRequest()
    {
        using var cancellation = new CancellationTokenSource();
        var requested = new TaskCompletionSource(TaskCreationOptions.RunContinuationsAsynchronously);
        var client = new SfEdgeClient(new SfEdgeTestHttpClientFactory(async (_, token) =>
        {
            requested.SetResult();
            await Task.Delay(Timeout.InfiniteTimeSpan, token);
            throw new InvalidOperationException("A cancelled request must not finish.");
        }));

        var request = client.GetPackageIdsAsync("Product1", cancellation.Token);
        await requested.Task.WaitAsync(TimeSpan.FromSeconds(5));
        cancellation.Cancel();

        await Assert.ThrowsAnyAsync<OperationCanceledException>(() => request);
    }

    /// <summary>
    /// Materializes the asynchronous catalog for assertions.
    /// </summary>
    private static async Task<List<string>> ReadProductsAsync(SfEdgeClient client)
    {
        var products = new List<string>();
        await foreach (var productId in client.GetPwaProductIdsAsync(CancellationToken.None))
        {
            products.Add(productId);
        }

        return products;
    }
}

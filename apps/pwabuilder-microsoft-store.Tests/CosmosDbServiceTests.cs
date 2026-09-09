using Microsoft.Azure.Cosmos;
using Microsoft.Extensions.Logging.Abstractions;
using Microsoft.Extensions.Options;
using Moq;
using Newtonsoft.Json;
using Newtonsoft.Json.Serialization;
using PWABuilder.MicrosoftStore.Models;
using System.Net;
using Xunit;

namespace PWABuilder.MicrosoftStore.Tests;

public sealed class CosmosDbServiceTests
{
    /// <summary>
    /// Verifies cross-partition query pagination, exact matching, and a productId-only patch for every returned record.
    /// </summary>
    [Fact]
    public async Task UpdateProductIdAsync_WhenMatchesSpanPages_PatchesEveryDocumentUsingItsIdPartition()
    {
        using var cancellation = new CancellationTokenSource();
        var container = new Mock<Container>();
        var iterator = CreateIterator(["record1", "record2"], ["record3"]);
        QueryDefinition? query = null;
        container.Setup(c => c.GetItemQueryIterator<string>(It.IsAny<QueryDefinition>(), null, null))
            .Callback<QueryDefinition, string, QueryRequestOptions>((definition, _, _) => query = definition)
            .Returns(iterator.Object);
        var patchedIds = new List<string>();
        container.Setup(c => c.PatchItemAsync<PwaBuilderMsStorePackage>(
                It.IsAny<string>(), It.IsAny<PartitionKey>(), It.IsAny<IReadOnlyList<PatchOperation>>(),
                It.IsAny<PatchItemRequestOptions>(), cancellation.Token))
            .Callback<string, PartitionKey, IReadOnlyList<PatchOperation>, PatchItemRequestOptions, CancellationToken>(
                (id, partition, patches, options, _) =>
                {
                    patchedIds.Add(id);
                    Assert.Equal(new PartitionKey(id), partition);
                    var patch = Assert.Single(patches);
                    Assert.Equal(PatchOperationType.Set, patch.OperationType);
                    Assert.Equal("/productId", patch.Path);
                    Assert.Equal("9NHKJB6LPPTV", Assert.IsAssignableFrom<PatchOperation<string>>(patch).Value);
                    Assert.False(options.EnableContentResponseOnWrite);
                })
            .ReturnsAsync(Mock.Of<ItemResponse<PwaBuilderMsStorePackage>>());
        var store = new CosmosDbService(container.Object, NullLogger<CosmosDbService>.Instance);

        var count = await store.UpdateProductIdAsync("42541BitShuva.ChavahMessianicRadio", "9NHKJB6LPPTV", cancellation.Token);

        Assert.Equal(3, count);
        Assert.Equal(["record1", "record2", "record3"], patchedIds);
        Assert.NotNull(query);
        Assert.Contains("STRINGEQUALS(c.packageId, @packageId, true)", query.QueryText);
        Assert.Contains("NOT IS_DEFINED(c.productId) OR IS_NULL(c.productId) OR c.productId != @productId", query.QueryText);
        Assert.Contains(query.GetQueryParameters(), p => p.Name == "@packageId" && Equals(p.Value, "42541BitShuva.ChavahMessianicRadio"));
        Assert.Contains(query.GetQueryParameters(), p => p.Name == "@productId" && Equals(p.Value, "9NHKJB6LPPTV"));
        iterator.Verify(i => i.ReadNextAsync(cancellation.Token), Times.Exactly(2));
    }

    /// <summary>
    /// Verifies no writes occur when the query finds no new or changed matches.
    /// </summary>
    [Fact]
    public async Task UpdateProductIdAsync_WhenNoDocumentsNeedUpdating_DoesNotWrite()
    {
        var container = new Mock<Container>(MockBehavior.Strict);
        container.Setup(c => c.GetItemQueryIterator<string>(It.IsAny<QueryDefinition>(), null, null))
            .Returns(CreateIterator([]).Object);
        var store = new CosmosDbService(container.Object, NullLogger<CosmosDbService>.Instance);

        Assert.Equal(0, await store.UpdateProductIdAsync("Company.App", "Product1", CancellationToken.None));
    }

    /// <summary>
    /// Verifies TTL expiry between the query and patch does not prevent other matches being updated.
    /// </summary>
    [Fact]
    public async Task UpdateProductIdAsync_WhenDocumentExpires_ContinuesToRemainingMatches()
    {
        var container = new Mock<Container>();
        container.Setup(c => c.GetItemQueryIterator<string>(It.IsAny<QueryDefinition>(), null, null))
            .Returns(CreateIterator(["expired", "present"]).Object);
        container.Setup(c => c.PatchItemAsync<PwaBuilderMsStorePackage>(
                "expired", It.IsAny<PartitionKey>(), It.IsAny<IReadOnlyList<PatchOperation>>(),
                It.IsAny<PatchItemRequestOptions>(), It.IsAny<CancellationToken>()))
            .ThrowsAsync(new CosmosException("Expired", HttpStatusCode.NotFound, 0, "test", 0));
        container.Setup(c => c.PatchItemAsync<PwaBuilderMsStorePackage>(
                "present", new PartitionKey("present"), It.IsAny<IReadOnlyList<PatchOperation>>(),
                It.IsAny<PatchItemRequestOptions>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(Mock.Of<ItemResponse<PwaBuilderMsStorePackage>>());
        var store = new CosmosDbService(container.Object, NullLogger<CosmosDbService>.Instance);

        Assert.Equal(1, await store.UpdateProductIdAsync("Company.App", "Product1", CancellationToken.None));
    }

    /// <summary>
    /// Verifies non-expiry database errors propagate to the worker's error logging.
    /// </summary>
    [Fact]
    public async Task UpdateProductIdAsync_WhenCosmosFails_PropagatesFailure()
    {
        var container = new Mock<Container>();
        container.Setup(c => c.GetItemQueryIterator<string>(It.IsAny<QueryDefinition>(), null, null))
            .Returns(CreateIterator(["record1"]).Object);
        container.Setup(c => c.PatchItemAsync<PwaBuilderMsStorePackage>(
                It.IsAny<string>(), It.IsAny<PartitionKey>(), It.IsAny<IReadOnlyList<PatchOperation>>(),
                It.IsAny<PatchItemRequestOptions>(), It.IsAny<CancellationToken>()))
            .ThrowsAsync(new CosmosException("Forbidden", HttpStatusCode.Forbidden, 0, "test", 0));
        var store = new CosmosDbService(container.Object, NullLogger<CosmosDbService>.Instance);

        await Assert.ThrowsAsync<CosmosException>(() =>
            store.UpdateProductIdAsync("Company.App", "Product1", CancellationToken.None));
    }

    /// <summary>
    /// Verifies shutdown interrupts document updates before the next write.
    /// </summary>
    [Fact]
    public async Task UpdateProductIdAsync_WhenCancelled_DoesNotPatch()
    {
        using var cancellation = new CancellationTokenSource();
        cancellation.Cancel();
        var container = new Mock<Container>(MockBehavior.Strict);
        container.Setup(c => c.GetItemQueryIterator<string>(It.IsAny<QueryDefinition>(), null, null))
            .Returns(CreateIterator(["record1"]).Object);
        var store = new CosmosDbService(container.Object, NullLogger<CosmosDbService>.Instance);

        await Assert.ThrowsAnyAsync<OperationCanceledException>(() =>
            store.UpdateProductIdAsync("Company.App", "Product1", cancellation.Token));
    }

    /// <summary>
    /// Verifies an unconfigured package store cannot report a successful update.
    /// </summary>
    [Fact]
    public async Task UpdateProductIdAsync_WhenCosmosIsUnconfigured_Throws()
    {
        var settings = Options.Create(new AppSettings { ImageGeneratorApiUrl = new Uri("https://example.com") });
        var store = new CosmosDbService(settings, NullLogger<CosmosDbService>.Instance);

        Assert.False(store.IsEnabled);
        await Assert.ThrowsAsync<InvalidOperationException>(() =>
            store.UpdateProductIdAsync("Company.App", "Product1", CancellationToken.None));
    }

    /// <summary>
    /// Verifies legacy documents remain readable and the new field follows Cosmos's camel-case serialization.
    /// </summary>
    [Fact]
    public void ProductId_WhenSerializingPackage_IsOptionalAndCamelCased()
    {
        var settings = new JsonSerializerSettings { ContractResolver = new CamelCasePropertyNamesContractResolver() };
        var package = JsonConvert.DeserializeObject<PwaBuilderMsStorePackage>(
            """{"id":"record1","packageId":"Company.App"}""", settings);
        Assert.NotNull(package);
        Assert.Null(package.ProductId);

        package.ProductId = "Product1";
        var json = JsonConvert.SerializeObject(package, settings);

        Assert.Contains("\"productId\":\"Product1\"", json);
        Assert.Contains("\"packageId\":\"Company.App\"", json);
    }

    /// <summary>
    /// Creates a paged Cosmos query result without requiring an emulator.
    /// </summary>
    private static Mock<FeedIterator<string>> CreateIterator(params string[][] pages)
    {
        var iterator = new Mock<FeedIterator<string>>();
        var index = 0;
        iterator.SetupGet(i => i.HasMoreResults).Returns(() => index < pages.Length);
        iterator.Setup(i => i.ReadNextAsync(It.IsAny<CancellationToken>())).Returns(() =>
        {
            var page = pages[index++];
            var response = new Mock<FeedResponse<string>>();
            response.Setup(r => r.GetEnumerator()).Returns(() => ((IEnumerable<string>)page).GetEnumerator());
            return Task.FromResult(response.Object);
        });
        return iterator;
    }
}

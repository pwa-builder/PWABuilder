using Azure.Identity;
using Microsoft.Azure.Cosmos;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Logging.Abstractions;
using Moq;
using PWABuilder.MicrosoftStore.Services;
using System.Net;
using System.Threading.Channels;
using Xunit;

namespace PWABuilder.MicrosoftStore.Tests;

public sealed class StorePwaServiceTests
{
    /// <summary>
    /// Verifies every distinct package identity is matched to its search product ID.
    /// </summary>
    [Fact]
    public async Task SynchronizeAsync_WhenProductsHaveMultipleFamilies_UpdatesAllMatchingIdentities()
    {
        using var cancellation = new CancellationTokenSource();
        var searchCount = 0;
        var client = new SfEdgeClient(new SfEdgeTestHttpClientFactory((request, _) =>
            Task.FromResult(request.RequestUri!.AbsolutePath.EndsWith("searchbytags", StringComparison.Ordinal)
                ? ++searchCount == 1
                    ? SfEdgeTestHttpClientFactory.Search("9NHKJB6LPPTV")
                    : SfEdgeTestHttpClientFactory.Search()
                : SfEdgeTestHttpClientFactory.Product("9NHKJB6LPPTV",
                    "42541BitShuva.ChavahMessianicRadio_y3m7a4hh6j3hy", "Company.Second_hash"))));
        var store = new Mock<IMsStorePackageStore>(MockBehavior.Strict);
        store.Setup(s => s.UpdateProductIdAsync("42541BitShuva.ChavahMessianicRadio", "9NHKJB6LPPTV", cancellation.Token))
            .ReturnsAsync(3);
        store.Setup(s => s.UpdateProductIdAsync("Company.Second", "9NHKJB6LPPTV", cancellation.Token))
            .ReturnsAsync(0);
        using var service = new StorePwaService(client, store.Object, TimeProvider.System, NullLogger<StorePwaService>.Instance);

        await service.SynchronizeAsync(cancellation.Token);

        store.VerifyAll();
    }

    /// <summary>
    /// Verifies a failed product does not prevent subsequent products from being matched.
    /// </summary>
    [Theory]
    [InlineData("http")]
    [InlineData("json")]
    [InlineData("timeout")]
    [InlineData("cosmos")]
    public async Task SynchronizeAsync_WhenOneProductFails_LogsFailureAndContinues(string failure)
    {
        var searches = 0;
        var client = new SfEdgeClient(new SfEdgeTestHttpClientFactory((request, _) =>
        {
            if (request.RequestUri!.AbsolutePath.EndsWith("searchbytags", StringComparison.Ordinal))
            {
                return Task.FromResult(++searches == 1
                    ? SfEdgeTestHttpClientFactory.Search("Failed", "Published")
                    : SfEdgeTestHttpClientFactory.Search());
            }

            if (request.RequestUri.Query.Contains("productId=Failed&", StringComparison.Ordinal))
            {
                return failure switch
                {
                    "http" => Task.FromResult(SfEdgeTestHttpClientFactory.Json("{}", HttpStatusCode.NotFound)),
                    "json" => Task.FromResult(SfEdgeTestHttpClientFactory.Json("{}")),
                    "timeout" => Task.FromException<HttpResponseMessage>(new TaskCanceledException("Timed out")),
                    "cosmos" => Task.FromResult(SfEdgeTestHttpClientFactory.Product("Failed", "Company.Failed_hash")),
                    _ => throw new InvalidOperationException("Unknown failure kind.")
                };
            }

            return Task.FromResult(SfEdgeTestHttpClientFactory.Product("Published", "Company.Published_hash"));
        }));
        var store = new Mock<IMsStorePackageStore>(MockBehavior.Strict);
        if (failure is "cosmos")
        {
            store.Setup(s => s.UpdateProductIdAsync("Company.Failed", "Failed", CancellationToken.None))
                .ThrowsAsync(new CosmosException("Unavailable", HttpStatusCode.ServiceUnavailable, 0, "test", 0));
        }
        store.Setup(s => s.UpdateProductIdAsync("Company.Published", "Published", CancellationToken.None))
            .ReturnsAsync(1);
        var logger = new Mock<ILogger<StorePwaService>>();
        using var service = new StorePwaService(client, store.Object, TimeProvider.System, logger.Object);

        await service.SynchronizeAsync(CancellationToken.None);

        store.VerifyAll();
        logger.Verify(l => l.Log(
            LogLevel.Error, It.IsAny<EventId>(),
            It.Is<It.IsAnyType>((state, _) => state.ToString()!.Contains("Failed")),
            It.IsAny<Exception>(), It.IsAny<Func<It.IsAnyType, Exception?, string>>()), Times.Once);
    }

    /// <summary>
    /// Verifies cancellation stops the scan instead of being treated as a retryable product failure.
    /// </summary>
    [Fact]
    public async Task SynchronizeAsync_WhenCancelled_StopsBeforeNextProduct()
    {
        using var cancellation = new CancellationTokenSource();
        var client = new SfEdgeClient(new SfEdgeTestHttpClientFactory((request, _) =>
        {
            if (request.RequestUri!.AbsolutePath.EndsWith("searchbytags", StringComparison.Ordinal))
            {
                return Task.FromResult(SfEdgeTestHttpClientFactory.Search("First", "NeverFetched"));
            }
            Assert.Contains("productId=First&", request.RequestUri.Query);
            cancellation.Cancel();
            return Task.FromCanceled<HttpResponseMessage>(cancellation.Token);
        }));
        var store = new Mock<IMsStorePackageStore>(MockBehavior.Strict);
        using var service = new StorePwaService(client, store.Object, TimeProvider.System, NullLogger<StorePwaService>.Instance);

        await Assert.ThrowsAnyAsync<OperationCanceledException>(() => service.SynchronizeAsync(cancellation.Token));
    }

    /// <summary>
    /// Verifies unconfigured environments make no Store requests or schedule timers.
    /// </summary>
    [Fact]
    public async Task ExecuteAsync_WhenCosmosIsDisabled_DoesNotScan()
    {
        var client = new SfEdgeClient(new SfEdgeTestHttpClientFactory((_, _) =>
            throw new InvalidOperationException("SFEdge must not be called.")));
        var store = new Mock<IMsStorePackageStore>();
        store.SetupGet(s => s.IsEnabled).Returns(false);
        var clock = new ManualTimeProvider();
        using var service = new StorePwaService(client, store.Object, clock, NullLogger<StorePwaService>.Instance);

        await service.StartAsync(CancellationToken.None);
        await service.ExecuteTask!.WaitAsync(TimeSpan.FromSeconds(5));

        Assert.False(clock.Timers.Reader.TryRead(out _));
    }

    /// <summary>
    /// Verifies the five-minute startup delay, daily cadence, non-overlap, retry after failure, and clean shutdown.
    /// </summary>
    [Fact]
    public async Task ExecuteAsync_WhenTimerTicks_RetriesDailyWithoutOverlappingScans()
    {
        var requests = Channel.CreateUnbounded<int>();
        var releaseFirstRequest = new TaskCompletionSource(TaskCreationOptions.RunContinuationsAsynchronously);
        var requestCount = 0;
        var client = new SfEdgeClient(new SfEdgeTestHttpClientFactory(async (_, token) =>
        {
            var count = Interlocked.Increment(ref requestCount);
            await requests.Writer.WriteAsync(count, token);
            if (count is 1)
            {
                await releaseFirstRequest.Task.WaitAsync(token);
                return SfEdgeTestHttpClientFactory.Json("{}", HttpStatusCode.ServiceUnavailable);
            }
            return SfEdgeTestHttpClientFactory.Search();
        }));
        var store = new Mock<IMsStorePackageStore>();
        store.SetupGet(s => s.IsEnabled).Returns(true);
        var clock = new ManualTimeProvider();
        using var service = new StorePwaService(client, store.Object, clock, NullLogger<StorePwaService>.Instance);
        await service.StartAsync(CancellationToken.None);
        try
        {
            var startup = await clock.Timers.Reader.ReadAsync().AsTask().WaitAsync(TimeSpan.FromSeconds(5));
            Assert.Equal(TimeSpan.FromMinutes(5), startup.DueTime);
            Assert.Equal(Timeout.InfiniteTimeSpan, startup.Period);
            Assert.Equal(0, Volatile.Read(ref requestCount));

            startup.Fire();
            var daily = await clock.Timers.Reader.ReadAsync().AsTask().WaitAsync(TimeSpan.FromSeconds(5));
            Assert.Equal(TimeSpan.FromHours(24), daily.DueTime);
            Assert.Equal(TimeSpan.FromHours(24), daily.Period);
            Assert.Equal(1, await requests.Reader.ReadAsync().AsTask().WaitAsync(TimeSpan.FromSeconds(5)));

            daily.Fire();
            daily.Fire();
            Assert.Equal(1, Volatile.Read(ref requestCount));
            releaseFirstRequest.SetResult();

            Assert.Equal(2, await requests.Reader.ReadAsync().AsTask().WaitAsync(TimeSpan.FromSeconds(5)));
            Assert.Equal(2, Volatile.Read(ref requestCount));
        }
        finally
        {
            await service.StopAsync(CancellationToken.None).WaitAsync(TimeSpan.FromSeconds(5));
        }

        Assert.True(service.ExecuteTask!.IsCompletedSuccessfully);
    }

    /// <summary>
    /// Verifies managed identity failures defer the scan instead of stopping the packaging host.
    /// </summary>
    [Theory]
    [InlineData(true)]
    [InlineData(false)]
    public async Task ExecuteAsync_WhenCosmosAuthenticationFails_RetriesNextDay(bool credentialUnavailable)
    {
        var searches = 0;
        var client = new SfEdgeClient(new SfEdgeTestHttpClientFactory((request, _) =>
            Task.FromResult(request.RequestUri!.AbsolutePath.EndsWith("searchbytags", StringComparison.Ordinal)
                ? ++searches <= 2
                    ? SfEdgeTestHttpClientFactory.Search("Product1")
                    : SfEdgeTestHttpClientFactory.Search()
                : SfEdgeTestHttpClientFactory.Product("Product1", "Company.App_hash"))));
        var updates = Channel.CreateUnbounded<int>();
        var updateCount = 0;
        var store = new Mock<IMsStorePackageStore>();
        store.SetupGet(s => s.IsEnabled).Returns(true);
        store.Setup(s => s.UpdateProductIdAsync("Company.App", "Product1", It.IsAny<CancellationToken>()))
            .Returns(() =>
            {
                var count = Interlocked.Increment(ref updateCount);
                updates.Writer.TryWrite(count);
                if (count is 1)
                {
                    AuthenticationFailedException error = credentialUnavailable
                        ? new CredentialUnavailableException("Managed identity unavailable")
                        : new AuthenticationFailedException("Managed identity authentication failed");
                    return Task.FromException<int>(error);
                }

                return Task.FromResult(1);
            });
        var clock = new ManualTimeProvider();
        using var service = new StorePwaService(client, store.Object, clock, NullLogger<StorePwaService>.Instance);
        await service.StartAsync(CancellationToken.None);
        try
        {
            var startup = await clock.Timers.Reader.ReadAsync().AsTask().WaitAsync(TimeSpan.FromSeconds(5));
            startup.Fire();
            var daily = await clock.Timers.Reader.ReadAsync().AsTask().WaitAsync(TimeSpan.FromSeconds(5));
            Assert.Equal(1, await updates.Reader.ReadAsync().AsTask().WaitAsync(TimeSpan.FromSeconds(5)));

            daily.Fire();

            Assert.Equal(2, await updates.Reader.ReadAsync().AsTask().WaitAsync(TimeSpan.FromSeconds(5)));
        }
        finally
        {
            await service.StopAsync(CancellationToken.None).WaitAsync(TimeSpan.FromSeconds(5));
        }

        Assert.True(service.ExecuteTask!.IsCompletedSuccessfully);
    }

    private sealed class ManualTimeProvider : TimeProvider
    {
        /// <summary>
        /// Timers created by the worker, exposed for deterministic advancement.
        /// </summary>
        public Channel<ManualTimer> Timers { get; } = Channel.CreateUnbounded<ManualTimer>();

        /// <inheritdoc/>
        public override ITimer CreateTimer(TimerCallback callback, object? state, TimeSpan dueTime, TimeSpan period)
        {
            var timer = new ManualTimer(callback, state, dueTime, period);
            this.Timers.Writer.TryWrite(timer);
            return timer;
        }
    }

    private sealed class ManualTimer(TimerCallback callback, object? state, TimeSpan dueTime, TimeSpan period) : ITimer
    {
        private bool disposed;

        /// <summary>
        /// The configured initial delay.
        /// </summary>
        public TimeSpan DueTime { get; private set; } = dueTime;

        /// <summary>
        /// The configured repeat interval.
        /// </summary>
        public TimeSpan Period { get; private set; } = period;

        /// <summary>
        /// Fires a timer callback without waiting for wall-clock time.
        /// </summary>
        public void Fire()
        {
            if (!this.disposed)
            {
                callback(state);
            }
        }

        /// <inheritdoc/>
        public bool Change(TimeSpan dueTime, TimeSpan period)
        {
            this.DueTime = dueTime;
            this.Period = period;
            return !this.disposed;
        }

        /// <inheritdoc/>
        public void Dispose() => this.disposed = true;

        /// <inheritdoc/>
        public ValueTask DisposeAsync()
        {
            Dispose();
            return ValueTask.CompletedTask;
        }
    }
}

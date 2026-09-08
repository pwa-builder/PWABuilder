using Microsoft.Extensions.Logging.Abstractions;
using Microsoft.Extensions.Options;
using PWABuilder.MicrosoftStore.Jobs;
using PWABuilder.MicrosoftStore.Models;
using Xunit;

namespace PWABuilder.MicrosoftStore.Tests;

public sealed class WindowsPackageJobTests
{
    [Fact]
    public async Task Process_WhenSuccessful_PersistsArtifactAndCompletionBeforeAcknowledging()
    {
        var fixture = new Fixture();
        await fixture.Process();

        Assert.Equal(WindowsPackageJob.Completed, fixture.Store.Job!.Status);
        Assert.Equal(["build", "upload", "complete", "ack"], fixture.Events);
        Assert.Equal("Partner", fixture.Builder.Input!.Analytics.PlatformId);
    }

    [Fact]
    public async Task Process_WhenCompletedMessageIsRedelivered_DoesNotBuildAgain()
    {
        var fixture = new Fixture();
        await fixture.Process();
        fixture.Events.Clear();
        await fixture.Process();

        Assert.Equal(["ack"], fixture.Events);
        Assert.Equal(1, fixture.Builder.Builds);
    }

    [Fact]
    public async Task Process_WhenWorkerCrashed_ReclaimsExpiredAttempt()
    {
        var fixture = new Fixture();
        fixture.Store.Job = fixture.Store.Job! with
        {
            Status = WindowsPackageJob.InProgress,
            LeaseExpiresAt = DateTimeOffset.UtcNow.AddMinutes(-1),
            Attempts = 1
        };
        await fixture.Process();

        Assert.Equal(WindowsPackageJob.Completed, fixture.Store.Job!.Status);
        Assert.Equal(2, fixture.Store.Job.Attempts);
    }

    [Fact]
    public async Task Process_WhenAnotherWorkerOwnsJob_DoesNotBuildOrAcknowledge()
    {
        var fixture = new Fixture();
        fixture.Store.Job = fixture.Store.Job! with
        {
            Status = WindowsPackageJob.InProgress,
            LeaseExpiresAt = DateTimeOffset.UtcNow.AddMinutes(5)
        };
        await fixture.Process();

        Assert.Equal(0, fixture.Builder.Builds);
        Assert.DoesNotContain("ack", fixture.Events);
    }

    [Fact]
    public async Task Process_WhenBuildFails_LeavesMessageForRetry()
    {
        var fixture = new Fixture();
        fixture.Builder.Error = new IOException("Transient tool failure");
        await fixture.Process();

        Assert.Equal(WindowsPackageJob.Queued, fixture.Store.Job!.Status);
        Assert.Equal(1, fixture.Store.Job.Attempts);
        Assert.False(fixture.Store.Job.NeedsDispatch);
        Assert.DoesNotContain("ack", fixture.Events);
    }

    [Fact]
    public async Task Process_WhenAttemptsExhausted_PoisonsBeforeAcknowledging()
    {
        var fixture = new Fixture();
        fixture.Store.Job = fixture.Store.Job! with { Attempts = 3 };
        await fixture.Process();

        Assert.Equal(WindowsPackageJob.Failed, fixture.Store.Job!.Status);
        Assert.Equal(0, fixture.Builder.Builds);
        Assert.True(fixture.Events.IndexOf("poison") < fixture.Events.IndexOf("ack"));
    }

    [Fact]
    public async Task Process_WhenUploadFails_DoesNotReportCompletion()
    {
        var fixture = new Fixture();
        fixture.Store.UploadError = new IOException("Storage unavailable");
        await fixture.Process();

        Assert.Equal(WindowsPackageJob.Queued, fixture.Store.Job!.Status);
        Assert.DoesNotContain("complete", fixture.Events);
        Assert.DoesNotContain("ack", fixture.Events);
    }

    [Fact]
    public async Task Process_WhenCancelled_LeavesMessageRecoverable()
    {
        var fixture = new Fixture();
        using var cancellation = new CancellationTokenSource();
        fixture.Builder.OnBuild = cancellation.Cancel;
        await fixture.Process(cancellation.Token);

        Assert.DoesNotContain("ack", fixture.Events);
        Assert.NotEqual(WindowsPackageJob.Completed, fixture.Store.Job!.Status);
    }

    [Fact]
    public async Task Process_WhenExpired_DoesNotBuild()
    {
        var fixture = new Fixture();
        fixture.Store.Job = fixture.Store.Job! with { ExpiresAt = DateTimeOffset.UtcNow.AddSeconds(-1) };
        await fixture.Process();

        Assert.Equal(WindowsPackageJob.Expired, fixture.Store.Job!.Status);
        Assert.Equal(0, fixture.Builder.Builds);
        Assert.Contains("ack", fixture.Events);
    }

    [Fact]
    public async Task Dispatch_WhenEnqueueFails_PreservesPendingRecord()
    {
        var fixture = new Fixture();
        fixture.Queue.SendError = new IOException("Queue unavailable");
        await Assert.ThrowsAsync<IOException>(() => fixture.Processor.DispatchAsync(CancellationToken.None));
        Assert.True(fixture.Store.Job!.NeedsDispatch);

        fixture.Queue.SendError = null;
        await fixture.Processor.DispatchAsync(CancellationToken.None);
        Assert.False(fixture.Store.Job.NeedsDispatch);
        Assert.Equal(fixture.Store.Job.Id, fixture.Queue.SentJobId);
    }

    [Fact]
    public async Task Process_WhenCompletionETagChanged_DoesNotAcknowledgeOrPublishStaleOutput()
    {
        var fixture = new Fixture();
        fixture.Store.RejectCompletion = true;
        await Assert.ThrowsAsync<InvalidOperationException>(() => fixture.Process());

        Assert.DoesNotContain("ack", fixture.Events);
        Assert.NotEqual(WindowsPackageJob.Completed, fixture.Store.Job!.Status);
    }

    [Fact]
    public async Task Process_WhenVisibilityRenewalFails_CancelsBuildAndDoesNotAcknowledge()
    {
        var fixture = new Fixture(new WindowsPackageJobOptions { RenewalSeconds = 1 });
        fixture.Queue.RenewError = new IOException("Lease lost");
        fixture.Builder.WaitForCancellation = true;
        await Assert.ThrowsAsync<IOException>(() => fixture.Process().WaitAsync(TimeSpan.FromSeconds(10)));

        Assert.True(fixture.Builder.WasCancelled);
        Assert.DoesNotContain("ack", fixture.Events);
        Assert.DoesNotContain("complete", fixture.Events);
    }

    [Fact]
    public async Task Process_WhenPoisonWriteFails_DoesNotAcknowledge()
    {
        var fixture = new Fixture();
        fixture.Store.Job = fixture.Store.Job! with { Attempts = 3 };
        fixture.Queue.PoisonError = new IOException("Poison storage unavailable");
        await Assert.ThrowsAsync<IOException>(() => fixture.Process());

        Assert.Equal(WindowsPackageJob.Failed, fixture.Store.Job!.Status);
        Assert.DoesNotContain("ack", fixture.Events);
    }

    [Fact]
    public async Task Process_AfterVisibilityRenewal_AcknowledgesLatestReceipt()
    {
        var fixture = new Fixture(new WindowsPackageJobOptions { RenewalSeconds = 1 });
        var renewed = new TaskCompletionSource(TaskCreationOptions.RunContinuationsAsynchronously);
        fixture.Queue.OnRenew = () => renewed.TrySetResult();
        fixture.Builder.WaitFor = renewed.Task;
        await fixture.Process().WaitAsync(TimeSpan.FromSeconds(10));

        Assert.NotNull(fixture.Queue.LatestReceipt);
        Assert.NotEqual("receipt", fixture.Queue.DeletedReceipt);
        Assert.Equal(fixture.Queue.LatestReceipt, fixture.Queue.DeletedReceipt);
        Assert.Equal(WindowsPackageJob.Completed, fixture.Store.Job!.Status);
    }

    [Fact]
    public async Task Lease_WhenRenewalFailsWhileCompletionWaits_DoesNotPublishCompletion()
    {
        var staleCompletions = 0;
        for (var i = 0; i < 2000; i++)
        {
            var fixture = new Fixture();
            var renewalResponse = new TaskCompletionSource<PackageJobMessage>(TaskCreationOptions.RunContinuationsAsynchronously);
            fixture.Queue.RenewResponse = renewalResponse.Task;
            fixture.Store.Job = fixture.Store.Job! with { LeaseExpiresAt = DateTimeOffset.UtcNow.AddMinutes(2) };
            using var lease = new PackageJobLease(fixture.Store, fixture.Queue, fixture.Store.Job,
                new PackageJobMessage("message", "receipt", fixture.Store.Job.Id, 1),
                new WindowsPackageJobOptions { RenewalSeconds = 0 }, TimeProvider.System);
            using var build = new CancellationTokenSource();
            using var stopRenewal = new CancellationTokenSource();
            var renew = lease.RenewUntilStoppedAsync(build, stopRenewal.Token);
            var finish = lease.FinishAsync(j => j with { Status = WindowsPackageJob.Completed }, default);

            renewalResponse.SetException(new IOException("Visibility renewal failed"));
            await Assert.ThrowsAsync<IOException>(() => renew);
            try
            {
                await finish;
                staleCompletions++;
            }
            catch (InvalidOperationException)
            {
                Assert.NotEqual(WindowsPackageJob.Completed, fixture.Store.Job.Status);
            }
        }
        Assert.Equal(0, staleCompletions);
    }

    internal sealed class Fixture
    {
        internal readonly List<string> Events = [];
        internal readonly FakeStore Store;
        internal readonly FakeQueue Queue;
        internal readonly FakeBuilder Builder;
        internal readonly WindowsPackageJobProcessor Processor;

        internal Fixture(WindowsPackageJobOptions? options = null)
        {
            Store = new FakeStore(Events);
            Queue = new FakeQueue(Events);
            Builder = new FakeBuilder(Events);
            Processor = new WindowsPackageJobProcessor(Store, Queue, Builder,
                Options.Create(options ?? new WindowsPackageJobOptions()), TimeProvider.System,
                NullLogger<WindowsPackageJobProcessor>.Instance);
        }

        internal Task Process(CancellationToken token = default) =>
            Processor.ProcessAsync(new PackageJobMessage("message", "receipt", Store.Job!.Id, 1), token);
    }

    internal sealed class FakeStore(List<string> events) : IWindowsPackageJobStore
    {
        internal WindowsPackageJob? Job = new()
        {
            Id = Guid.NewGuid().ToString("N"),
            CreatedAt = DateTimeOffset.UtcNow,
            ExpiresAt = DateTimeOffset.UtcNow.AddDays(1),
            ETag = "0"
        };
        internal Exception? UploadError;
        internal bool RejectCompletion;
        internal WindowsPackageJobInput? SavedInput;

        public Task CreateAsync(WindowsPackageJob job, WindowsPackageJobInput input, CancellationToken token)
        {
            SavedInput = input;
            Job = job with { ETag = "0" };
            return Task.CompletedTask;
        }

        public Task<WindowsPackageJob?> GetAsync(string id, CancellationToken token) =>
            Task.FromResult(Job?.Id == id ? Job : null);

        public Task<IReadOnlyList<WindowsPackageJob>> GetPendingDispatchAsync(CancellationToken token) =>
            Task.FromResult<IReadOnlyList<WindowsPackageJob>>(Job is { NeedsDispatch: true } ? [Job] : []);

        public Task<WindowsPackageJob?> TryReplaceAsync(WindowsPackageJob job, CancellationToken token)
        {
            token.ThrowIfCancellationRequested();
            if (Job?.ETag != job.ETag || (RejectCompletion && job.Status == WindowsPackageJob.Completed))
            {
                return Task.FromResult<WindowsPackageJob?>(null);
            }

            Job = job with { ETag = Guid.NewGuid().ToString() };
            if (Job.Status == WindowsPackageJob.Completed)
            {
                events.Add("complete");
            }
            return Task.FromResult<WindowsPackageJob?>(Job);
        }

        public Task<WindowsPackageJobInput> ReadInputAsync(string id, CancellationToken token) =>
            Task.FromResult(new WindowsPackageJobInput
            {
                Options = new WindowsAppPackageOptions { Url = new Uri("https://example.com") },
                Analytics = new PackageJobAnalytics { PlatformId = "Partner" }
            });

        public Task<string> UploadArtifactAsync(string id, string attemptId, string path, CancellationToken token)
        {
            if (UploadError is not null)
            {
                throw UploadError;
            }
            events.Add("upload");
            return Task.FromResult($"{id}/{attemptId}.zip");
        }

        public Task<Stream> OpenArtifactAsync(string name, CancellationToken token) =>
            Task.FromResult<Stream>(new MemoryStream([1, 2, 3]));
    }

    internal sealed class FakeQueue(List<string> events) : IWindowsPackageJobQueue
    {
        internal Exception? SendError;
        internal Exception? RenewError;
        internal Exception? PoisonError;
        internal string? SentJobId;
        internal Action? OnRenew;
        internal string? LatestReceipt;
        internal string? DeletedReceipt;
        internal Task<PackageJobMessage>? RenewResponse;

        public Task SendAsync(string jobId, CancellationToken token)
        {
            if (SendError is not null)
            {
                throw SendError;
            }
            SentJobId = jobId;
            return Task.CompletedTask;
        }

        public Task<PackageJobMessage?> ReceiveAsync(CancellationToken token) =>
            Task.FromResult<PackageJobMessage?>(null);

        public Task<PackageJobMessage> RenewAsync(PackageJobMessage message, TimeSpan visibility, CancellationToken token)
        {
            if (RenewResponse is not null)
            {
                return RenewResponse;
            }
            if (RenewError is not null)
            {
                throw RenewError;
            }
            LatestReceipt = Guid.NewGuid().ToString();
            OnRenew?.Invoke();
            return Task.FromResult(message with { PopReceipt = LatestReceipt });
        }

        public Task DeleteAsync(PackageJobMessage message, CancellationToken token)
        {
            DeletedReceipt = message.PopReceipt;
            events.Add("ack");
            return Task.CompletedTask;
        }

        public Task PoisonAsync(PackageJobMessage message, string reason, CancellationToken token)
        {
            if (PoisonError is not null)
            {
                throw PoisonError;
            }
            events.Add("poison");
            return Task.CompletedTask;
        }
    }

    internal sealed class FakeBuilder(List<string> events) : IWindowsPackageJobBuilder
    {
        internal int Builds;
        internal WindowsPackageJobInput? Input;
        internal Exception? Error;
        internal Action? OnBuild;
        internal bool WaitForCancellation;
        internal bool WasCancelled;
        internal Task? WaitFor;

        public async Task<string> BuildAsync(WindowsPackageJobInput input, CancellationToken token)
        {
            Builds++;
            Input = input;
            events.Add("build");
            OnBuild?.Invoke();
            token.ThrowIfCancellationRequested();
            if (WaitFor is not null)
            {
                await WaitFor.WaitAsync(token);
            }
            if (WaitForCancellation)
            {
                try
                {
                    await Task.Delay(Timeout.InfiniteTimeSpan, token);
                }
                catch (OperationCanceledException)
                {
                    WasCancelled = true;
                    throw;
                }
            }
            if (Error is not null)
            {
                throw Error;
            }
            return "package.zip";
        }
    }
}

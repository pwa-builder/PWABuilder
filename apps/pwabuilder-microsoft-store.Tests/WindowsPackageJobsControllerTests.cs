using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;
using PWABuilder.MicrosoftStore.Controllers;
using PWABuilder.MicrosoftStore.Jobs;
using PWABuilder.MicrosoftStore.Models;
using Xunit;

namespace PWABuilder.MicrosoftStore.Tests;

public sealed class WindowsPackageJobsControllerTests
{
    [Fact]
    public async Task Enqueue_WhenDisabled_ReturnsServiceUnavailable()
    {
        var controller = CreateController(false);
        var response = Assert.IsType<ObjectResult>(await controller.EnqueuePackageJob(ValidOptions(), default));
        Assert.Equal(503, response.StatusCode);
    }

    [Fact]
    public async Task Enqueue_WhenValid_PersistsBeforeReturningAccepted()
    {
        var store = new WindowsPackageJobTests.FakeStore([]);
        var controller = CreateController(true, store);
        controller.Request.Headers["platform-identifier"] = "Partner";
        controller.Request.Headers["platform-identifier-version"] = "2";
        controller.Request.Headers["correlation-id"] = "trace-id";
        var response = Assert.IsType<AcceptedResult>(await controller.EnqueuePackageJob(ValidOptions(), default));
        var status = Assert.IsType<WindowsPackageJobStatus>(response.Value);

        Assert.Equal(store.Job!.Id, status.Id);
        Assert.Equal("Partner", store.Job.PlatformId);
        Assert.True(store.Job.NeedsDispatch);
        Assert.Equal($"/msix/getPackageJob?id={status.Id}", response.Location);
        Assert.Equal("2", controller.Response.Headers.RetryAfter);
    }

    [Fact]
    public async Task Enqueue_WhenInvalid_DoesNotPersist()
    {
        var store = new WindowsPackageJobTests.FakeStore([]);
        var original = store.Job;
        var controller = CreateController(true, store);
        var response = await controller.EnqueuePackageJob(new WindowsAppPackageOptions
        {
            Url = new Uri("http://localhost")
        }, default);

        Assert.IsType<BadRequestObjectResult>(response);
        Assert.Same(original, store.Job);
    }

    [Fact]
    public async Task GetStatus_DoesNotExposePrivateBuildInputsOrLease()
    {
        var store = new WindowsPackageJobTests.FakeStore([]);
        var controller = CreateController(true, store);
        var response = Assert.IsType<OkObjectResult>(await controller.GetPackageJob(store.Job!.Id, default));
        var json = System.Text.Json.JsonSerializer.Serialize(response.Value);

        Assert.DoesNotContain("Options", json);
        Assert.DoesNotContain("ETag", json);
        Assert.DoesNotContain("Lease", json);
        Assert.DoesNotContain("ArtifactName", json);
    }

    [Fact]
    public async Task Download_WhenNotCompleted_ReturnsConflict()
    {
        var store = new WindowsPackageJobTests.FakeStore([]);
        var controller = CreateController(true, store);
        Assert.IsType<ConflictObjectResult>(await controller.DownloadPackageZip(store.Job!.Id, default));
    }

    [Fact]
    public async Task Download_WhenCompleted_ReturnsStream()
    {
        var store = new WindowsPackageJobTests.FakeStore([]);
        store.Job = store.Job! with { Status = WindowsPackageJob.Completed, ArtifactName = "output.zip" };
        var controller = CreateController(true, store);
        var response = Assert.IsType<FileStreamResult>(await controller.DownloadPackageZip(store.Job.Id, default));

        Assert.Equal("application/zip", response.ContentType);
        await response.FileStream.DisposeAsync();
    }

    [Fact]
    public async Task Download_WhenExpired_ReturnsGone()
    {
        var store = new WindowsPackageJobTests.FakeStore([]);
        store.Job = store.Job! with
        {
            Status = WindowsPackageJob.Completed,
            ArtifactName = "output.zip",
            ExpiresAt = DateTimeOffset.UtcNow.AddSeconds(-1)
        };
        var controller = CreateController(true, store);
        var response = Assert.IsType<ObjectResult>(await controller.DownloadPackageZip(store.Job.Id, default));
        Assert.Equal(410, response.StatusCode);
    }

    private static WindowsPackageJobsController CreateController(bool enabled, IWindowsPackageJobStore? store = null) =>
        new(Options.Create(new WindowsPackageJobOptions { Enabled = enabled }),
            Options.Create(new AppSettings { ImageGeneratorApiUrl = new Uri("https://example.com/images") }),
            TimeProvider.System, store)
        {
            ControllerContext = new ControllerContext { HttpContext = new DefaultHttpContext() }
        };

    private static WindowsAppPackageOptions ValidOptions() => new()
    {
        Url = new Uri("https://example.com"),
        PackageId = "Example.App",
        Version = "1.0.0"
    };
}

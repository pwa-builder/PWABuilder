using System.Net;
using System.Net.Http.Json;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using PWABuilder.MicrosoftStore.Controllers;
using PWABuilder.MicrosoftStore.Jobs;
using PWABuilder.MicrosoftStore.Models;
using Xunit;

namespace PWABuilder.MicrosoftStore.Tests;

public sealed class WindowsPackageJobsHttpTests
{
    [Fact]
    public async Task QueuedEndpoints_AcceptPollAndStreamUsingRealHttpRouting()
    {
        var store = new WindowsPackageJobTests.FakeStore([]);
        await using var app = CreateApp(store);
        await app.StartAsync();
        using var client = new HttpClient { BaseAddress = new Uri(app.Urls.Single()) };
        client.DefaultRequestHeaders.Add("platform-identifier", "Partner");
        client.DefaultRequestHeaders.Add("platform-identifier-version", "2");
        client.DefaultRequestHeaders.Add("correlation-id", "partner-trace");

        using var enqueue = await client.PostAsJsonAsync("/msix/enqueuePackageJob?ref=partner", new
        {
            url = "https://example.com",
            packageId = "Example.Pwa",
            version = "1.0.0",
            manifest = new { name = "Example" }
        });
        Assert.Equal(HttpStatusCode.Accepted, enqueue.StatusCode);
        var accepted = await enqueue.Content.ReadFromJsonAsync<WindowsPackageJobStatus>();
        Assert.NotNull(accepted);
        Assert.Equal("Queued", accepted.Status);
        Assert.Equal("partner-trace", store.SavedInput!.Analytics.CorrelationId);
        Assert.Equal("Partner", store.SavedInput.Analytics.PlatformId);
        Assert.Equal("2", store.SavedInput.Analytics.PlatformVersion);
        Assert.Equal("partner", store.SavedInput.Analytics.Referrer);
        Assert.Equal("Example", store.SavedInput.Options.Manifest!.RootElement.GetProperty("name").GetString());

        using var poll = await client.GetAsync(enqueue.Headers.Location);
        Assert.Equal(HttpStatusCode.OK, poll.StatusCode);
        var status = await poll.Content.ReadFromJsonAsync<WindowsPackageJobStatus>();
        Assert.Equal(accepted.Id, status!.Id);

        store.Job = store.Job! with { Status = WindowsPackageJob.Completed, ArtifactName = "artifact.zip" };
        using var download = await client.GetAsync($"/msix/downloadPackageZip?id={accepted.Id}");
        Assert.Equal(HttpStatusCode.OK, download.StatusCode);
        Assert.Equal("application/zip", download.Content.Headers.ContentType!.MediaType);
        Assert.Equal(new byte[] { 1, 2, 3 }, await download.Content.ReadAsByteArrayAsync());
        await app.StopAsync();
    }

    [Fact]
    public async Task Enqueue_WhenRequiredUrlIsMissing_ReturnsBadRequestWithoutPersisting()
    {
        var store = new WindowsPackageJobTests.FakeStore([]);
        await using var app = CreateApp(store);
        await app.StartAsync();
        using var client = new HttpClient { BaseAddress = new Uri(app.Urls.Single()) };
        using var response = await client.PostAsJsonAsync("/msix/enqueuePackageJob", new { packageId = "Example.Pwa", version = "1.0.0" });

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        Assert.Null(store.SavedInput);
        await app.StopAsync();
    }

    private static WebApplication CreateApp(IWindowsPackageJobStore store)
    {
        var builder = WebApplication.CreateBuilder();
        builder.Logging.ClearProviders();
        builder.WebHost.UseUrls("http://127.0.0.1:0");
        builder.Services.Configure<WindowsPackageJobOptions>(o => o.Enabled = true);
        builder.Services.Configure<AppSettings>(_ => { });
        builder.Services.AddSingleton(store);
        builder.Services.AddSingleton(TimeProvider.System);
        builder.Services.AddControllers().AddApplicationPart(typeof(WindowsPackageJobsController).Assembly);
        var app = builder.Build();
        app.MapControllers();
        return app;
    }
}

using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;
using PWABuilder.Controllers;
using PWABuilder.Models;
using PWABuilder.Services;

namespace PWABuilder.Controllers;

[ApiController]
[Route("api/[controller]/[action]")]
public class MsStorePackagesController : ControllerBase
{
    private readonly IBlobStorageService blobStorageService;
    private readonly string cliKey;
    private readonly ILogger<MsStorePackagesController> logger;
    public MsStorePackagesController(
        IBlobStorageService blobStorageService,
        IOptions<AppSettings> settings,
        ILogger<MsStorePackagesController> logger
    )
    {
        this.blobStorageService = blobStorageService;
        this.cliKey = settings.Value.PWABuilderCliKey;
        this.logger = logger;
    }

    /// <summary>
    /// This is a proxy function that downloads the pwa_builder.exe command line utility for packaging PWAs for the Microsoft Store. This utility is not publicly available per request of its authors, the Microsoft Edge team.
    /// The proxy is needed because the CLI is stored on a private Azure Blob Storage container that requires authentication and private virtual network to access.
    /// 
    /// This endpoint is used by the GitHub Action YML file that deploys PWABuilder MSStore packaging platform: https://github.com/pwa-builder/PWABuilder/blob/main/.github/workflows/deploy-msstore-to-preview.yml
    /// Since the GitHub Action cannot access the private storage container directly, it calls this endpoint to download the CLI using a private key. The private key is stored in two places:
    /// - GitHub repo's secrets - in order for the GitHub Action to access it
    /// - In the Azure web app `pwabuilder` -> Environment Variables, under AppSettings__PWABuilderCliKey - in order for this code to validate the key.
    /// </summary>
    /// <param name="options"></param>
    /// <returns></returns>

    [HttpGet("cli")]
    public async Task<IActionResult> GetCli(string key)
    {
        // Validate the key.
        if (key != cliKey)
        {
            logger.LogWarning("Unauthorized attempt to download pwabuilder.exe CLI with invalid key.");
            return Unauthorized();
        }

        var stream = await blobStorageService.DownloadBlobAsync("resources", "pwabuilder.zip");
        Response.RegisterForDispose(stream);
        return File(stream, "application/zip", "pwabuilder.zip");
    }

    [HttpGet("list-files-temp")]
    public async Task<IActionResult> ListFiles(string key)
    {
        // Validate the key.
        if (key != cliKey)
        {
            logger.LogWarning("Unauthorized attempt to list files in resources container with invalid key.");
            return Unauthorized();
        }

        var blobs = await blobStorageService.ListBlobsAsync("resources");
        return Ok(blobs);
    }
}
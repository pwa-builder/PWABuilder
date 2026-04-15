using Microsoft.AspNetCore.Mvc;
using PWABuilder.Services;

namespace PWABuilder.Controllers;

[ApiController]
[Route("api/[controller]")]
public class HealthController : ControllerBase
{
    [HttpGet("")]
    public IActionResult Health()
    {
        return Ok();
    }

    [HttpGet("google-play")]
    public async Task<IActionResult> GooglePlay([FromServices] IRedisCache redis, [FromServices] IWebHostEnvironment env)
    {
        var listId = env.IsProduction() ? "googleplaypackagejobs-prod" : "googleplaypackagejobs-nonprod";
        var googlePlayPackageJobCount = await redis.GetQueueLength(listId);
        var healthyThreshold = 50;
        if (googlePlayPackageJobCount >= healthyThreshold)
        {
            return StatusCode(StatusCodes.Status503ServiceUnavailable, $"There are currently {googlePlayPackageJobCount} jobs in the Google Play package queue, which is above the healthy threshold.");
        }

        return Ok($"There are currently {googlePlayPackageJobCount} jobs in the Google Play package queue, which is within the healthy threshold.");
    }
}
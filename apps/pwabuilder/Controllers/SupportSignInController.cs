using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PWABuilder.Services;

namespace PWABuilder.Controllers;

/// <summary>Serves only the public sign-in shell and non-sensitive SPA configuration, never diagnostics.</summary>
[AllowAnonymous]
[ResponseCache(NoStore = true, Location = ResponseCacheLocation.None)]
public sealed class SupportSignInController : Controller
{
    private readonly IConfiguration configuration;
    private readonly IWebHostEnvironment environment;

    /// <summary>Creates the shell controller with deployment configuration and the built frontend location.</summary>
    public SupportSignInController(IConfiguration configuration, IWebHostEnvironment environment)
    {
        this.configuration = configuration;
        this.environment = environment;
    }

    /// <summary>Returns only public identifiers and the delegated API scope; no credentials are required.</summary>
    [HttpGet("/api/admin/config")]
    public IActionResult Configuration()
    {
        var section = configuration.GetSection("SupportAdmin");
        if (!Guid.TryParse(section["TenantId"], out var tenant) || tenant == Guid.Empty
            || !Guid.TryParse(section["ClientId"], out var client) || client == Guid.Empty)
        {
            return NotFound();
        }
        return Ok(new { tenantId = tenant.ToString("D"), clientId = client.ToString("D"), scope = $"api://{client:D}/{SupportAdminAuthentication.Scope}" });
    }

    /// <summary>Serves the isolated browser sign-in application for support links and the PKCE callback.</summary>
    [HttpGet("/admin")]
    [HttpGet("/admin/signin-oidc")]
    [HttpGet("/admin/analyses/{id}")]
    [HttpGet("/admin/package-jobs/{supportReference}")]
    public IActionResult Index()
    {
        if (environment.IsDevelopment())
        {
            return View("~/Views/SupportAdmin/SignIn.cshtml");
        }
        var path = Path.Combine(environment.WebRootPath, "admin.html");
        if (!System.IO.File.Exists(path))
        {
            return StatusCode(StatusCodes.Status503ServiceUnavailable, "The support frontend is not deployed.");
        }
        return PhysicalFile(path, "text/html; charset=utf-8");
    }
}

using System.Security.Claims;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;

namespace PWABuilder.Services;

/// <summary>
/// Validates access tokens obtained by the secretless support SPA through authorization code with PKCE.
/// Configure SupportAdmin:TenantId and SupportAdmin:ClientId, expose Support.Read with v2 access tokens,
/// register the HTTPS /admin/signin-oidc SPA callback, and assign PWABuilder.SupportReader in Entra.
/// </summary>
public static class SupportAdminAuthentication
{
    /// <summary>The authorization policy protecting every support action.</summary>
    public const string Policy = "SupportReader";

    /// <summary>The Entra application role required for support reads.</summary>
    public const string Role = "PWABuilder.SupportReader";

    /// <summary>The isolated support API bearer-token authentication scheme.</summary>
    public const string BearerScheme = "SupportBearer";

    /// <summary>The delegated permission required in addition to the assigned support role.</summary>
    public const string Scope = "Support.Read";

    /// <summary>Registers authentication without requiring configuration for the public site.</summary>
    public static bool AddSupportAdmin(this IServiceCollection services, IConfiguration configuration)
    {
        var section = configuration.GetSection("SupportAdmin");
        Guid.TryParse(section["TenantId"], out var tenant);
        Guid.TryParse(section["ClientId"], out var client);
        var configured = tenant != Guid.Empty && client != Guid.Empty;

        services.AddAuthentication(options =>
        {
            options.DefaultAuthenticateScheme = BearerScheme;
            options.DefaultChallengeScheme = BearerScheme;
        }).AddJwtBearer(BearerScheme, options =>
        {
            options.MapInboundClaims = false;
            options.SaveToken = false;
            options.IncludeErrorDetails = false;
            options.RequireHttpsMetadata = true;
            if (configured)
            {
                options.Authority = $"https://login.microsoftonline.com/{tenant:D}/v2.0";
                options.Audience = client.ToString("D");
                options.TokenValidationParameters = new TokenValidationParameters
                {
                    ValidateIssuer = true,
                    ValidIssuer = options.Authority,
                    ValidateAudience = true,
                    ValidAudience = options.Audience,
                    ValidateLifetime = true,
                    RequireExpirationTime = true,
                    RequireSignedTokens = true,
                    ValidateIssuerSigningKey = true,
                    ValidAlgorithms = [SecurityAlgorithms.RsaSha256],
                    ClockSkew = TimeSpan.FromMinutes(1),
                    NameClaimType = "oid",
                    RoleClaimType = "roles"
                };
            }
        });

        services.AddAuthorization(options => options.AddPolicy(Policy, policy =>
        {
            policy.AddAuthenticationSchemes(BearerScheme);
            policy.RequireAuthenticatedUser();
            policy.RequireAssertion(context => configured && IsSupportReader(context.User, tenant, client));
        }));
        return configured;
    }

    /// <summary>Requires a delegated v2 API token from our SPA with tenant, object ID and assigned role, never an email suffix.</summary>
    public static bool IsSupportReader(ClaimsPrincipal? principal, Guid tenant, Guid client) =>
        tenant != Guid.Empty && principal?.Identities.Any(identity =>
            identity.IsAuthenticated
            && Guid.TryParse(identity.FindFirst("tid")?.Value, out var actualTenant)
            && actualTenant == tenant
            && Guid.TryParse(identity.FindFirst("oid")?.Value, out var objectId) && objectId != Guid.Empty
            && Guid.TryParse(identity.FindFirst("azp")?.Value, out var actualClient) && actualClient == client
            && identity.HasClaim("ver", "2.0")
            && identity.FindAll("scp").Any(claim => claim.Value.Split(' ', StringSplitOptions.RemoveEmptyEntries).Contains(Scope, StringComparer.Ordinal))
            && identity.HasClaim("roles", Role)) is true;

    /// <summary>Applies security headers and fail-closed handling to all admin responses, including challenges.</summary>
    public static void UseSupportAdmin(this WebApplication app, bool configured)
    {
        app.Use(async (context, next) =>
        {
            var isApi = context.Request.Path.StartsWithSegments("/api/admin");
            if (!isApi && !context.Request.Path.StartsWithSegments("/admin"))
            {
                await next(context);
                return;
            }

            context.Response.OnStarting(() =>
            {
                var isCallback = context.Request.Path.Equals("/admin/signin-oidc", StringComparison.OrdinalIgnoreCase);
                context.Response.Headers.CacheControl = "no-store, max-age=0";
                context.Response.Headers.Pragma = "no-cache";
                context.Response.Headers["X-Content-Type-Options"] = "nosniff";
                // Only the empty callback shell may load in MSAL's same-origin silent-renew iframe.
                context.Response.Headers["X-Frame-Options"] = isCallback ? "SAMEORIGIN" : "DENY";
                context.Response.Headers["Referrer-Policy"] = "no-referrer";
                context.Response.Headers.ContentSecurityPolicy = isApi
                    ? "default-src 'none'; frame-ancestors 'none'; base-uri 'none'; form-action 'none'"
                    : "default-src 'none'; script-src 'self'; style-src 'self' 'unsafe-inline'; connect-src 'self' https://login.microsoftonline.com; frame-src 'self' https://login.microsoftonline.com; img-src 'self' data:; font-src 'self'; frame-ancestors 'none'; base-uri 'none'; form-action 'self'";
                if (!isApi && app.Environment.IsDevelopment())
                {
                    context.Response.Headers.ContentSecurityPolicy = "default-src 'none'; script-src 'self' http://localhost:5173; style-src 'self' 'unsafe-inline'; connect-src 'self' http://localhost:5173 ws://localhost:5173 https://login.microsoftonline.com; frame-src 'self' https://login.microsoftonline.com; img-src 'self' data:; font-src 'self'; frame-ancestors 'none'; base-uri 'none'; form-action 'self'";
                }
                if (isCallback)
                {
                    context.Response.Headers.ContentSecurityPolicy = context.Response.Headers.ContentSecurityPolicy.ToString()
                        .Replace("frame-ancestors 'none'", "frame-ancestors 'self'", StringComparison.Ordinal);
                }
                return Task.CompletedTask;
            });
            if (!configured)
            {
                context.Response.StatusCode = StatusCodes.Status404NotFound;
                return;
            }

            try
            {
                await next(context);
            }
            catch (Exception) when (!context.Response.HasStarted)
            {
                // Do not expose upstream exception text, request URLs, or diagnostics in an error response.
                app.Logger.LogWarning("Support dashboard read failed.");
                context.Response.Clear();
                context.Response.StatusCode = StatusCodes.Status503ServiceUnavailable;
                await context.Response.WriteAsync("Support diagnostics are temporarily unavailable.");
            }
        });
    }
}

using System.Security.Claims;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Authentication.OpenIdConnect;
using Microsoft.IdentityModel.Protocols.OpenIdConnect;

namespace PWABuilder.Services;

/// <summary>
/// Configures the isolated, single-tenant support sign-in. Supply SupportAdmin:TenantId,
/// SupportAdmin:ClientId and SupportAdmin:ClientSecret through deployment configuration.
/// Register the HTTPS /admin/signin-oidc callback and assign PWABuilder.SupportReader in Entra.
/// </summary>
public static class SupportAdminAuthentication
{
    /// <summary>The authorization policy protecting every support action.</summary>
    public const string Policy = "SupportReader";

    /// <summary>The Entra application role required for support reads.</summary>
    public const string Role = "PWABuilder.SupportReader";

    /// <summary>The isolated support cookie authentication scheme.</summary>
    public const string CookieScheme = "SupportCookie";

    /// <summary>Registers authentication without requiring configuration for the public site.</summary>
    public static bool AddSupportAdmin(this IServiceCollection services, IConfiguration configuration)
    {
        var section = configuration.GetSection("SupportAdmin");
        var configured = Guid.TryParse(section["TenantId"], out var tenant)
            && tenant != Guid.Empty
            && Guid.TryParse(section["ClientId"], out var client)
            && client != Guid.Empty
            && !string.IsNullOrWhiteSpace(section["ClientSecret"]);

        var authentication = services.AddAuthentication(options =>
        {
            options.DefaultAuthenticateScheme = CookieScheme;
            options.DefaultSignInScheme = CookieScheme;
            options.DefaultChallengeScheme = configured ? "SupportEntra" : CookieScheme;
        }).AddCookie(CookieScheme, options =>
        {
            options.Cookie.Name = "__Host-PWABuilder.Support";
            options.Cookie.HttpOnly = true;
            options.Cookie.SecurePolicy = CookieSecurePolicy.Always;
            options.Cookie.SameSite = SameSiteMode.Lax;
            options.Cookie.Path = "/";
            options.ExpireTimeSpan = TimeSpan.FromMinutes(30);
            options.SlidingExpiration = false;
            options.Events = new CookieAuthenticationEvents
            {
                OnRedirectToLogin = context =>
                {
                    context.Response.StatusCode = StatusCodes.Status404NotFound;
                    return Task.CompletedTask;
                },
                OnRedirectToAccessDenied = context =>
                {
                    context.Response.StatusCode = StatusCodes.Status403Forbidden;
                    return Task.CompletedTask;
                },
                OnValidatePrincipal = context =>
                {
                    if (!configured || !IsSupportReader(context.Principal, tenant))
                    {
                        context.RejectPrincipal();
                    }
                    return Task.CompletedTask;
                }
            };
        });

        if (configured)
        {
            authentication.AddOpenIdConnect("SupportEntra", options =>
            {
                options.Authority = $"https://login.microsoftonline.com/{tenant:D}/v2.0";
                options.ClientId = section["ClientId"];
                options.ClientSecret = section["ClientSecret"];
                options.CallbackPath = "/admin/signin-oidc";
                options.SignInScheme = CookieScheme;
                options.ResponseType = OpenIdConnectResponseType.Code;
                options.UsePkce = true;
                options.RequireHttpsMetadata = true;
                options.SaveTokens = false;
                options.GetClaimsFromUserInfoEndpoint = false;
                options.MapInboundClaims = false;
                options.Scope.Clear();
                options.Scope.Add("openid");
                options.TokenValidationParameters.ValidateIssuer = true;
                options.TokenValidationParameters.ValidIssuer = options.Authority;
                options.TokenValidationParameters.NameClaimType = "oid";
                options.TokenValidationParameters.RoleClaimType = "roles";
                options.NonceCookie.SecurePolicy = CookieSecurePolicy.Always;
                options.CorrelationCookie.SecurePolicy = CookieSecurePolicy.Always;
                options.Events = new OpenIdConnectEvents
                {
                    OnTokenValidated = context =>
                    {
                        if (!IsSupportReader(context.Principal, tenant))
                        {
                            context.Fail("Support access is not assigned.");
                        }
                        return Task.CompletedTask;
                    },
                    OnRemoteFailure = context =>
                    {
                        context.HandleResponse();
                        context.Response.StatusCode = StatusCodes.Status403Forbidden;
                        return Task.CompletedTask;
                    }
                };
            });
        }

        services.AddAuthorization(options => options.AddPolicy(Policy, policy =>
        {
            policy.RequireAuthenticatedUser();
            policy.RequireAssertion(context => configured && IsSupportReader(context.User, tenant));
        }));
        return configured;
    }

    /// <summary>Checks tenant and assigned role on the same authenticated identity, never email domains.</summary>
    public static bool IsSupportReader(ClaimsPrincipal? principal, Guid tenant) =>
        tenant != Guid.Empty && principal?.Identities.Any(identity =>
            identity.IsAuthenticated
            && Guid.TryParse(identity.FindFirst("tid")?.Value, out var actualTenant)
            && actualTenant == tenant
            && identity.HasClaim("roles", Role)) is true;

    /// <summary>Applies security headers and fail-closed handling to all admin responses, including challenges.</summary>
    public static void UseSupportAdmin(this WebApplication app, bool configured)
    {
        app.Use(async (context, next) =>
        {
            if (!context.Request.Path.StartsWithSegments("/admin"))
            {
                await next(context);
                return;
            }

            context.Response.OnStarting(() =>
            {
                context.Response.Headers.CacheControl = "no-store, max-age=0";
                context.Response.Headers.Pragma = "no-cache";
                context.Response.Headers["X-Content-Type-Options"] = "nosniff";
                context.Response.Headers["X-Frame-Options"] = "DENY";
                context.Response.Headers["Referrer-Policy"] = "no-referrer";
                context.Response.Headers.ContentSecurityPolicy = "default-src 'none'; frame-ancestors 'none'; base-uri 'none'; form-action 'self'";
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

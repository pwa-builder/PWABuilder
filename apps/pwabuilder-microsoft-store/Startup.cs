using System;
using System.Linq;
using System.Net.Http;
using Microsoft.ApplicationInsights.AspNetCore.Extensions;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using PWABuilder.MicrosoftStore.Common;
using PWABuilder.MicrosoftStore.Models;
using PWABuilder.MicrosoftStore.Services;

namespace PWABuilder.MicrosoftStore
{
    public class Startup
    {
        readonly string AllowedOriginsPolicyName = "allowedOrigins";

        public Startup(IConfiguration configuration)
        {
            Configuration = configuration;
        }

        public IConfiguration Configuration { get; }

        // This method gets called by the runtime. Use this method to add services to the container.
        public void ConfigureServices(IServiceCollection services)
        {
            services.Configure<AppSettings>(Configuration.GetSection("AppSettings"));
            services.AddCors(options =>
            {
                options.AddPolicy(
                    name: AllowedOriginsPolicyName,
                    builder =>
                        builder
                            .SetIsOriginAllowed(CheckAllowedOriginCors)
                            .AllowAnyHeader()
                            .AllowAnyMethod()
                );
            });

            var appSettings = Configuration.GetSection("AppSettings");
            var aiOptions = setUpAppInsights(appSettings);

            services.AddTransient<PwaBuilderWrapper>();
            services.AddTransient<WindowsAppPackageCreator>();
            services.AddTransient<WindowsAppPackageInspector>();
            services.AddTransient<WindowsAppPackageUpdater>();
            services.AddTransient<WindowsAppPackageBundler>();
            services.AddTransient<WindowsActionsService>();
            services.AddTransient<LooseLayoutPackager>();
            services.AddTransient<SpartanWindowsPackageCreator>();
            services.AddTransient<ModernWindowsPackageCreator>();
            services.AddTransient<ClassicWindowsPackageCreator>();
            services.AddTransient<ImageGenerator>();
            services.AddTransient<WebManifestFinder>();
            services.AddTransient<MakePriWrapper>();
            services.AddTransient<MakeAppxWrapper>();
            services.AddTransient<TempDirectory>();
            services.AddTransient<Analytics>();
            services.AddSingleton<ZombieProcessKiller>();
            services.AddTransient<ProcessRunner>();
            services.AddApplicationInsightsTelemetry(aiOptions);
            services.AddHttpClient();
            services
                .AddHttpClient(
                    "NoRedirectClient",
                    client =>
                    {
                        client.AddLatestEdgeUserAgent();
                    }
                )
                .ConfigurePrimaryHttpMessageHandler(() =>
                    new HttpClientHandler { AllowAutoRedirect = false }
                );

            services.AddControllers();
        }

        static ApplicationInsightsServiceOptions setUpAppInsights(IConfigurationSection appSettings)
        {
            var connectionString = appSettings["ApplicationInsightsConnectionString"];
            var aiOptions = new ApplicationInsightsServiceOptions();
            aiOptions.EnableRequestTrackingTelemetryModule = false;
            aiOptions.EnableDependencyTrackingTelemetryModule = true;
            aiOptions.EnableHeartbeat = false;
            aiOptions.EnableAzureInstanceMetadataTelemetryModule = false;
            aiOptions.EnableActiveTelemetryConfigurationSetup = false;
            aiOptions.EnableAdaptiveSampling = false;
            aiOptions.EnableAppServicesHeartbeatTelemetryModule = false;
            aiOptions.EnableAuthenticationTrackingJavaScript = false;
            aiOptions.ConnectionString = connectionString;
            return aiOptions;
        }

        // This method gets called by the runtime. Use this method to configure the HTTP request pipeline.
        public void Configure(IApplicationBuilder app, IWebHostEnvironment env)
        {
            app.UseDeveloperExceptionPage();
            app.UseHttpsRedirection();
            app.UseStaticFiles();
            app.UseRouting();
            app.UseCors(AllowedOriginsPolicyName);
            app.UseAuthorization();
            app.UseEndpoints(endpoints =>
            {
                endpoints.MapControllers();
            });
        }

        private bool CheckAllowedOriginCors(string origin)
        {
            //Add to this list if more domains call this service
            var allowedOrigins = new[]
            {
                "https://www.pwabuilder.com",
                "https://pwabuilder.com",
                "https://preview.pwabuilder.com",
                "https://localhost:3333",
                "https://localhost:3000",
                "http://localhost:3333",
                "http://localhost:3000",
                "https://localhost:8000",
                "http://localhost:8000",
                "https://localhost:7217",
                "http://localhost:5777",
                "https://nice-field-047c1420f.azurestaticapps.net",
                "https://partner.microsoft.com",
                "https://brave-grass-02c461d10.1.azurestaticapps.net",
                "https://pwabuilder-summer25-consolidation.azurewebsites.net",
            };
            return allowedOrigins.Any(o => origin.Contains(o, StringComparison.OrdinalIgnoreCase));
        }
    }
}

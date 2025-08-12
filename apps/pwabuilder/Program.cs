using Microsoft.AspNetCore.StaticFiles;
using Microsoft.Extensions.Options;
using Microsoft.OpenApi.Models;
using Microsoft.PWABuilder.Common;
using Newtonsoft.Json;
using Newtonsoft.Json.Serialization;
using PWABuilder.Common;
using PWABuilder.IOS.Services;
using PWABuilder.Models;
using PWABuilder.Services;
using PWABuilder.Utils;
using PWABuilder.Validations.Services;
using StackExchange.Redis;

var builder = WebApplication.CreateBuilder(args);

// Remove duplicate logging.
builder.Logging.ClearProviders();
builder.Logging.AddConsole();

// App settings
var appSettings = builder.Configuration.GetSection("AppSettings");
var aiOptions = AppInsights.setUpAppInsights(appSettings);
builder.Services.Configure<AppSettings>(appSettings);
builder.Services.AddApplicationInsightsTelemetry(aiOptions);
JsonConvert.DefaultSettings = () =>
    new JsonSerializerSettings { ContractResolver = new CamelCasePropertyNamesContractResolver() };

// Add services to the container.
builder.Services.AddSingleton<ViteEntryPointProvider>();
builder.Services.AddSingleton<IPuppeteerService, PuppeteerService>();
builder.Services.AddTransient<TempDirectory>();
builder.Services.AddTransient<ImageGenerator>();
builder.Services.AddTransient<IOSPackageCreator>();
builder.Services.AddSingleton<AnalysisDb>();
builder.Services.AddSingleton<AnalysisJobQueue>();
builder.Services.AddSingleton<WebStringCache>();
builder.Services.AddHostedService<AnalysisJobProcessor>();
builder.Services.AddSingleton<ManifestDetector>();
builder.Services.AddSingleton<ServiceWorkerDetector>();
builder.Services.AddHttpClient();
builder.Services.AddScoped<ITelemetryService, TelemetryService>();
builder.Services.AddSingleton<ILighthouseService, LighthouseService>();
builder.Services.AddSingleton<IServiceWorkerAnalyzer, ServiceWorkerAnalyzer>();
builder.Services.AddScoped<IImageValidationService, ImageValidationService>();
builder.Services.AddSingleton(services =>
{
    // Created an Redis IDatabase instance singletone.
    var settings = services.GetRequiredService<IOptions<AppSettings>>();
    return ConnectionMultiplexer.Connect(settings.Value.AnalysisDbRedisConnectionString).GetDatabase();
});
builder.Services.AddSingleton(services =>
{
    // Create a single, reusable Puppeteer browser instance. This can be used across different requests so that we're not spinning up multiple browsers for each request.
    var env = services.GetRequiredService<IHostEnvironment>();
    return PuppeteerService.CreateBrowserAsync(env);
});
builder.Services.AddControllersWithViews();

// An HTTP client with the PWABuilderHttpAgent string appended. 
builder.Services.AddHttpClient(Constants.PwaBuilderAgentHttpClient, client =>
{
    client.DefaultRequestHeaders.UserAgent.ParseAdd($"{Constants.DesktopUserAgent} PWABuilderHttpAgent");
});

builder
    .Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.DefaultIgnoreCondition = System
            .Text
            .Json
            .Serialization
            .JsonIgnoreCondition
            .WhenWritingNull;
    });
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo { Title = "PWABuilder", Version = "v1" });
});

if (builder.Environment.IsDevelopment())
{
    builder.Services.AddCors(options =>
    {
        options.AddPolicy(
            "AllowAllOrigins",
            builder =>
            {
                builder.AllowAnyOrigin().AllowAnyMethod().AllowAnyHeader();
            }
        );
    });
}

var app = builder.Build();

// Configure the HTTP request pipeline.
if (!app.Environment.IsDevelopment())
{
    app.UseHttpsRedirection();
}
app.UseAuthorization();
app.MapControllers();

if (app.Environment.IsDevelopment())
{
    app.UseDeveloperExceptionPage();
    app.UseWebSockets(); // used for hot module reload with Vite local dev server.
    app.UseCors("AllowAllOrigins");

    app.MapSwagger();
    app.UseSwagger();
    app.UseSwaggerUI(c => c.SwaggerEndpoint("v1/swagger.json", "PWABuilder v1"));

    // For development, tell ASP.NET to serve .ts files. This is needed for Vite to serve web workers.
    var contentFileProvider = new FileExtensionContentTypeProvider();
    contentFileProvider.Mappings[".ts"] = "application/javascript";
    app.UseStaticFiles(
        new StaticFileOptions
        {
            FileProvider = new ViteStaticFileProvider(
                builder.Environment.WebRootPath,
                builder.Environment.ContentRootPath
            ),
            ServeUnknownFileTypes = true,
            ContentTypeProvider = contentFileProvider,
        }
    );
}
else
{
    app.UseStaticFiles();
}

app.Run();

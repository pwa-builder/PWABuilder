using Microsoft.AspNetCore.StaticFiles;
using Microsoft.PWABuilder.Common;
using PWABuilder.Services;

var builder = WebApplication.CreateBuilder(args);

// Remove duplicate logging.
builder.Logging.ClearProviders();
builder.Logging.AddConsole();

// Configuration
var appSettings = builder.Configuration.GetSection("AppSettings");
var aiOptions = AppInsights.setUpAppInsights(appSettings);
builder.Services.Configure<AppSettings>(appSettings);
builder.Services.AddApplicationInsightsTelemetry(aiOptions);

// Add services to the container.
builder.Services.AddSingleton<ViteEntryPointProvider>();
builder.Services.AddTransient<PuppeteerService>();
builder.Services.AddControllersWithViews();
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
builder.Services.AddScoped<IAnalyticsService, AnalyticsService>();
builder.Services.AddScoped<ILighthouseService, LighthouseService>();
builder.Services.AddScoped<IServiceWorkerAnalyzer, ServiceWorkerAnalyzer>();
builder.Services.AddScoped<IImageValidationService, ImageValidationService>();

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

    // For development, tell ASP.NET to serve .ts files. This is needed for Vite to serve web workers.
    var contentFileProvider = new FileExtensionContentTypeProvider();
    contentFileProvider.Mappings[".ts"] = "application/javascript";
    app.UseStaticFiles(new StaticFileOptions
    {
        FileProvider = new ViteStaticFileProvider(builder.Environment.WebRootPath, builder.Environment.ContentRootPath),
        ServeUnknownFileTypes = true,
        ContentTypeProvider = contentFileProvider
    });
}
else
{
    app.UseStaticFiles();
}

app.Run();

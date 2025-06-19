using PWABuilder.Models;
using PWABuilder.Services;
using PWABuilder.Utils;

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

app.UseHttpsRedirection();

app.UseAuthorization();

app.MapControllers();

app.Run();

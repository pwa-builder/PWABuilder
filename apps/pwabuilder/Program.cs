using Microsoft.AspNetCore.StaticFiles;
using Microsoft.OpenApi.Models;
using Microsoft.PWABuilder.Common;
using Newtonsoft.Json;
using Newtonsoft.Json.Serialization;
using PWABuilder.IOS.Services;
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
JsonConvert.DefaultSettings = () =>
    new JsonSerializerSettings { ContractResolver = new CamelCasePropertyNamesContractResolver() };

// Add services to the container.
builder.Services.AddSingleton<ViteEntryPointProvider>();
builder.Services.AddTransient<IPuppeteerService, PuppeteerService>();
builder.Services.AddTransient<TempDirectory>();
builder.Services.AddTransient<ImageGenerator>();
builder.Services.AddTransient<IOSPackageCreator>();
builder.Services.AddHttpClient();
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
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo { Title = "PWABuilder", Version = "v1" });
});
builder.Services.AddScoped<IAnalyticsService, AnalyticsService>();
builder.Services.AddScoped<ILighthouseService, LighthouseService>();
builder.Services.AddScoped<IServiceWorkerAnalyzer, ServiceWorkerAnalyzer>();
builder.Services.AddScoped<IImageValidationService, ImageValidationService>();

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

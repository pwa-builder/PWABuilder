using PWABuilder.Services;

var builder = WebApplication.CreateBuilder(args);

// Remove duplicate logging.
builder.Logging.ClearProviders();
builder.Logging.AddConsole();

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
builder.Services.AddScoped<ILighthouseService, LighthouseService>();
builder.Services.AddScoped<IServiceWorkerAnalyzer, ServiceWorkerAnalyzer>();

var app = builder.Build();

// Configure the HTTP request pipeline.

app.UseHttpsRedirection();

app.UseAuthorization();

app.MapControllers();

app.Run();

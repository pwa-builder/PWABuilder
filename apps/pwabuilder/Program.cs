using Microsoft.AspNetCore.StaticFiles;
using Microsoft.Store.Web.Utilities;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.

builder.Services.AddControllersWithViews();

var app = builder.Build();

// Configure the HTTP request pipeline.

app.UseHttpsRedirection();
app.UseAuthorization();
app.MapControllers();

if (app.Environment.IsDevelopment())
{
    app.UseDeveloperExceptionPage();
    app.UseWebSockets(); // used for hot module reload

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

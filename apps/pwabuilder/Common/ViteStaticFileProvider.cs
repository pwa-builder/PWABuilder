namespace Microsoft.PWABuilder.Common;

using Microsoft.Extensions.FileProviders;
using Microsoft.Extensions.FileProviders.Physical;
using Microsoft.Extensions.Primitives;

/// <summary>
/// This is a static file provider for ASP.NET Core+Vite. It's meant to be run only when running locally in development.
/// Essentially, it enables ASP.NET to send back to Vite files from the /public directory.
/// 
/// When Vite requets a file from /public, by default ASP.NET tries to load it from /wwwroot. However, these files will be 
/// in wwwroot only in non-dev environments. When we deploy to non-dev environment, the .csproj file copies them from /public to /wwwroot.
/// 
/// This works around that by returning files from the /public directory even if they're not in /wwwroot. This enables web workers and other static files in /public to work properly.
/// </summary>
public class ViteStaticFileProvider : IFileProvider
{
    private readonly PhysicalFileProvider physicalFileProvider;
    private readonly string contentRootPath;

    /// <summary>
    /// Constructor.
    /// </summary>
    /// <param name="webRootPath">The root file path.</param>
    /// <param name="contentRootPath">The content root path.</param>
    public ViteStaticFileProvider(string webRootPath, string contentRootPath)
    {
        physicalFileProvider = new PhysicalFileProvider(webRootPath);
        this.contentRootPath = contentRootPath;
    }

    /// <summary>
    /// Gets the directory contents.
    /// </summary>
    /// <param name="subpath">The subpath.</param>
    /// <returns>The contents of the directory.</returns>
    public IDirectoryContents GetDirectoryContents(string subpath)
    {
        return physicalFileProvider.GetDirectoryContents(subpath);
    }

    /// <summary>
    /// Gets the file info.
    /// </summary>
    /// <param name="subpath">The subpath of the file to get.</param>
    /// <returns>The file info at the specified subpath.</returns>
    public IFileInfo GetFileInfo(string subpath)
    {
        // If it's relative and got an extension, serve it from the /Frontend directory.
        if (subpath.StartsWith('/') && subpath.IndexOf('.') > 0)
        {
            var frontendFile = new FileInfo(Path.Combine(contentRootPath, "Frontend", subpath.TrimStart('/')));
            if (frontendFile.Exists)
            {
                return new PhysicalFileInfo(frontendFile);
            }
            else
            {
                // Couldn't find it in the Frontend directory? See if it's in Frontend/public.
                var publicFile = new FileInfo(Path.Combine(contentRootPath, "Frontend", "public", subpath.TrimStart('/')));
                return new PhysicalFileInfo(publicFile);
            }
        }

        // Normal file request, so use the default file provider.
        var fileInfo = physicalFileProvider.GetFileInfo(subpath);
        return fileInfo;
    }

    /// <summary>
    /// Watches a directory for changes.
    /// </summary>
    /// <param name="filter">The directory watch filter that specifies which files or pattern to watch.</param>
    /// <returns>A directory watcher.</returns>
    public IChangeToken Watch(string filter)
    {
        return physicalFileProvider.Watch(filter);
    }
}
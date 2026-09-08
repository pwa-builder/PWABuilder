using System.Threading;
using System.Threading.Tasks;
using PWABuilder.MicrosoftStore.Services;

namespace PWABuilder.MicrosoftStore.Jobs;

/// <summary>Adapts the existing Windows packaging pipeline to a scoped background job.</summary>
public sealed class WindowsPackageJobBuilder(WindowsAppPackageCreator creator) : IWindowsPackageJobBuilder
{
    /// <inheritdoc/>
    public async Task<string> BuildAsync(WindowsPackageJobInput input, CancellationToken token)
    {
        var result = await creator.CreateAppPackageFileAsync(input.Options, input.Analytics.ToAnalyticsInfo(), token);
        return result.FilePath;
    }
}

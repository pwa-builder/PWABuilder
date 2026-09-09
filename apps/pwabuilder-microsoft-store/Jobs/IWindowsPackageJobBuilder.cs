using System.Threading;
using System.Threading.Tasks;

namespace PWABuilder.MicrosoftStore.Jobs;

/// <summary>
/// Builds a ZIP within a per-job scope; files survive until scope disposal.
/// </summary>
public interface IWindowsPackageJobBuilder
{
    /// <summary>
    /// Returns the generated ZIP path without buffering it in memory.
    /// </summary>
    Task<string> BuildAsync(WindowsPackageJobInput input, CancellationToken token);
}

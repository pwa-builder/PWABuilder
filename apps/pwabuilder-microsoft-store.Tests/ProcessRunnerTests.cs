using Microsoft.Extensions.Logging.Abstractions;
using PWABuilder.MicrosoftStore;
using System.Diagnostics;
using Xunit;

namespace PWABuilder.MicrosoftStore.Tests;

public sealed class ProcessRunnerTests
{
    /// <summary>
    /// Verifies redirected output streams are drained concurrently so a full stderr pipe cannot block the child process.
    /// </summary>
    [Fact]
    public async Task Run_WhenStandardErrorExceedsPipeCapacity_CompletesAndCapturesOutput()
    {
        var scriptPath = Path.Combine(Path.GetTempPath(), $"{Guid.NewGuid()}.cmd");
        await File.WriteAllTextAsync(
            scriptPath,
            """
            @echo off
            for /L %%i in (1,1,10000) do @echo stderr-line-%%i 1>&2
            echo stdout-line
            """);

        using var processKiller = new ZombieProcessKiller(NullLogger<ZombieProcessKiller>.Instance);
        var runner = new ProcessRunner(NullLogger<ProcessRunner>.Instance, processKiller);

        try
        {
            var result = await runner.Run(
                Environment.GetEnvironmentVariable("ComSpec") ?? throw new InvalidOperationException("ComSpec is not defined."),
                $"/d /c \"{scriptPath}\"",
                TimeSpan.FromSeconds(15));

            Assert.Contains("stdout-line", result.StandardOutput);
            Assert.Contains("stderr-line-10000", result.StandardError);
        }
        finally
        {
            File.Delete(scriptPath);
        }
    }
}

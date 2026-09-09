using Microsoft.Extensions.Logging.Abstractions;
using PWABuilder.MicrosoftStore;
using PWABuilder.MicrosoftStore.Models;
using System.Diagnostics;
using System.Text;
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
        var scriptPath = Path.Combine(AppContext.BaseDirectory, $"{Guid.NewGuid()}.cmd");
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

    /// <summary>
    /// Verifies cancellation is checked before launching the owned executable.
    /// </summary>
    [Fact]
    public async Task Run_WhenAlreadyCanceled_DoesNotStartProcess()
    {
        var marker = Path.Combine(AppContext.BaseDirectory, $"{Guid.NewGuid()}.started");
        using var cancellation = new CancellationTokenSource();
        cancellation.Cancel();
        using var processKiller = new ZombieProcessKiller(NullLogger<ZombieProcessKiller>.Instance);
        var runner = new ProcessRunner(NullLogger<ProcessRunner>.Instance, processKiller);
        try
        {
            var error = await Assert.ThrowsAnyAsync<OperationCanceledException>(() =>
                RunWithCancellation(runner, CmdPath, $"/d /c echo started>\"{marker}\"", TimeSpan.FromSeconds(5), cancellation.Token));
            Assert.Equal(cancellation.Token, error.CancellationToken);
            Assert.False(File.Exists(marker));
        }
        finally
        {
            File.Delete(marker);
        }
    }

    /// <summary>
    /// Verifies cancelling a running tool terminates both the tool and its descendant.
    /// </summary>
    [Fact]
    public async Task Run_WhenCanceled_KillsOwnedProcessTree()
    {
        var directory = Directory.CreateDirectory(Path.Combine(AppContext.BaseDirectory, $"process-test-{Guid.NewGuid()}")).FullName;
        var parentMarker = Path.Combine(directory, "parent.pid");
        var childMarker = Path.Combine(directory, "child.pid");
        var childScript = $"[IO.File]::WriteAllText('{childMarker}', [string]$PID); [Threading.Thread]::Sleep(60000)";
        var parentScript = $"[IO.File]::WriteAllText('{parentMarker}', [string]$PID); & '{PowerShellPath}' -NoProfile -NonInteractive -EncodedCommand {Encode(childScript)}";
        using var cancellation = new CancellationTokenSource();
        using var processKiller = new ZombieProcessKiller(NullLogger<ZombieProcessKiller>.Instance);
        var runner = new ProcessRunner(NullLogger<ProcessRunner>.Instance, processKiller);
        var run = RunWithCancellation(runner, PowerShellPath, $"-NoProfile -NonInteractive -EncodedCommand {Encode(parentScript)}", TimeSpan.FromSeconds(20), cancellation.Token);
        try
        {
            await WaitForFile(childMarker);
            using var parent = Process.GetProcessById(int.Parse(await File.ReadAllTextAsync(parentMarker)));
            using var child = Process.GetProcessById(int.Parse(await File.ReadAllTextAsync(childMarker)));
            cancellation.Cancel();
            var error = await Assert.ThrowsAnyAsync<OperationCanceledException>(() => run.WaitAsync(TimeSpan.FromSeconds(10)));
            Assert.Equal(cancellation.Token, error.CancellationToken);
            Assert.True(parent.HasExited);
            Assert.True(child.HasExited);
        }
        finally
        {
            cancellation.Cancel();
            foreach (var marker in new[] { parentMarker, childMarker })
            {
                if (File.Exists(marker))
                {
                    try
                    {
                        using var process = Process.GetProcessById(int.Parse(await File.ReadAllTextAsync(marker)));
                        process.Kill(entireProcessTree: true);
                        await process.WaitForExitAsync().WaitAsync(TimeSpan.FromSeconds(5));
                    }
                    catch (ArgumentException) { }
                    catch (InvalidOperationException) { }
                }
            }
            try { await run.WaitAsync(TimeSpan.FromSeconds(5)); }
            catch (Exception) { }
            Directory.Delete(directory, recursive: true);
        }
    }

    /// <summary>
    /// Verifies the existing timeout error retains the tool output.
    /// </summary>
    [Fact]
    public async Task Run_WhenTimedOut_ThrowsProcessExceptionWithOutput()
    {
        using var processKiller = new ZombieProcessKiller(NullLogger<ZombieProcessKiller>.Instance);
        var runner = new ProcessRunner(NullLogger<ProcessRunner>.Instance, processKiller);
        var script = "[Console]::Out.WriteLine('before-timeout'); [Console]::Error.WriteLine('timeout-error'); [Threading.Thread]::Sleep(60000)";
        var error = await Assert.ThrowsAsync<ProcessException>(() =>
            runner.Run(PowerShellPath, $"-NoProfile -NonInteractive -EncodedCommand {Encode(script)}", TimeSpan.FromSeconds(3)));
        Assert.Contains("timed out", error.Message);
        Assert.Contains("before-timeout", error.StandardOutput);
        Assert.Contains("timeout-error", error.StandardError);
    }

    private static Task<ProcessResult> RunWithCancellation(ProcessRunner runner, string path, string args, TimeSpan timeout, CancellationToken cancellationToken)
    {
        return runner.Run(path, args, timeout, cancellationToken: cancellationToken);
    }

    private static async Task WaitForFile(string path)
    {
        using var timeout = new CancellationTokenSource(TimeSpan.FromSeconds(15));
        while (!File.Exists(path) || new FileInfo(path).Length == 0)
        {
            await Task.Delay(25, timeout.Token);
        }
    }

    private static string Encode(string script) => Convert.ToBase64String(Encoding.Unicode.GetBytes(script));
    private static string CmdPath => Environment.GetEnvironmentVariable("ComSpec") ?? throw new InvalidOperationException("ComSpec is not defined.");
    private static string PowerShellPath => Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.System), "WindowsPowerShell", "v1.0", "powershell.exe");
}

using Microsoft.Extensions.Logging;
using PWABuilder.MicrosoftStore.Models;
using System;
using System.Diagnostics;
using System.IO;
using System.Text;
using System.Threading;
using System.Threading.Tasks;

namespace PWABuilder.MicrosoftStore
{
    /// <summary>
    /// Runs a command-line process with proper error handling and zombie process cleanup.
    /// </summary>
    public class ProcessRunner
    {
        private readonly ILogger<ProcessRunner> logger;

        /// <summary>
        /// Creates a runner for owned command-line processes.
        /// </summary>
        /// <param name="logger">The process logger.</param>
        /// <param name="procKiller">Retained for constructor compatibility; each run now owns and disposes its timeout.</param>
        public ProcessRunner(ILogger<ProcessRunner> logger, ZombieProcessKiller procKiller)
        {
            this.logger = logger;
        }

        /// <summary>
        /// Runs a tool, capturing both output streams and terminating its process tree on timeout or cancellation.
        /// </summary>
        /// <param name="processPath">The executable path.</param>
        /// <param name="processArgs">The command-line arguments.</param>
        /// <param name="killTime">The timeout, or thirty minutes when omitted.</param>
        /// <param name="workingDirectory">The working directory for the process.</param>
        /// <param name="outputEncoding">The optional encoding of the redirected output.</param>
        /// <param name="cancellationToken">Cancels the process and its descendants.</param>
        /// <returns>The captured standard output and error.</returns>
        public async Task<ProcessResult> Run(
            string processPath,
            string processArgs,
            TimeSpan? killTime = null,
            string workingDirectory = "",
            Encoding? outputEncoding = null,
            CancellationToken cancellationToken = default)
        {
            cancellationToken.ThrowIfCancellationRequested();
            if (!File.Exists(processPath))
            {
                var pwaFileMissingError = new FileNotFoundException($"Unable to find {processPath}");
                pwaFileMissingError.Data.Add("expected path", processPath);
                throw pwaFileMissingError;
            }

            var processFileName = Path.GetFileName(processPath);
            var processStartInfo = new ProcessStartInfo
            {
                WorkingDirectory = workingDirectory,
                StandardErrorEncoding = outputEncoding,
                StandardOutputEncoding = outputEncoding,
                Arguments = processArgs,
                ErrorDialog = false,
                FileName = processPath,
                UseShellExecute = false,
                RedirectStandardOutput = true,
                RedirectStandardError = true,
            };
            var processTimeout = killTime ?? TimeSpan.FromMinutes(30);
            using var timeoutCancellation = new CancellationTokenSource(processTimeout);
            using var linkedCancellation = CancellationTokenSource.CreateLinkedTokenSource(cancellationToken, timeoutCancellation.Token);
            using var outputCancellation = new CancellationTokenSource();
            cancellationToken.ThrowIfCancellationRequested();
            using var cliProc = Process.Start(processStartInfo);
            if (cliProc is null)
            {
                throw new InvalidOperationException("Couldn't start Process");
            }

            var cliOutputTask = cliProc.StandardOutput.ReadToEndAsync(outputCancellation.Token);
            var cliErrorOutputTask = cliProc.StandardError.ReadToEndAsync(outputCancellation.Token);

            try
            {
                await Task.WhenAll(cliProc.WaitForExitAsync(linkedCancellation.Token), cliOutputTask, cliErrorOutputTask)
                    .WaitAsync(linkedCancellation.Token);
                cancellationToken.ThrowIfCancellationRequested();
            }
            catch (OperationCanceledException)
            {
                TryKillProcess(cliProc, processPath);
                // A descendant may retain an inherited pipe even after the parent exits.
                // Bound both exit waiting and pipe draining so cancellation cannot hang a worker.
                outputCancellation.CancelAfter(TimeSpan.FromSeconds(5));
                try
                {
                    await Task.WhenAll(cliProc.WaitForExitAsync(outputCancellation.Token), cliOutputTask, cliErrorOutputTask)
                        .WaitAsync(outputCancellation.Token);
                }
                catch (Exception cleanupError)
                {
                    logger.LogWarning(cleanupError, "Unable to finish draining CLI process for {procPath}", processPath);
                }

                cancellationToken.ThrowIfCancellationRequested();
                var timedOutOutput = cliOutputTask.IsCompletedSuccessfully ? cliOutputTask.Result : string.Empty;
                var timedOutErrorOutput = cliErrorOutputTask.IsCompletedSuccessfully ? cliErrorOutputTask.Result : string.Empty;
                var noExitError = CreateCliError($"The {processFileName} process timed out.", timedOutOutput, timedOutErrorOutput, processPath, processArgs);
                throw noExitError;
            }

            var cliOutput = await cliOutputTask;
            var cliErrorOutput = await cliErrorOutputTask;
            if (cliProc.ExitCode != 0)
            {
                var toolFailedError = CreateCliError($"The {processFileName} process exited with exit code {cliProc.ExitCode}.", cliOutput, cliErrorOutput, processPath, processArgs);
                toolFailedError.Data.Add("exitCode", cliProc.ExitCode);
                throw toolFailedError;
            }

            return new ProcessResult
            {
                StandardError = cliErrorOutput,
                StandardOutput = cliOutput
            };
        }

        private ProcessException CreateCliError(
            string message, 
            string? standardOutput, 
            string? standardErrorOutput,
            string processPath,
            string processArgs)
        {
            var formattedMessage = string.Join(Environment.NewLine + Environment.NewLine, message, $"Process: {processPath}", $"Standard output: {standardOutput}", $"Standard error: {standardErrorOutput}");
            var error = new ProcessException(formattedMessage, standardOutput, standardErrorOutput);
            error.Data.Add("StandardOutput", standardOutput);
            error.Data.Add("StandardError", standardErrorOutput);
            error.Data.Add("processPath", processPath);
            error.Data.Add("processArgs", processArgs);
            return error;
        }

        private void TryKillProcess(Process process, string processPath)
        {
            try
            {
                process.Kill(entireProcessTree: true);
            }
            catch (Exception killProcError)
            {
                logger.LogWarning(killProcError, "Unable to kill CLI process for {procPath}", processPath);
            }
        }
    }
}

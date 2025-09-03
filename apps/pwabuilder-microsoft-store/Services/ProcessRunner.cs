using Microsoft.Extensions.Logging;
using Microsoft.PWABuilder.Microsoft.Store.Models;
using System;
using System.Diagnostics;
using System.IO;
using System.Text;
using System.Threading.Tasks;

namespace PWABuilder.MicrosoftStore
{
    /// <summary>
    /// Runs a command-line process with proper error handling and zombie process cleanup.
    /// </summary>
    public class ProcessRunner
    {
        private readonly ILogger<ProcessRunner> logger;
        private readonly ZombieProcessKiller procKiller;

        public ProcessRunner(ILogger<ProcessRunner> logger, ZombieProcessKiller procKiller)
        {
            this.logger = logger;
            this.procKiller = procKiller;
        }

        public async Task<ProcessResult> Run(
            string processPath,
            string processArgs,
            TimeSpan? killTime = null,
            string workingDirectory = "",
            Encoding? outputEncoding = null)
        {
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
            using var cliProc = Process.Start(processStartInfo);
            if (cliProc == null)
            {
                throw new InvalidOperationException("Couldn't start Process");
            }

            if (killTime.HasValue)
            {
                procKiller.KillProcessAfter(cliProc, killTime.Value);
            }

            var cliOutput = await cliProc.StandardOutput.ReadToEndAsync();
            var cliErrorOutput = await cliProc.StandardError.ReadToEndAsync();
            var cliExitedSuccessfully = cliProc.WaitForExit((int)(killTime ?? TimeSpan.FromMinutes(30)).TotalMilliseconds);
            if (!cliExitedSuccessfully)
            {
                var noExitError = CreateCliError($"The {processFileName} process timed out.", cliOutput, cliErrorOutput, processPath, processArgs);
                TryKillProcess(cliProc, processPath); // We don't want zombie processes running.
                throw noExitError;
            }

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
                process.Kill();
            }
            catch (Exception killProcError)
            {
                logger.LogWarning(killProcError, "Unable to kill CLI process for {procPath}", processPath);
            }
        }
    }
}

using System;
using System.Diagnostics;
using System.Threading.Tasks;
using System.Text.Json;
using System.Threading;

namespace PWABuilder.Services
{
    public class LighthouseService : ILighthouseService
    {
        private const int timeoutMilliseconds = 165000;

        public async Task<JsonDocument> RunAuditAsync(string url, bool desktop)
        {
            if (!Uri.IsWellFormedUriString(url, UriKind.Absolute))
                throw new ArgumentException("Invalid URL.");

            var psi = new ProcessStartInfo
            {
                FileName = $"C:\\Program Files\\nodejs\\lighthouse.cmd",
                Arguments = $"{url} --quiet --chrome-flags=\"--headless --no-sandbox\" --output=json --output-path=stdout --form-factor={(desktop ? "desktop" : "mobile")}",
                RedirectStandardOutput = true,
                RedirectStandardError = true,
                UseShellExecute = false,
                CreateNoWindow = true,
            };

            using var process = Process.Start(psi);
            if (process == null || process.StandardOutput == null || process.StandardError == null)
            {
                throw new Exception("Failed to start Lighthouse process.");
            }

            using var cts = new CancellationTokenSource(timeoutMilliseconds);

            var outputTask = process.StandardOutput.ReadToEndAsync();
            var errorTask = process.StandardError.ReadToEndAsync();
            var waitTask = process.WaitForExitAsync(cts.Token);

            try
            {
                await waitTask;
            }
            catch (OperationCanceledException)
            {
                try
                {
                    if (!process.HasExited)
                    {
                        process.Kill(entireProcessTree: true);
                    }
                }
                catch { /* ignore */ }
                throw new TimeoutException("Lighthouse process timed out.");
            }

            var output = await outputTask;
            var error = await errorTask;

            if (process.ExitCode != 0)
            {
                throw new Exception($"Lighthouse failed: {error}");
            }

            try
            {
                return JsonDocument.Parse(output);
            }
            catch (JsonException ex)
            {
                throw new Exception("Failed to parse Lighthouse output as JSON.", ex);
            }
        }
    }
}

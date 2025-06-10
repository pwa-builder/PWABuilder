using System;
using System.Diagnostics;
using System.Threading.Tasks;
using System.Text.Json;
using System.Threading;
using System.IO;
using PuppeteerSharp;

namespace PWABuilder.Services
{
    public class LighthouseService : ILighthouseService
    {
        private const int timeoutMilliseconds = 165000;

        public async Task<JsonDocument> RunAuditAsync(string url, bool desktop)
        {
            var nodePath = @"C:\Program Files\nodejs\node.exe";  // Adjust as needed for your system

            var scriptPath = Path.Combine(Directory.GetCurrentDirectory(), "node-scripts", "audit-runner.js");

            var args = $"{scriptPath} {url} {(desktop ? "desktop" : "mobile")}";

            if (!Uri.IsWellFormedUriString(url, UriKind.Absolute))
                throw new ArgumentException("Invalid URL.");


            var psi = new ProcessStartInfo
            {
                FileName = nodePath,
                Arguments = args,
                RedirectStandardOutput = true,
                RedirectStandardError = true,
                UseShellExecute = false,
                CreateNoWindow = true,
            };

            using var process = Process.Start(psi);
            if (process == null || process.StandardOutput == null || process.StandardError == null)
                throw new Exception("Failed to start Lighthouse process.");


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
                        process.Kill(entireProcessTree: true);
                }
                catch { }
                throw new TimeoutException("Lighthouse process timed out.");
            }

            var output = await outputTask;
            var error = await errorTask;

            if (process.ExitCode != 0)
                throw new Exception($"Lighthouse failed: {error}");

            try
            {
                var doc = JsonDocument.Parse(output);
                var lhr = doc.RootElement;

                var audits = lhr.TryGetProperty("audits", out var auditsElem) ? auditsElem : default;
                var artifacts = lhr.TryGetProperty("artifacts", out var artifactsElem) ? artifactsElem : default;

                return doc;
            }
            catch (JsonException ex)
            {
                throw new Exception("Failed to parse Lighthouse output as JSON.", ex);
            }

        }
    }
}


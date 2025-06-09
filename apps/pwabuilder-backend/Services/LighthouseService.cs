using System;
using System.Diagnostics;
using System.Threading.Tasks;

namespace PWABuilder.Services
{
    public class LighthouseService : ILighthouseService
    {
        public async Task<string> RunAuditAsync(string url)
        {
            if (!Uri.IsWellFormedUriString(url, UriKind.Absolute))
                throw new ArgumentException("Invalid URL.");

            var psi = new ProcessStartInfo
            {
                FileName = $"C:\\Program Files\\nodejs\\lighthouse.cmd",
                Arguments = $"{url} --quiet --chrome-flags=\"--headless --no-sandbox\" --output=json --output-path=stdout",
                RedirectStandardOutput = true,
                RedirectStandardError = true,
                UseShellExecute = false,
                CreateNoWindow = true
            };

            using var process = Process.Start(psi);
            if (process == null || process.StandardOutput == null || process.StandardError == null)
            {
                throw new Exception("Failed to start Lighthouse process.");
            }
            var output = await process.StandardOutput.ReadToEndAsync();
            var error = await process.StandardError.ReadToEndAsync();
            await process.WaitForExitAsync();

            if (process.ExitCode != 0)
            {
                throw new Exception($"Lighthouse failed: {error}");
            }

            return output;
        }
    }
}

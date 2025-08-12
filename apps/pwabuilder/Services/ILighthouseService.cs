using System.Text.Json;
using Optional;
using PWABuilder.Models;

namespace PWABuilder.Services
{
    /// <summary>
    /// Lighthouse service runs Lighthouse PWA audits within a headless browser instance.
    /// </summary>
    public interface ILighthouseService
    {
        /// <summary>
        /// Runs the Lighthouse audit for the given URL and form factor.
        /// </summary>
        /// <param name="url">The URL to run the audit for.</param>
        /// <param name="formFactor">The form factor to emulate during the audit.</param>
        /// <returns>The Lighthouse report.</returns>
        Task<LighthouseReport> RunAuditAsync(Uri url, BrowserFormFactor formFactor);
    }
}

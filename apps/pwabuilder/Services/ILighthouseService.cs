using System.Text.Json;
using PWABuilder.Models;

namespace PWABuilder.Services
{
    public interface ILighthouseService
    {
        Task<LighthouseReport> RunAuditAsync(string url, bool desktop);
    }
}

using System.Text.Json;

namespace PWABuilder.Services
{
    public interface ILighthouseService
    {
        Task<JsonDocument> RunAuditAsync(string url, bool desktop);
    }
}

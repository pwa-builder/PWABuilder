using System.Text.Json;
using System.Threading.Tasks;

namespace PWABuilder.Services
{
    public interface ILighthouseService
    {
        Task<JsonDocument> RunAuditAsync(string url, bool desktop);
    }
}

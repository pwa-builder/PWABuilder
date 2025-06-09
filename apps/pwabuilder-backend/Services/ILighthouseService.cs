using System.Threading.Tasks;

namespace PWABuilder.Services
{
    public interface ILighthouseService
    {
        Task<string> RunAuditAsync(string url);
    }
}

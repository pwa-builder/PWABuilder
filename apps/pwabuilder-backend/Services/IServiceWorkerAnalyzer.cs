namespace PWABuilder.Services
{
    public interface IServiceWorkerAnalyzer
    {
        Task<object?> AnalyzeAsync(string swUrl);
    }
}

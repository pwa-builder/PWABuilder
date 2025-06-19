using PWABuilder.Models;

namespace PWABuilder.Services
{
    public interface IImageValidationService
    {
        Task<Validation> ValidateIconsMetadataAsync(object manifestJson, string manifestUrl);
        Task<Validation> ValidateScreenshotsMetadataAsync(object manifestJson, string manifestUrl);
    }
}

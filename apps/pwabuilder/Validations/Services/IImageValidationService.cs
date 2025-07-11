using PWABuilder.Validations.Models;

namespace PWABuilder.Validations.Services
{
    public interface IImageValidationService
    {
        Task<Validation> ValidateIconsMetadataAsync(object manifestJson, string manifestUrl);
        Task<Validation> ValidateScreenshotsMetadataAsync(object manifestJson, string manifestUrl);
    }
}

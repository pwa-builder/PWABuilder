using PWABuilder.Validations.Models;

namespace PWABuilder.Validations.Services
{
    public interface IImageValidationService
    {
        Task<Validation> ValidateIconsMetadataAsync(object manifestJson, Uri manifestUrl, CancellationToken cancelToken);
        Task<Validation> ValidateScreenshotsMetadataAsync(object manifestJson, Uri manifestUrl, CancellationToken cancelToken);
    }
}

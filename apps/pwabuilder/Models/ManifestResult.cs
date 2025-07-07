using PWABuilder.Validations.Models;

namespace PWABuilder.Models
{
    public class ManifestResult(object json, Uri url, IEnumerable<ManifestSingleField>? validations)
    {
        public IEnumerable<ManifestSingleField>? Validations { get; set; } = validations;
        public object Json { get; set; } = json;
        public string Raw { get; set; } = json.ToString();
        public Uri Url { get; set; } = url;
    }
}

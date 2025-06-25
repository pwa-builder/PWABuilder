namespace PWABuilder.Models
{
    public class ManifestResult(object json, Uri url)
    {
        public Object Json { get; set; } = json;
        public string Raw { get; set; } = json.ToString();
        public Uri Url { get; set; } = url;
    }
}

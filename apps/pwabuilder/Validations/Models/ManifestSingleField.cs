namespace PWABuilder.Validations.Models
{
    public class ManifestSingleFieldValidation
    {
        public required string InfoString { get; set; }
        public required string DisplayString { get; set; }
        public required string Category { get; set; }
        public required string Member { get; set; }
        public required object DefaultValue { get; set; } // Can be string, bool, or array
        public Uri? DocsLink { get; set; }
        public string? ErrorString { get; set; }
        public bool QuickFix { get; set; }
        public Func<object, bool>? Test { get; set; }
        public bool? TestRequired { get; set; }
        public string? TestName { get; set; }
        public bool? Valid { get; set; }
    }
}

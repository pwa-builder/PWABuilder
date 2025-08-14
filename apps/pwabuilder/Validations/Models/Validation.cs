namespace PWABuilder.Validations.Models
{
    public class Validation
    {
        public string? Member { get; set; }
        public string? Category { get; set; }
        public string? DisplayString { get; set; }
        public string? ErrorString { get; set; }
        public string? InfoString { get; set; }
        public object? DefaultValue { get; set; }
        public Uri? DocsLink { get; set; }
        public bool? QuickFix { get; set; }
        public bool? TestRequired { get; set; }
        public bool? Valid { get; set; }
    }
}

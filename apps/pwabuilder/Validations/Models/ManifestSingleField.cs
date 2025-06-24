namespace PWABuilder.Validations.Models
{
    public class ManifestSingleField
    {
        public string InfoString { get; set; }
        public string DisplayString { get; set; }
        public string Category { get; set; }
        public string Member { get; set; }
        public object DefaultValue { get; set; } // Can be string, bool, or array
        public string DocsLink { get; set; }
        public string ErrorString { get; set; }
        public bool QuickFix { get; set; }
        public Func<object, bool> Test { get; set; }
        public bool? TestRequired { get; set; }
        public string TestName { get; set; }
        public bool? Valid { get; set; }
    }
}

namespace PWABuilder.Validations.Models
{
    public class ValidationsResult
    {
        public bool Valid { get; set; }
        public bool Exists { get; set; }
        public IEnumerable<string> Errors { get; set; }
    }
}

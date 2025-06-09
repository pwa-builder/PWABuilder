namespace PWABuilder.Models
{
    public class OutputStatus
    {
        public int Status { get; set; }
        public OutputBody? Body { get; set; }
    }

    public class OutputBody
    {
        public string? Data { get; set; }
        public OutputError? Error { get; set; }
    }

    public class OutputError
    {
        public required string Object { get; set; }
        public required string Message { get; set; }
    }
}
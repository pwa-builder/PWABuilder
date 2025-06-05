using Microsoft.AspNetCore.Mvc;

namespace PWABuilder.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class ManifestController : ControllerBase
    {
        private readonly ILogger<ManifestController> logger;
        public ManifestController(ILogger<ManifestController> logger)
        {
            this.logger = logger;
        }

        [HttpGet]
        public string Get()
        {
            return "Hello, world";
        }
    }
}

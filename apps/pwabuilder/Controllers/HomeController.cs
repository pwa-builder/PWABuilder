using Microsoft.AspNetCore.Mvc;

namespace Microsoft.PWABuilder.Controllers;

[Route("[controller]")]
public class HomeController : Controller
{
    [HttpGet("")]
    [HttpGet("/")]
    public IActionResult Index()
    {
        return View();
    }
}
using Microsoft.AspNetCore.Mvc;

namespace PWABuilder.Controllers;

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
using Microsoft.AspNetCore.Mvc;

namespace Microsoft.PWABuilder.Controllers;

[Route("[controller]")]
[Route("{*url:regex(^(?!api|code|assets|.*css$|.*json$|.*js$).*$)}")]
public class HomeController : Controller
{
    [HttpGet("")]
    [HttpGet("/")]
    [ResponseCache(Duration = 0, Location = ResponseCacheLocation.None, NoStore = true)]
    public IActionResult Index()
    {
        return View();
    }
}

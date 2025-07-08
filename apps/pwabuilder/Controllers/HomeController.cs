using Microsoft.AspNetCore.Mvc;

namespace Microsoft.PWABuilder.Controllers;

[Route("[controller]")]
[Route("{*url:regex(^(?!api|code|assets|swagger|.*css$|.*json$|.*js$).*$)}")]
public class HomeController : Controller
{
    [HttpGet("")]
    [HttpGet("/")]
    public IActionResult Index()
    {
        return View();
    }
}

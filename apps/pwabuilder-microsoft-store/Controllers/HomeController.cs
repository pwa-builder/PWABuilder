using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Microsoft.PWABuilder.Microsoft.Store.Controllers
{
    public class HomeController : ControllerBase
    {
        [Route("/")]
        public IActionResult Index()
        {
            return File("index.html", "text/html");
        }
    }
}

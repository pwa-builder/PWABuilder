using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Threading.Tasks;

namespace PWABuilder.IOS.Common
{
    public static class HttpClientExtensions
    {
        public static void AddLatestEdgeUserAgent(this HttpClient http)
        {
            var userAgent =
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/96.0.4664.110 Safari/537.36 Edg/96.0.1054.57 PWABuilderHttpAgent";
            http.DefaultRequestHeaders.UserAgent.ParseAdd(userAgent);
        }
    }
}

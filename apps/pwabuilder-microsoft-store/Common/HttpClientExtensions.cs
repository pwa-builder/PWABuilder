using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Threading.Tasks;

namespace Microsoft.PWABuilder.Windows.Chromium.Common
{
    public static class HttpClientExtensions
    {
        private const string userAgent = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/96.0.4664.110 Safari/537.36 Edg/137.0.3296.62 PWABuilderHttpAgent"; // Note: this should include PWABuilderHttpAgent, as Cloudflare has whitelisted this UA

        public static void AddLatestEdgeUserAgent(this HttpClient http)
        {
            http.DefaultRequestHeaders.UserAgent.ParseAdd(userAgent);
        }
    }
}

using System;

namespace PWABuilder.IOS.Common
{
    public static class UriExtensions
    {
        /// <summary>
        /// Converts the URI to a string while omitting the protocol and trailing slash.
        /// </summary>
        /// <param name="uri"></param>
        /// <returns></returns>
        public static string ToIOSHostString(this Uri uri)
        {
            return uri.ToString().Replace(uri.Scheme + "://", string.Empty).TrimEnd('/');
        }
    }
}

namespace PWABuilder.Common
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

        /// <summary>
        /// Tries to create a URI and if it fails, returns null.
        /// </summary>
        /// <param name="baseUri">The base URI.</param>
        /// <param name="uriString">The URI string.</param>
        /// <returns>A new URI, or null if one could not be created.</returns>
        public static Uri? TryCreateUriOrNull(Uri baseUri, string? uriString)
        {
            Uri.TryCreate(baseUri, uriString, out var uri);
            return uri;
        }

        /// <summary>
        /// Tests whether the URI is not a loopback URI (localhost), and that it is an HTTPs URI.
        /// </summary>
        public static bool IsHttps(this Uri uri)
        {
            return !uri.IsLoopback && uri.Scheme == Uri.UriSchemeHttps;
        }
    }
}

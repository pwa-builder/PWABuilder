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
        /// Tests whether the URI is an absolute HTTPS URI that is not loopback and is not a private or reserved IP literal.
        /// </summary>
        /// <remarks>
        /// DNS names are validated when connecting; see <see cref="PublicNetworkGuard"/>.
        /// </remarks>
        /// <returns>True if the URI is absolute, HTTPS, and not loopback or a non-public IP literal; false otherwise.</returns>
        public static bool IsAbsoluteInternetHttps(this Uri uri)
        {
            return uri.IsAbsoluteInternetHttpOrHttps() && uri.Scheme == Uri.UriSchemeHttps;
        }

        /// <summary>
        /// Tests whether the URI is an absolute HTTP or HTTPS URI that is not loopback and is not a private or reserved IP literal.
        /// </summary>
        /// <remarks>
        /// DNS names are validated when connecting; see <see cref="PublicNetworkGuard"/>.
        /// </remarks>
        /// <returns>True if the URI is absolute, HTTP or HTTPS, and not loopback or a non-public IP literal; false otherwise.</returns>
        public static bool IsAbsoluteInternetHttpOrHttps(this Uri uri)
        {
            return uri.IsAbsoluteUri
                && (uri.Scheme == Uri.UriSchemeHttps || uri.Scheme == Uri.UriSchemeHttp)
                && !uri.IsLoopback
                && !PublicNetworkGuard.HasNonPublicIPLiteralHost(uri);
        }
    }
}

using Microsoft.AspNetCore.Mvc;
using System.Net.Http.Headers;
using static System.Net.WebRequestMethods;

namespace PWABuilder.Common
{
    public static class HttpClientExtensions
    {
        /// <summary>
        /// Fetches a string from the specified URI while providing an expected content type and a maximum response size.
        /// </summary>
        /// <param name="client">The HTTP client.</param>
        /// <param name="requestUri">The URI to request.</param>
        /// <param name="accept">The accept header to append to the request, e.g. "text/html"</param>
        /// <param name="maxSizeInBytes">The maximum size in bytes of the response.</param>
        /// <param name="cancelToken">Cancellation token.</param>
        /// <returns>The string fetched from the URI.</returns>
        /// <exception cref="InvalidOperationException">The response was longer than the max size.</exception>
        public static async Task<string?> GetStringAsync(this HttpClient client, Uri requestUri, string? accept, long? maxSizeInBytes, CancellationToken cancelToken)
        {
            var htmlFetchRequest = new HttpRequestMessage(HttpMethod.Get, requestUri);

            // Add the accept header if provided.
            if (accept != null)
            {
                htmlFetchRequest.Headers.Accept.Add(new MediaTypeWithQualityHeaderValue(accept));
            }

            // Send it.
            var htmlFetch = await client.SendAsync(htmlFetchRequest, cancelToken);

            // If we didn't specify max size, just return the content.
            if (maxSizeInBytes == null)
            {
                return await htmlFetch.Content.ReadAsStringAsync(cancelToken);
            }

            // We have a max size, so we need to check the content length.
            // First, ensure we've got success.
            htmlFetch.EnsureSuccessStatusCode();

            // See if we have a Content-Length header
            var contentLength = htmlFetch.Content.Headers.ContentLength;
            if (contentLength.HasValue && contentLength.Value > maxSizeInBytes)
            {
                throw new InvalidOperationException("Response content-length header says the response exceeds the maximum allowed size.");
            }

            // Read in a string as a stream to ensure we don't exceed the max size.
            using var stream = await htmlFetch.Content.ReadAsStreamAsync();
            using var memoryStream = new MemoryStream();

            var buffer = new byte[8192];
            int bytesRead;
            int totalBytes = 0;

            while ((bytesRead = await stream.ReadAsync(buffer, 0, buffer.Length)) > 0)
            {
                totalBytes += bytesRead;

                if (totalBytes > maxSizeInBytes)
                {
                    throw new InvalidOperationException("Response exceeded the maximum allowed size during streaming.");
                }

                memoryStream.Write(buffer, 0, bytesRead);
            }

            return System.Text.Encoding.UTF8.GetString(memoryStream.ToArray());
        }
    }
}

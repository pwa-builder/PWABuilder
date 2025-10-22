using System.Net.Http.Headers;

namespace PWABuilder.Common;

public static class HttpClientExtensions
{
    /// <summary>
    /// Fetches a string from the specified URI while providing an expected content type and a maximum response size.
    /// </summary>
    /// <param name="client">The HTTP client.</param>
    /// <param name="requestUri">The URI to request.</param>
    /// <param name="accepts">The accept header to append to the request, e.g. "text/html"</param>
    /// <param name="maxSizeInBytes">The maximum size in bytes of the response.</param>
    /// <param name="cancelToken">Cancellation token.</param>
    /// <returns>The string fetched from the URI.</returns>
    /// <exception cref="InvalidOperationException">The response was longer than the max size.</exception>
    public static async Task<string?> GetStringAsync(this HttpClient client, Uri requestUri, IEnumerable<string> accepts, long? maxSizeInBytes, CancellationToken cancelToken)
    {
        var htmlFetchRequest = new HttpRequestMessage(HttpMethod.Get, requestUri);

        // Add the accept header if provided.
        foreach (var acceptType in accepts)
        {
            htmlFetchRequest.Headers.Accept.Add(new MediaTypeWithQualityHeaderValue(acceptType));
        }

        // Send it.
        var htmlFetch = await client.SendAsync(htmlFetchRequest, HttpCompletionOption.ResponseHeadersRead, cancelToken);

        // We have a max size, so we need to check the content length.
        // First, ensure we've got success.
        htmlFetch.EnsureSuccessStatusCode();

        // Is it one of the types we expected? If not, punt.
        if (htmlFetch.Content.Headers.ContentType != null && !accepts.Contains(htmlFetch.Content.Headers.ContentType.MediaType))
        {
            throw new Exception($"Attempted to fetch {requestUri} and it returned success, however, response content-type header {htmlFetch.Content.Headers.ContentType.MediaType} is not one of our expected types {string.Join(", ", accepts)}. {htmlFetch.Content.Headers.ContentType}");
        }

        // If we didn't specify max size, just return the content.
        if (maxSizeInBytes == null)
        {
            return await htmlFetch.Content.ReadAsStringAsync(cancelToken);
        }

        // See if we have a Content-Length header
        var contentLength = htmlFetch.Content.Headers.ContentLength;
        if (contentLength.HasValue && contentLength.Value > maxSizeInBytes)
        {
            throw new InvalidOperationException($"Attempted to fetch {requestUri}, but response content-length header says the response size ({contentLength.Value}) exceeds the maximum allowed size ({maxSizeInBytes.Value}).");
        }

        // Read in a string as a stream to ensure we don't exceed the max size.
        using var stream = await htmlFetch.Content.ReadAsStreamAsync(cancelToken);
        using var memoryStream = new MemoryStream();

        var buffer = new byte[8192];
        int bytesRead;
        int totalBytes = 0;

        while ((bytesRead = await stream.ReadAsync(buffer, cancelToken)) > 0)
        {
            totalBytes += bytesRead;

            if (totalBytes > maxSizeInBytes)
            {
                throw new InvalidOperationException($"Attempted to fetch {requestUri}, but response size ({totalBytes}) exceeded the maximum allowed size ({maxSizeInBytes.Value}) during streaming.");
            }

            memoryStream.Write(buffer, 0, bytesRead);
        }

        return System.Text.Encoding.UTF8.GetString(memoryStream.ToArray());
    }

    /// <summary>
    /// Fetches an image from the specified URI while providing an expected content type and a maximum response size.
    /// </summary>
    /// <param name="client">The HTTP client.</param>
    /// <param name="requestUri">The URI to request.</param>
    /// <param name="maxSizeInBytes">The maximum size in bytes of the response.</param>
    /// <param name="cancelToken">Cancellation token.</param>
    /// <returns>The string fetched from the URI.</returns>
    /// <exception cref="InvalidOperationException">The response was longer than the max size.</exception>
    public static async Task<LimitedReadStreamWithMediaType> GetStreamAsync(this HttpClient client, Uri requestUri, IEnumerable<string> accepts, long maxSizeInBytes, CancellationToken cancelToken)
    {
        var streamRequest = new HttpRequestMessage(HttpMethod.Get, requestUri);

        // Add the accept header for images.
        // Add the accept header if provided.
        foreach (var acceptType in accepts)
        {
            streamRequest.Headers.Accept.Add(new MediaTypeWithQualityHeaderValue(acceptType));
        }

        // Send it.
        var streamFetch = await client.SendAsync(streamRequest, cancelToken);

        // We have a max size, so we need to check the content length.
        // First, ensure we've got success.
        streamFetch.EnsureSuccessStatusCode();

        // See if we have a Content-Length header
        var contentLength = streamFetch.Content.Headers.ContentLength;
        if (contentLength.HasValue && contentLength.Value > maxSizeInBytes)
        {
            throw new InvalidOperationException($"Attempted to fetch {requestUri}, but response content-length header says the response size ({contentLength.Value}) exceeds the maximum allowed size ({maxSizeInBytes}).");
        }

        // Read in a string as a stream to ensure we don't exceed the max size.
        var stream = await streamFetch.Content.ReadAsStreamAsync(cancelToken);
        return new LimitedReadStreamWithMediaType(stream, maxSizeInBytes, streamFetch.Content.Headers.ContentType?.MediaType);
    }

    /// <summary>
    /// Fetches an image from the specified URI while providing an expected content type and a maximum response size.
    /// </summary>
    /// <param name="client">The HTTP client.</param>
    /// <param name="requestUri">The URI to request.</param>
    /// <param name="maxSizeInBytes">The maximum size in bytes of the response.</param>
    /// <param name="cancelToken">Cancellation token.</param>
    /// <returns>The string fetched from the URI.</returns>
    /// <exception cref="InvalidOperationException">The response was longer than the max size.</exception>
    public static Task<LimitedReadStreamWithMediaType> GetImageAsync(this HttpClient client, Uri requestUri, long maxSizeInBytes, CancellationToken cancelToken)
    {
        return GetStreamAsync(client, requestUri, ["image/*"], maxSizeInBytes, cancelToken);
    }

    /// <summary>
    /// Makes a request to the URL and reads only the response headers. It throws an HttpRequestException if the response headers don't contain the specified content type.
    /// </summary>
    /// <param name="http">The HTTP client.</param>
    /// <param name="cancelToken">The cancellation token.</param>
    /// <param name="responseContentType">The expected response content type. If the response doesn't contain this content type header, an HttpRequestException will be thrown.</param>
    /// <exception cref="HttpRequestException">The request didn't have a response content-type containing <paramref name="responseContentType"/>.
    public static void EnsureContentType(this HttpResponseMessage response, string responseContentType)
    {
        // If there is no content type header, consider this test skipped. 
        var contentType = response.Content.Headers.ContentType;
        if (string.IsNullOrEmpty(contentType?.MediaType))
        {
            throw new HttpRequestException($"Expected a response content-type header of {responseContentType}, but it had none.");
        }

        var hasMatchingContentType = contentType.MediaType.Contains("text/html");
        if (!hasMatchingContentType)
        {
            throw new HttpRequestException($"Expected a response content-type header of {responseContentType}, but it only had {contentType.MediaType}.");
        }
    }

    public class LimitedReadStreamWithMediaType : Stream
    {
        private readonly Stream inner;
        private readonly string? mediaType;
        private readonly long maxBytes;
        private long totalReadBytes;

        public LimitedReadStreamWithMediaType(Stream inner, long maxBytes, string? mediaType)
        {
            this.inner = inner;
            this.maxBytes = maxBytes;
            this.mediaType = mediaType;
        }

        /// <summary>
        /// Gets the media type of the underlying image stream.
        /// </summary>
        public string? MediaType => mediaType;

        public override int Read(byte[] buffer, int offset, int count)
        {
            if (totalReadBytes >= maxBytes)
            {
                throw new IOException($"Stream exceeds maximum allowed size ({maxBytes}).");
            }

            var toRead = (int)Math.Min(count, maxBytes - totalReadBytes);
            var read = inner.Read(buffer, offset, toRead);
            totalReadBytes += read;
            return read;
        }

        // Implement required overrides
        public override bool CanRead => inner.CanRead;
        public override bool CanSeek => false;
        public override bool CanWrite => false;
        public override long Length => inner.Length;
        public override long Position { get => inner.Position; set => throw new NotSupportedException(); }
        public override void Flush() => inner.Flush();
        public override long Seek(long offset, SeekOrigin origin) => throw new NotSupportedException();
        public override void SetLength(long value) => throw new NotSupportedException();
        public override void Write(byte[] buffer, int offset, int count) => throw new NotSupportedException();
    }
}

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

    /// <summary>
    /// Fetches an image from the specified URI while providing an expected content type and a maximum response size.
    /// </summary>
    /// <param name="client">The HTTP client.</param>
    /// <param name="requestUri">The URI to request.</param>
    /// <param name="maxSizeInBytes">The maximum size in bytes of the response.</param>
    /// <param name="cancelToken">Cancellation token.</param>
    /// <returns>The string fetched from the URI.</returns>
    /// <exception cref="InvalidOperationException">The response was longer than the max size.</exception>
    public static async Task<LimitedReadStreamWithMediaType> GetImageAsync(this HttpClient client, Uri requestUri, long maxSizeInBytes, CancellationToken cancelToken)
    {
        var imageRequest = new HttpRequestMessage(HttpMethod.Get, requestUri);

        // Add the accept header for images.
        imageRequest.Headers.Accept.Add(new MediaTypeWithQualityHeaderValue("image/*"));

        // Send it.
        var imageFetch = await client.SendAsync(imageRequest, cancelToken);

        // We have a max size, so we need to check the content length.
        // First, ensure we've got success.
        imageFetch.EnsureSuccessStatusCode();

        // See if we have a Content-Length header
        var contentLength = imageFetch.Content.Headers.ContentLength;
        if (contentLength.HasValue && contentLength.Value > maxSizeInBytes)
        {
            throw new InvalidOperationException("Response content-length header says the response exceeds the maximum allowed size.");
        }

        // Read in a string as a stream to ensure we don't exceed the max size.
        var stream = await imageFetch.Content.ReadAsStreamAsync();
        return new LimitedReadStreamWithMediaType(stream, maxSizeInBytes, imageFetch.Content.Headers.ContentType?.MediaType);
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
                throw new IOException("Stream exceeds maximum allowed size.");
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

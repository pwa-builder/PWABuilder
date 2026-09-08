using System.Net;
using System.Text;
using System.Text.Json;
using Xunit;

namespace PWABuilder.MicrosoftStore.Tests;

/// <summary>
/// Supplies deterministic SFEdge responses without contacting the Store.
/// </summary>
internal sealed class SfEdgeTestHttpClientFactory : IHttpClientFactory
{
    private readonly Func<HttpRequestMessage, CancellationToken, Task<HttpResponseMessage>> respond;

    /// <summary>
    /// Creates a factory with a response handler that can observe cancellation.
    /// </summary>
    public SfEdgeTestHttpClientFactory(Func<HttpRequestMessage, CancellationToken, Task<HttpResponseMessage>> respond)
    {
        this.respond = respond;
    }

    /// <inheritdoc/>
    public HttpClient CreateClient(string name) => new(new Handler(this.respond));

    /// <summary>
    /// Creates a JSON response with the given status.
    /// </summary>
    public static HttpResponseMessage Json(string json, HttpStatusCode status = HttpStatusCode.OK) =>
        new(status) { Content = new StringContent(json, Encoding.UTF8, "application/json") };

    /// <summary>
    /// Creates a search envelope; TotalItems is deliberately not a reliable paging boundary.
    /// </summary>
    public static HttpResponseMessage Search(params string[] productIds) =>
        productIds.Length is 0
        ? Json("""{"Payload":{"Products":[],"TotalItems":0,"PageSize":0}}""")
        : Json(JsonSerializer.Serialize(new
        {
            Payload = new { Cards = productIds.Select(id => new { ProductId = id }), TotalItems = 1, PageSize = 15 }
        }));

    /// <summary>
    /// Creates the two-envelope PDP response returned by SFEdge.
    /// </summary>
    public static HttpResponseMessage Product(string productId, params string[] families) =>
        Json(JsonSerializer.Serialize(new object[]
        {
            new { Payload = new { PageObject = new { } } },
            new { Payload = new { ProductId = productId, PackageFamilyNames = families } }
        }));

    private sealed class Handler(Func<HttpRequestMessage, CancellationToken, Task<HttpResponseMessage>> respond) : HttpMessageHandler
    {
        /// <inheritdoc/>
        protected override Task<HttpResponseMessage> SendAsync(HttpRequestMessage request, CancellationToken cancellationToken)
        {
            Assert.Equal("StoreWeb PWABuilder", request.Headers.UserAgent.ToString());
            Assert.Equal("storeedgefd.dsx.mp.microsoft.com", request.RequestUri?.Host);
            Assert.Equal(HttpMethod.Get, request.Method);
            return respond(request, cancellationToken);
        }
    }
}

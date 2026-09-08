using System;
using System.Linq;
using System.Text.Json;
using System.Threading;
using System.Threading.Tasks;
using Azure.Identity;
using Azure.Storage.Queues;
using Microsoft.Extensions.Options;
using PWABuilder.MicrosoftStore.Models;

namespace PWABuilder.MicrosoftStore.Jobs;

/// <summary>
/// Delivers job references through pre-provisioned Azure Storage queues.
/// </summary>
public sealed class AzureWindowsPackageJobQueue : IWindowsPackageJobQueue
{
    private static readonly TimeSpan InfiniteTimeToLive = TimeSpan.FromSeconds(-1);

    private readonly QueueClient queue;

    private readonly QueueClient poisonQueue;

    private readonly TimeSpan visibility;

    /// <summary>
    /// Connects to the work and poison queues using the configured managed identity.
    /// </summary>
    public AzureWindowsPackageJobQueue(IOptions<WindowsPackageJobOptions> options, IOptions<AppSettings> appSettings)
    {
        var configuration = options.Value;
        var identity = appSettings.Value.AzureManagedIdentityApplicationId;
        ArgumentException.ThrowIfNullOrWhiteSpace(configuration.QueueName);
        var credential = string.IsNullOrWhiteSpace(identity)
            ? new ManagedIdentityCredential()
            : new ManagedIdentityCredential(identity);
        var service = new QueueServiceClient(new Uri(configuration.QueueServiceUri), credential,
            new QueueClientOptions { MessageEncoding = QueueMessageEncoding.None });
        queue = service.GetQueueClient(configuration.QueueName);
        poisonQueue = service.GetQueueClient(configuration.QueueName + "-poison");
        visibility = TimeSpan.FromSeconds(configuration.VisibilitySeconds);
    }

    /// <summary>
    /// Uses supplied SDK clients for queue delivery.
    /// </summary>
    internal AzureWindowsPackageJobQueue(QueueClient queue, QueueClient poisonQueue, WindowsPackageJobOptions options)
    {
        this.queue = queue;
        this.poisonQueue = poisonQueue;
        visibility = TimeSpan.FromSeconds(options.VisibilitySeconds);
    }

    /// <inheritdoc/>
    public async Task SendAsync(string jobId, CancellationToken token)
    {
        await queue.SendMessageAsync(jobId, timeToLive: InfiniteTimeToLive, cancellationToken: token);
    }

    /// <inheritdoc/>
    public async Task<PackageJobMessage?> ReceiveAsync(CancellationToken token)
    {
        var response = await queue.ReceiveMessagesAsync(maxMessages: 1, visibilityTimeout: visibility, cancellationToken: token);
        var message = response.Value.FirstOrDefault();
        return message is null
            ? null
            : new PackageJobMessage(message.MessageId, message.PopReceipt, message.MessageText, message.DequeueCount);
    }

    /// <inheritdoc/>
    public async Task<PackageJobMessage> RenewAsync(PackageJobMessage message, TimeSpan visibility, CancellationToken token)
    {
        var response = await queue.UpdateMessageAsync(message.MessageId, message.PopReceipt,
            messageText: null, visibilityTimeout: visibility, cancellationToken: token);
        return message with { PopReceipt = response.Value.PopReceipt };
    }

    /// <inheritdoc/>
    public async Task DeleteAsync(PackageJobMessage message, CancellationToken token)
    {
        await queue.DeleteMessageAsync(message.MessageId, message.PopReceipt, token);
    }

    /// <inheritdoc/>
    public async Task PoisonAsync(PackageJobMessage message, string reason, CancellationToken token)
    {
        var diagnostic = JsonSerializer.Serialize(new
        {
            jobId = Guid.TryParseExact(message.JobId, "N", out var id) ? id.ToString("N") : "invalid",
            messageId = Sanitize(message.MessageId, 64),
            reason = Sanitize(reason, 160),
            attempts = message.DequeueCount
        });
        await poisonQueue.SendMessageAsync(diagnostic, timeToLive: InfiniteTimeToLive, cancellationToken: token);
    }

    /// <summary>
    /// Bounds diagnostics and excludes control characters and arbitrary markup.
    /// </summary>
    private static string Sanitize(string value, int limit) =>
        new(value.Take(limit).Where(character => char.IsAsciiLetterOrDigit(character) || character is ' ' or '-' or '_' or '.').ToArray());
}

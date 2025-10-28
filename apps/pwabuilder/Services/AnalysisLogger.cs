
using PWABuilder.Models;
using System.Collections.Concurrent;

namespace PWABuilder.Services;

/// <summary>
/// ILogger implementatation that logs to an Analysis object and to an underlying logger. Thread-safe.
/// </summary>
public class AnalysisLogger : ILogger
{
    private readonly ConcurrentQueue<string> logs = new();
    private readonly Analysis analysis;
    private readonly ILogger serviceLogger;

    public AnalysisLogger(Analysis analysis, ILogger serviceLogger)
    {
        this.serviceLogger = serviceLogger;
        this.analysis = analysis;
    }

    public IDisposable? BeginScope<TState>(TState state) where TState : notnull
    {
        return null;
    }

    public bool IsEnabled(LogLevel logLevel)
    {
        return true;
    }

    public void Log<TState>(LogLevel logLevel, EventId eventId, TState state, Exception? exception, Func<TState, Exception?, string> formatter)
    {
        // Write it to the underlying service logger.
        serviceLogger.Log(logLevel, eventId, state, exception, formatter);

        // Write it to the Analysis object in a thread-safe manner.
        var message = $"[{logLevel}] {formatter(state, exception)}";

        // Explicitly include exception details if present
        if (exception is not null)
        {
            message += $" | Exception: {exception.GetType().Name}: {exception.Message}";
            if (!string.IsNullOrEmpty(exception.StackTrace))
            {
                message += $" | StackTrace: {exception.StackTrace}";
            }
        }

        logs.Enqueue(message);
    }

    /// <summary>
    /// Flush logs to the Analysis object's Logs. This mutates the analysis's Logs property so it is not thread-safe.
    /// </summary>
    public void FlushLogs()
    {
        analysis.Logs.AddRange(logs);
    }
}

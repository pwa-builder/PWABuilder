using PWABuilder.Models;

namespace PWABuilder.Common;

/// <summary>
/// Extension methods for the <see cref="Result"/> type.
/// </summary>
public static class ResultExtensions
{
    /// <summary>
    /// Pipes an async result to a selector function and returns its result.
    /// </summary>
    /// <typeparam name="T">The type of the async function result.</typeparam>
    /// <typeparam name="TOther">The type returned by <paramref name="selector"/>.</typeparam>
    /// <param name="task">The async function.</param>
    /// <param name="selector">The selector function. Receives the result of the async function.</param>
    /// <returns></returns>
    public static async Task<Result<TOther>> PipeAsync<T, TOther>(this Task<Result<T>> task, Func<T, Task<TOther>> selector)
    {
        try
        {
            var val = await task;
            if (val.Value != null)
            {
                var other = await selector(val.Value);
                return new Result<TOther>(other, val.Error);
            }
            else
            {
                return new Result<TOther>(default, val.Error);
            }
        }
        catch (Exception error)
        {
            return new Result<TOther>(default, error);
        }
    }

    public static async Task<Result<TOther>> PipeAsync<T, TOther>(this Task<Result<T>> task, Func<T, Task<Result<TOther>>> selector)
    {
        try
        {
            var val = await task;
            if (val.Error != null)
            {
                return new Result<TOther>(default, val.Error);
            }

            var selectedResult = val.Pipe(selector);
            if (selectedResult.Value != null)
            {
                var other = await selectedResult.Value;
                return other;
            }

            return new Result<TOther>(default, selectedResult.Error);
        }
        catch (Exception error)
        {
            return new Result<TOther>(default, error);
        }
    }
}
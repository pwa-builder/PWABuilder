namespace PWABuilder.Models;

/// <summary>
/// Represents a result or exception.
/// </summary>
/// <typeparam name="T"></typeparam>
public readonly struct Result<T>
{
    /// <summary>
    /// Creates a successful value.
    /// </summary>
    /// <param name="value"></param>
    public Result(T? value)
    {
        this.Value = value;
        this.Error = null;
    }

    /// <summary>
    /// Creates a new result from the specified value and error.
    /// </summary>
    /// <param name="value">The successful value.</param>
    /// <param name="error">The exception if the result was unsuccessful.</param>
    public Result(T? value, Exception? error)
    {
        this.Value = value;
        this.Error = error;
    }

    /// <summary>
    /// The value if the result was successful.
    /// </summary>
    public T? Value { get; init; }

    /// <summary>
    /// The exception if the result was unsuccessful.
    /// </summary>
    public Exception? Error { get; init; }

    public void Deconstruct(out T? value, out Exception? error)
    {
        value = this.Value;
        error = this.Error;
    }

    public Result<TOther> Pipe<TOther>(Func<T, TOther?> selector)
    {
        if (this.Value == null)
        {
            return new Result<TOther>(default, this.Error);
        }

        var val = selector(this.Value);
        return new Result<TOther>(val);
    }

    public T ValueOr(Func<T> creator)
    {
        return this.Value ?? creator();
    }

    public static implicit operator Result<T>(T result) => new Result<T>(result);
    public static implicit operator Result<T>(Exception error) => new Result<T>(default, error);
}

public static class Result
{
    public static Result<T> From<T>(T val)
    {
        return new Result<T>(val);
    }
}
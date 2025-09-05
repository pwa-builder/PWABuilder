using System;

namespace PWABuilder.MicrosoftStore.Common;

/// <summary>
/// Represents a path to a file.
/// </summary>
/// <param name="Path">The file path.</param>
public record FilePath(string Path)
{
    /// <summary>
    /// Gets the file path, ensuring it's not null or empty.
    /// </summary>
    public string Path { get; init; } = !string.IsNullOrWhiteSpace(Path) 
        ? Path 
        : throw new ArgumentException("File path cannot be null or empty.", nameof(Path));

    /// <summary>
    /// Gets the directory path of this file.
    /// </summary>
    public string Directory => System.IO.Path.GetDirectoryName(Path) ?? string.Empty;

    /// <summary>
    /// Gets the file name without the directory path.
    /// </summary>
    public string FileName => System.IO.Path.GetFileName(Path);

    /// <summary>
    /// Gets the file name without the extension.
    /// </summary>
    public string FileNameWithoutExtension => System.IO.Path.GetFileNameWithoutExtension(Path);

    /// <summary>
    /// Gets the file extension.
    /// </summary>
    public string Extension => System.IO.Path.GetExtension(Path);

    /// <summary>
    /// Gets whether this file path is rooted (absolute).
    /// </summary>
    public bool IsRooted => System.IO.Path.IsPathRooted(Path);

    /// <summary>
    /// Creates a new FilePath with the specified file name, preserving the directory.
    /// </summary>
    /// <param name="newFileName">The new file name.</param>
    /// <returns>A new FilePath with the updated file name.</returns>
    public FilePath WithFileName(string newFileName)
        => new(System.IO.Path.Combine(Directory, newFileName));

    /// <summary>
    /// Combines this path with additional path segments.
    /// </summary>
    /// <param name="paths">The path segments to combine.</param>
    /// <returns>A new FilePath representing the combined path.</returns>
    public FilePath Combine(params string[] paths)
        => new(System.IO.Path.Combine([Path, .. paths]));

    /// <summary>
    /// Implicit operator to convert from string to FilePath.
    /// </summary>
    /// <param name="path">The file path string.</param>
    public static implicit operator FilePath(string path) => new(path);

    /// <summary>
    /// Implicit operator to convert from FilePath to string.
    /// </summary>
    /// <param name="filePath">The FilePath instance.</param>
    public static implicit operator string(FilePath filePath) => filePath.Path;
}

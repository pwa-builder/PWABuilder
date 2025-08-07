namespace PWABuilder.Models;

/// <summary>
/// The status of a web app URL analysis on PWABuilder.
/// </summary>
public enum AnalysisStatus
{
    /// <summary>
    /// The analysis is queued and waiting to be processed.
    /// </summary>
    Queued,
    /// <summary>
    /// The analysis has begun processing.
    /// </summary>
    Processing,
    /// <summary>
    /// The analysis has completed. There will be a Report on the analysis.
    /// </summary>
    Completed,
    /// <summary>
    /// The analysis has failed. There will be an Error on the analysis.
    /// </summary>
    Failed
}
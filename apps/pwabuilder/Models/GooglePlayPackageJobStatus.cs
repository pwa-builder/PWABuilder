namespace PWABuilder.Models;

public enum GooglePlayPackageJobStatus
{
    /// <summary>
    /// The job is waiting to be processed.
    /// </summary>
    Queued,

    /// <summary>
    /// The job is currently being processed.
    /// </summary>
    InProgress,

    /// <summary>
    /// The job completed successfully.
    /// </summary>
    Succeeded,

    /// <summary>
    /// The job failed. There should be one or more errors on the job instance.
    /// </summary>
    Failed
}
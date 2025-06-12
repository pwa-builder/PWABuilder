public class Report
{
    public Audits audits { get; set; }
    public Artifacts artifacts { get; set; }
}

public class Audits
{
    public ScoreObj isOnHttps { get; set; }
    public ScoreObj noMixedContent { get; set; }
    public InstallableManifestAudit installableManifest { get; set; }
    public ServiceWorkerAudit serviceWorker { get; set; }
    public ScoreObj offlineSupport { get; set; }
    public ImagesAudit images { get; set; }
}

public class ScoreObj
{
    public bool score { get; set; }
}

public class InstallableManifestAudit
{
    public bool score { get; set; }
    public InstallableManifestDetails details { get; set; }
}

public class InstallableManifestDetails
{
    public string url { get; set; }
    public object validation { get; set; }
}

public class ServiceWorkerAudit
{
    public bool score { get; set; }
    public ServiceWorkerDetails details { get; set; }
}

public class ServiceWorkerDetails
{
    public string url { get; set; }
    public string scope { get; set; }
    public object features { get; set; }
    public object error { get; set; }
}

public class ImagesAudit
{
    public object score { get; set; }
    public ImagesDetails details { get; set; }
}

public class ImagesDetails
{
    public object iconsValidation { get; set; }
    public object screenshotsValidation { get; set; }
}

public class Artifacts
{
    public object webAppManifest { get; set; }
    public object serviceWorker { get; set; }
}

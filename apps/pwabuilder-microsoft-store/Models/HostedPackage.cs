using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System.Xml.Serialization;

namespace Microsoft.PWABuilder.Windows.Chromium.Models
{
	/// <summary>
	/// The serialized result from an .msix.xml package.
	/// </summary>
	[XmlRoot(ElementName = "Package", Namespace = "http://schemas.microsoft.com/appx/manifest/foundation/windows10")]
	public class HostedPackage
	{
		[XmlAttribute]
		public string? IgnorableNamespaces { get; set; }
		public PackageIdentity? Identity { get; set; }
		public PackageProperties? Properties { get; set; }
		public PackageDependencies? Dependencies { get; set; }

		[XmlArray]
		[XmlArrayItem("Resource")]
		public List<Resource>? Resources { get; set; }

		[XmlArray]
		[XmlArrayItem("Application")]
		public List<Application>? Applications { get; set; }

		[XmlArray]
		[XmlArrayItem(ElementName = "Capability", Namespace = "http://schemas.microsoft.com/appx/manifest/foundation/windows10/restrictedcapabilities")]
		public List<Capability>? Capabilities { get; set; }

		public static HostedPackage FromFile(string xmlFilePath)
		{
			var serializer = new XmlSerializer(typeof(HostedPackage));
			using var reader = System.IO.File.OpenRead(xmlFilePath);
			var hostedPackage = serializer.Deserialize(reader) as HostedPackage;
			if (hostedPackage == null)
			{
				throw new InvalidOperationException("Unable to deserialize hosted package");
			}

			return hostedPackage;
		}

		/// <summary>
		/// Examines the first <see cref="Application"/> parameters to find the "--app-id" parameter passed to Edge.
		/// </summary>
		/// <remarks>
		/// This is used by Edge to uniquely identify a PWA. Thus, both modern and classic app packages need to have the same app ID.
		/// </remarks>
		/// <returns>The app ID passed to Edge to uniquely identify the PWA. If no such value is found, null will be returned.</returns>
		public string? GetAppId()
		{
			var paramsOrEmpty = this.Applications?.FirstOrDefault()?.Parameters ?? string.Empty;
			var allParams = paramsOrEmpty.Split(' ');
			var appId = allParams.FirstOrDefault(p => p.StartsWith("--app-id=", StringComparison.InvariantCultureIgnoreCase));
			return appId?.Substring(appId.IndexOf('=') + 1);
		}

		public class PackageIdentity
		{
			[XmlAttribute]
			public string? Name { get; set; }

			[XmlAttribute]
			public string? Publisher { get; set; }

			[XmlAttribute]
			public string? Version { get; set; }

			[XmlAttribute]
			public string? ProcessorArchitecture { get; set; }
		}

		public class PackageProperties
		{
			public string? DisplayName { get; set; }
			public string? PublisherDisplayName { get; set; }
			public string? Logo { get; set; }
		}

		public class PackageDependencies
		{
			public TargetDeviceFamily? TargetDeviceFamily { get; set; }
			[XmlElement(Namespace = "http://schemas.microsoft.com/appx/manifest/uap/windows10/10")]
			public RuntimeDependency? HostRuntimeDependency { get; set; }
		}

		public class TargetDeviceFamily
		{
			[XmlAttribute]
			public string? Name { get; set; }
			[XmlAttribute]
			public string? MaxVersionTested { get; set; }
			[XmlAttribute]
			public string? MinVersion { get; set; }
		}

		public class RuntimeDependency
		{
			[XmlAttribute]
			public string? Publisher { get; set; }
			[XmlAttribute]
			public string? Name { get; set; }
			[XmlAttribute]
			public string? MinVersion { get; set; }
		}

		public class Resource
		{
			[XmlAttribute]
			public string? Language { get; set; }
		}

		public class Application
		{
			[XmlAttribute(AttributeName = "Parameters", Namespace = "http://schemas.microsoft.com/appx/manifest/uap/windows10/10")]
			public string? Parameters { get; set; }

			[XmlAttribute(AttributeName = "HostId", Namespace = "http://schemas.microsoft.com/appx/manifest/uap/windows10/10")]
			public string? HostId { get; set; }

			[XmlAttribute]
			public string? Id { get; set; }

			[XmlElement(ElementName = "VisualElements", Namespace = "http://schemas.microsoft.com/appx/manifest/uap/windows10")]
			public VisualElements? VisualElements { get; set; }

			public object? Extensions { get; set; }
		}

		public class VisualElements
		{
			[XmlAttribute]
			public string? Square44x44Logo { get; set; }
			[XmlAttribute]
			public string? Square150x150Logo { get; set; }
			[XmlAttribute]
			public string? BackgroundColor { get; set; }
			[XmlAttribute]
			public string? Description { get; set; }
			[XmlAttribute]
			public string? DisplayName { get; set; }

			[XmlElement(Namespace = "http://schemas.microsoft.com/appx/manifest/uap/windows10")]
			public DefaultTile? DefaultTile { get; set; }
		}

		public class DefaultTile
		{
			[XmlAttribute]
			public string? Square310x310Logo { get; set; }
			[XmlAttribute]
			public string? Wide310x150Logo { get; set; }
			[XmlAttribute]
			public string? Square71x71Logo { get; set; }

			[XmlArray]
			[XmlArrayItem(ElementName = "ShowOn", Namespace = "http://schemas.microsoft.com/appx/manifest/uap/windows10")]
			public List<ShowOn>? ShowNameOnTiles { get; set; }
		}

		public class ShowOn
		{
			[XmlAttribute]
			public string? Tile { get; set; }
		}

		public class Capability
		{
			[XmlAttribute]
			public string? Name { get; set; }
		}
	}
}

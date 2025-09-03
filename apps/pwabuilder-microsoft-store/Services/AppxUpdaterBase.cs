using Microsoft.Extensions.Options;
using PWABuilder.MicrosoftStore.Common;
using PWABuilder.MicrosoftStore.Models;
using System;
using System.Collections.Generic;
using System.IO;
using System.IO.Compression;
using System.Linq;
using System.Reflection.Metadata.Ecma335;
using System.Text.Json;
using System.Threading.Tasks;
using System.Xml;

namespace PWABuilder.MicrosoftStore
{
    /// <summary>
    /// Base class for services that extracts an .appx template, updates its information and images, then repackages it as a new .appx file.
    /// Inherited by <see cref="ClassicWindowsPackageCreator"/> and <see cref="SpartanWindowsPackageCreator"/>.
    /// </summary>
    public class AppxUpdaterBase
    {
        protected readonly MakePriWrapper makePri;
        protected readonly MakeAppxWrapper makeAppx;

        protected AppxUpdaterBase(MakePriWrapper makePri, MakeAppxWrapper makeAppx)
        {
            this.makePri = makePri;
            this.makeAppx = makeAppx;
        }

        /// <summary>
        /// Creates a new appx package by swapping extracting the appx template and updating its values.
        /// </summary>
        /// <param name="appImages">The images for the app.</param>
        /// <param name="appVersion">The version of the app.</param>
        /// <param name="appxTemplatePath">The path to the .appx template.</param>
        /// <param name="options">The package options.</param>
        /// <param name="outputDirectory">The directory to store the artifacts in.</param>
        /// <param name="webManifest">The web manifest of the PWA.</param>
        /// <returns>The path to the .appx file.</returns>
        protected async Task<UpdatedAppx> GenerateAppx(
            string appxTemplatePath, 
            Version appVersion, 
            WindowsAppPackageOptions options, 
            WebAppManifestContext webManifest, 
            ImageGeneratorResult appImages, 
            string outputDirectory)
        {
            // Extract the project template .appx file (really, a .zip file) into a subdir of outputDirectory.
            var projectDirectory = ExtractAppx(appxTemplatePath, outputDirectory);

            // Update the template with the real app information.
            var publisher = GetPublisher(options, webManifest);
            await UpdateProjectFiles(outputDirectory, projectDirectory, appVersion, options, webManifest, publisher, appImages);

            // Finally, repackage the appx from the unzipped files.
            var appxFilePath = await makeAppx.Execute(projectDirectory, outputDirectory);

            return new UpdatedAppx
            {
                AppxFilePath = appxFilePath,
                AppxLooseFilesDirectory = projectDirectory
            };
        }

        /// <summary>
        /// Unzips the appx template and updates its files.
        /// </summary>
        /// <param name="outputDirectory"></param>
        /// <param name="projectDirectory"></param>
        /// <param name="version"></param>
        /// <param name="options"></param>
        /// <param name="webManifest"></param>
        /// <param name="publisher"></param>
        /// <param name="appImages"></param>
        /// <returns></returns>
        protected virtual async Task UpdateProjectFiles(
            string outputDirectory,
            string projectDirectory,
            Version version,
            WindowsAppPackageOptions options,
            WebAppManifestContext webManifest,
            Publisher publisher,
            ImageGeneratorResult appImages)
        {
            // Update the AppManifest.xml file
            var appxManifestFilePath = Path.Combine(projectDirectory, "AppxManifest.xml");
            var xmlDoc = new XmlDocument();
            xmlDoc.Load(appxManifestFilePath);
            await UpdateAppxManifest(xmlDoc, options, version, webManifest, publisher);
            xmlDoc.Save(appxManifestFilePath);

            // Bring in the updated images.
            await UpdateAppImages(outputDirectory, projectDirectory, appImages);
        }

        protected virtual Task UpdateAppxManifest(
            XmlDocument xmlDoc, 
            WindowsAppPackageOptions options,
            Version appVersion,
            WebAppManifestContext webManifest,
            Publisher publisher)
        {
            // The version must specify zero as the revision.
            // The UI allows the user to specify an omitted revision (1.2.3), but before we write it
            // to the manifest, we need zero as the revision (1.2.3.0)
            var version = appVersion.WithZeroRevision();

            // Update the Identity element to have the package ID, publisher distinguished name, and version.
            var identityElement = xmlDoc.GetRequiredElementByTagName("Identity");
            identityElement.SetAttribute("Name", options.PackageId);
            identityElement.SetAttribute("Publisher", publisher.CommonName);
            identityElement.SetAttribute("Version", version.ToString());

            // Update the publisher display name.            
            if (!string.IsNullOrWhiteSpace(publisher.DisplayName))
            {
                var pubDisplayName = xmlDoc.GetRequiredElementByTagName("PublisherDisplayName");
                pubDisplayName.InnerText = publisher.DisplayName;
            }

            // Update the app display name.
            var visualElements = xmlDoc.GetRequiredElementByTagName("uap:VisualElements");
            if (!string.IsNullOrWhiteSpace(options.Name))
            {
                var displayName = xmlDoc.GetRequiredElementByTagName("DisplayName");
                displayName.InnerText = options.Name;
                visualElements.SetAttribute("DisplayName", options.Name);
            }

            // Update the app description.
            visualElements.SetAttribute("Description", GetDescription(options, webManifest));

            // Update the background color of the tile.
            var bgColor = GetBackgroundColor(options, webManifest);
            visualElements.SetAttribute("BackgroundColor", bgColor);

            // Update the short name of the default tile.
            var defaultTile = xmlDoc.GetRequiredElementByTagName("uap:DefaultTile");
            var shortNameCandidates = new[] { webManifest.Short_name, options.Name, webManifest.Name, "My PWA" };
            defaultTile.SetAttribute("ShortName", shortNameCandidates.FirstOrDefault(n => !string.IsNullOrWhiteSpace(n)));

            return Task.CompletedTask;
        }

        private string ExtractAppx(string appxPath, string outputDirectory)
        {
            var extractedDirectory = Path.Combine(outputDirectory, "appx-unzipped");
            ZipFile.ExtractToDirectory(appxPath, extractedDirectory);
            return extractedDirectory;
        }

        private string GetBackgroundColor(WindowsAppPackageOptions options, WebAppManifestContext manifest)
        {
            var backgroundColors = new[]
            {
                GetWindowsColorOrNull(options.Images?.BackgroundColor),
                GetWindowsColorOrNull(manifest.Background_color)
            };
            return backgroundColors.FirstOrDefault(c => !string.IsNullOrEmpty(c) && c.Length == 7) ?? "transparent";
        }

        // This checks for shorthand hex colors (e.g. "#f60") and converts them to the full long form ("#FF6600") color that the Windows SDK tooling requires.
        // It also converts the hex into uppercase, as used by Windows tooling.
        // If the color can't be converted into a Windows color, null will be returned.
        // For info about shorthand hex, see http://www.websiteoptimization.com/speed/tweak/hex
        private string? GetWindowsColorOrNull(string? hex)
        {
            if (string.IsNullOrEmpty(hex))
            {
                return hex;
            }

            // If it's not a hex color, sorry, we don't support that.
            if (!hex.StartsWith('#'))
            {
                return null;
            }

            // See if it's shorthand
            if (hex.Length == 4)
            {
                // Converts #f60 to #FF6600
                return $"#{hex[1]}{hex[1]}{hex[2]}{hex[2]}{hex[3]}{hex[3]}".ToUpperInvariant();
            }

            // If it's already 7 chars in length, great!
            if (hex.Length == 7)
            {
                return hex.ToUpperInvariant();
            }

            return null;
        }

        private string GetAppName(WindowsAppPackageOptions options, WebAppManifestContext manifest)
        {
            var names = new[]
            {
                options.Name,
                manifest.Name
            };
            return names.FirstOrDefault(n => !string.IsNullOrWhiteSpace(n)) ?? options.PackageId;
        }

        private Publisher GetPublisher(WindowsAppPackageOptions options, WebAppManifestContext manifest)
        {
            var publisher = options.Publisher ?? new Publisher();
            if (string.IsNullOrWhiteSpace(publisher.CommonName))
            {
                publisher.CommonName = "CN=XX0X0000-0X00-0X00-0X00-000000XX0XXX";
            }

            if (string.IsNullOrWhiteSpace(publisher.DisplayName))
            {
                publisher.DisplayName = $"{GetAppName(options, manifest)} Publisher";
            }

            return publisher;
        }

        private string GetDescription(WindowsAppPackageOptions options, WebAppManifestContext webManifest)
        {
            // Description must be a string between 1 and 2048 characters in length that cannot include characters such as tabs, carriage returns, and line feeds.
            // https://docs.microsoft.com/en-us/uwp/schemas/appxpackage/uapmanifestschema/element-uap-visualelements
            var desiredDescription = new[]
            {
                webManifest.Description,
                webManifest.Name,
                webManifest.Short_name,
                options.Name
            }.FirstOrDefault(d => !string.IsNullOrEmpty(d));
            if (desiredDescription == null)
            {
                throw new ArgumentException($"Couldn't find a valid description. All possible candidates are null or empty. Please ensure you have a description in your web app manifest.");
            }

            var strippedAndTrimmed = desiredDescription
                .Replace('\r', ' ')
                .Replace('\n', ' ')
                .Replace('\t', ' ')
                .Trim(); // Trim fixes errors where users have descriptions ending in whitespace, which causes some problems for packaging.

            // Are we longer than 2048 characters? If so, add ellipsis.
            if (strippedAndTrimmed.Length > 2048)
            {
                return strippedAndTrimmed.Substring(0, 2045) + "...";
            }

            return strippedAndTrimmed;
        }

        private async Task UpdateAppImages(string outputDirectory, string projectDirectory, ImageGeneratorResult appImages)
        {
            CopyAppImages(appImages, Path.Combine(projectDirectory, "Images"));

            await makePri.Execute(projectDirectory, outputDirectory);
        }

        private void CopyAppImages(ImageGeneratorResult appImages, string targetDir)
        {
            // Delete the placeholder images.
            var placeholderImages = Directory.EnumerateFiles(targetDir);
            foreach (var placeholder in placeholderImages)
            {
                File.Delete(placeholder);
            }

            // Copy in the app images.
            foreach (var sourceFilePath in appImages.ImagePaths)
            {
                var destinationFilePath = Path.Combine(targetDir, Path.GetFileName(sourceFilePath));
                File.Copy(sourceFilePath, destinationFilePath);
            }
        }
    }
}

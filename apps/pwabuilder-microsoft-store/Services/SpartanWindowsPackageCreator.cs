using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Razor.Infrastructure;
using Microsoft.Extensions.Options;
using PWABuilder.MicrosoftStore.Common;
using PWABuilder.MicrosoftStore.Models;
using System;
using System.Collections.Generic;
using System.IO;
using System.IO.Compression;
using System.Linq;
using System.Threading.Tasks;
using System.Xml;

namespace PWABuilder.MicrosoftStore
{
    /// <summary>
    /// Creates a Windows app package that runs a PWA using the old Spartan (EdgeHTML)-based engine.
    /// </summary>
    public class SpartanWindowsPackageCreator : AppxUpdaterBase
    {
        private readonly AppSettings settings;

        public SpartanWindowsPackageCreator(
            MakePriWrapper makePri,
            MakeAppxWrapper makeAppx,
            IOptions<AppSettings> settings)
            : base(makePri, makeAppx)
        {
            this.settings = settings.Value;
        }

        /// <summary>
        /// Creates the classic Windows app package. Returns the file path to the generated app package.
        /// </summary>
        /// <param name="options">The package creation options.</param>
        /// <returns></returns>
        public async Task<SpartanWindowsPackageResult> Create(WindowsAppPackageOptions options, WebAppManifestContext webManifest, ImageGeneratorResult appImages, string outputDirectory)
        {
            var appxTemplatePath = settings.SpartanWindowsAppPackagePath;
            var version = GetSpartanVersion(options).WithZeroRevision();

            // Create a new appx from the SpartanWindowsAppPackage.appx template.
            var updatedAppxResult = await this.GenerateAppx(appxTemplatePath, version, options, webManifest, appImages, outputDirectory);

            // Bundle it.
            var appxBundlePath = await this.makeAppx.Bundle(updatedAppxResult.AppxFilePath, version);

            return new SpartanWindowsPackageResult
            {
                AppxPath = appxBundlePath,
                AppxLooseFilesDirectory = updatedAppxResult.AppxLooseFilesDirectory
            };
        }

        protected override async Task UpdateAppxManifest(XmlDocument xmlDoc, WindowsAppPackageOptions options, Version appVersion, WebAppManifestContext webManifest, Publisher publisher)
        {
            await base.UpdateAppxManifest(xmlDoc, options, appVersion, webManifest, publisher);

            // Update the Application element so its StartPage = the PWA's URL
            var appElement = xmlDoc.GetRequiredElementByTagName("Application");
            var appUrl = options.EdgeHtmlPackage?.Url ?? options.Url;
            appElement.SetAttribute("StartPage", appUrl);

            // Update the existing Rule to allow the app to have access to Windows Runtime.
            var existingWinRuntimeRule = xmlDoc.GetRequiredElementByTagName("uap:Rule");
            existingWinRuntimeRule.SetAttribute("Match", appUrl);

            // Add any additional URLs with Windows Runtime access.
            if (options.EdgeHtmlPackage?.UrlsWithWindowsRuntimeAccess != null)
            {
                var urlsWithAccessElement = xmlDoc.GetRequiredElementByTagName("uap:ApplicationContentUriRules");
                foreach (var url in options.EdgeHtmlPackage.UrlsWithWindowsRuntimeAccess)
                {
                    var urlElement = (XmlElement)existingWinRuntimeRule.Clone();
                    urlElement.SetAttribute("Match", url);
                    urlsWithAccessElement.AppendChild(urlElement);
                }
            }
        }

        private Version GetSpartanVersion(WindowsAppPackageOptions options)
        {
            if (Version.TryParse(options.EdgeHtmlPackage?.Version, out var spartanVersion))
            {
                return spartanVersion;
            }

            return new Version(options.Version);
        }
    }
}

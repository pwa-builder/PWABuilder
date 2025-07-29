using Microsoft.PWABuilder.Windows.Chromium.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Microsoft.PWABuilder.Windows.Chromium.Common
{
    public static class ImageAltFormExtensions
    {
        /// <summary>
        /// Converts the specified alt form and target size to a full file name using the Windows image naming conventions for alt forms and target sizes.
        /// </summary>
        /// <remarks>
        /// See https://docs.microsoft.com/en-us/windows/uwp/design/style/app-icons-and-logos
        /// </remarks>
        /// <param name="altForm">The image alternate form.</param>
        /// <param name="targetSize">The target size.</param>
        /// <returns>
        /// A string in the Windows image naming convention.
        /// For example, if the input is (AltForm.Unplated, ImageTargetSize64), the output will be "Square44x44Logo.altform-unplated_targetsize-64".
        /// </returns>
        public static string ToWindowsImageNamingConventionString(this ImageAltForm altForm, ImageTargetSize targetSize)
        {
            return "Square44x44Logo." + altForm.ToFileNameSuffix(targetSize);
        }

        /// <summary>
        /// Converts the specified alt form and target size to the Windows image naming convention for alt form and target size.
        /// </summary>
        /// <param name="altForm"></param>
        /// <param name="targetSize"></param>
        private static string ToFileNameSuffix(this ImageAltForm altForm, ImageTargetSize targetSize)
        {
            // Seperator character is underscore, unless there is no alt form in which case there is no separator.
            // (ImageAltForm.Unplated, ImageTargetSize.32) => "altform-unplated_targetsize-32"
            // (ImageAltForm.None, ImageTargetSize.64) => "targetsize-32"
            var separator = altForm == ImageAltForm.None ? string.Empty : "_";
            return $"{altForm.ToFileNameSuffix()}{separator}targetsize-{targetSize.ToSuffix()}";
        }

        /// <summary>
        /// Converts the alt form to a string using the Windows image naming convention.
        /// </summary>
        /// <param name="altForm"></param>
        /// <returns></returns>
        private static string ToFileNameSuffix(this ImageAltForm altForm)
        {
            return altForm switch
            {
                ImageAltForm.None => string.Empty,
                ImageAltForm.Unplated => "altform-unplated",
                ImageAltForm.Light => "altform-lightunplated",
                _ => throw new NotSupportedException("Unknown image alt form " + altForm)
            };
        }
    }
}

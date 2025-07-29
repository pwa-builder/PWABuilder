using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Microsoft.PWABuilder.Windows.Chromium.Models
{
    /// <summary>
    /// Contains an image of a particular dimension (e.g. 16x16), along with an optional Windows light themed image of the same dimensions.
    /// </summary>
    public class ImageTargetSizeSet
    {
        /// <summary>
        /// The URI of the image.
        /// </summary>
        public Uri? Image { get; set; }

        /// <summary>
        /// The URI of the image used in Windows light theme.
        /// </summary>
        public Uri? ImageLightTheme { get; set; }

        /// <summary>
        /// The URI of the unplated image. See https://mikaelkoskinen.net/post/uwp-windows10-taskbar-logo-size
        /// </summary>
        public Uri? ImageUnplated { get; set; }

        /// <summary>
        /// Gets the image URI corresponding to the specified alt form.
        /// </summary>
        /// <param name="altForm"></param>
        /// <returns></returns>
        public Uri? GetImageForAltForm(ImageAltForm altForm)
        {
            return altForm switch
            {
                ImageAltForm.None => Image,
                ImageAltForm.Light => ImageLightTheme,
                ImageAltForm.Unplated => ImageUnplated,
                _ => throw new NotSupportedException("Unknown image alt form " + altForm)
            };
        }
    }
}

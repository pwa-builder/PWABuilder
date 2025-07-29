using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Microsoft.PWABuilder.Windows.Chromium.Models
{
    /// <summary>
    /// Describes an image with multiple scaled versions of the image for use at different DPIs.
    /// </summary>
    public class ImageScaleSet
    {
        /// <summary>
        /// The image to display at normal (1x) scale.
        /// </summary>
        public Uri? Image { get; set; }
        /// <summary>
        /// The URI of the image to use at 1.25x scale.
        /// </summary>
        public Uri? Image125 { get; set; }
        /// <summary>
        /// The URI of the image to use at 1.5x scale.
        /// </summary>
        public Uri? Image150 { get; set; }
        /// <summary>
        /// The URI of the image to use at 2x scale.
        /// </summary>
        public Uri? Image200 { get; set; }
        /// <summary>
        /// The URI of the image to use at 4x scale.
        /// </summary>
        public Uri? Image400 { get; set; }

        public Uri? GetImageForScale(ImageScale scale, WebAppManifestContext webManifest)
        {
            var relativeUri = scale switch
            {
                ImageScale.X1 => Image,
                ImageScale.X125 => Image125,
                ImageScale.X150 => Image150,
                ImageScale.X200 => Image200,
                ImageScale.X400 => Image400,
                _ => throw new NotSupportedException("Unknown image scale " + scale)
            };

            return null;
        }
    }
}

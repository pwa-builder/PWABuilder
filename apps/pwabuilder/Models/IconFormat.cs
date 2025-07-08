using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace PWABuilder.IOS.Models
{
    /// <summary>
    /// Common formats for web manifest icons.
    /// </summary>
    public enum IconFormat
    {
        /// <summary>
        /// .png format
        /// </summary>
        Png,

        /// <summary>
        /// .jpg format
        /// </summary>
        Jpg,

        /// <summary>
        /// .gif format
        /// </summary>
        Gif,

        /// <summary>
        /// .svg format
        /// </summary>
        Svg,

        /// <summary>
        /// Icon format
        /// </summary>
        Ico,

        /// <summary>
        /// .webp format
        /// </summary>
        Webp,

        /// <summary>
        /// No format is specified.
        /// </summary>
        Unspecified,

        /// <summary>
        /// An unknown format is specified but we don't handle it in the Windows platform code.
        /// </summary>
        Other,
    }
}

using Microsoft.PWABuilder.Microsoft.Store.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Microsoft.PWABuilder.Microsoft.Store.Common
{
    public static class ImageScaleExtensions
    {
        /// <summary>
        /// Converts the image scale to the suffix used in an image source's target file name.
        /// </summary>
        /// <param name="scale"></param>
        /// <returns></returns>
        public static string ToWindowsImageNamingConventionSuffix(this ImageScale scale)
        {
            return scale switch
            {
                ImageScale.X1 => "100",
                ImageScale.X125 => "125",
                ImageScale.X150 => "150",
                ImageScale.X200 => "200",
                ImageScale.X400 => "400",
                _ => throw new NotSupportedException("Unknown image scale " + scale)
            };
        }
    }
}

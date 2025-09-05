using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace PWABuilder.MicrosoftStore.Models
{
    /// <summary>
    /// The types of image scale sets for Windows app packages.
    /// </summary>
    public enum ImageScaleSetType
    {
        SplashScreen,
        AppIcon,
        SmallTile,
        MediumTile,
        LargeTile,
        WideTile,
        StoreLogo
    }
}

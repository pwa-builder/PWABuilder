using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Microsoft.PWABuilder.Microsoft.Store.Models
{
    public class ImageGeneratorResult
    {
        public ImageGeneratorResult(List<string> imagePaths)
        {
            this.ImagePaths = imagePaths;
        }

        public List<string> ImagePaths { get; set; }
    }
}

using Microsoft.AspNetCore.Mvc;
using Microsoft.Net.Http.Headers;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Microsoft.PWABuilder.Microsoft.Store.Controllers
{
    /// <summary>
    /// Returns a file in the response stream. When completed, the file will be deleted.
    /// </summary>
    public class TempFileResult : PhysicalFileResult
    {
        public TempFileResult(string fileName, string contentType)
                     : base(fileName, contentType) { }
        public TempFileResult(string fileName, MediaTypeHeaderValue contentType)
                     : base(fileName, contentType) { }

        public override async Task ExecuteResultAsync(ActionContext context)
        {
            await base.ExecuteResultAsync(context);
            TryDeleteFile();
        }

        private void TryDeleteFile()
        {
            try
            {
                System.IO.File.Delete(FileName);
            }
            catch (Exception error)
            {
                Console.Error.WriteLine("Unable to delete temp file {0} after stream: {1}", FileName, error);
            }
        }
    }
}

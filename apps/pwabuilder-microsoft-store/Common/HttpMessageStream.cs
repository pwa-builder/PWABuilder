using Microsoft.AspNetCore.Http;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Net.Http;
using System.Threading.Tasks;

namespace PWABuilder.MicrosoftStore.Common
{
    /// <summary>
    /// A readable stream opened from an <see cref="HttpResponseMessage"/>. Upon disposal, both the stream and the message are disposed.
    /// </summary>
    public class HttpMessageStream : Stream
    {
        private readonly Stream stream;
        private readonly HttpResponseMessage message;

        public HttpMessageStream(Stream stream, HttpResponseMessage message)
        {
            this.stream = stream;
            this.message = message;
        }

        public override bool CanRead => stream.CanRead;

        public override bool CanSeek => stream.CanSeek;

        public override bool CanWrite => stream.CanWrite;

        public override long Length => stream.Length;

        public override long Position { get => stream.Position; set => stream.Position = value; }

        public override void Flush() => stream.Flush();

        public override int Read(byte[] buffer, int offset, int count) => stream.Read(buffer, offset, count);

        public override long Seek(long offset, SeekOrigin origin) => stream.Seek(offset, origin);

        public override void SetLength(long value) => stream.SetLength(value);

        public override void Write(byte[] buffer, int offset, int count) => stream.Write(buffer, offset, count);

        protected override void Dispose(bool disposing)
        {
            if (disposing)
            {
                this.message.Dispose();
                this.stream.Dispose();
            }

            base.Dispose(disposing);
        }
    }
}

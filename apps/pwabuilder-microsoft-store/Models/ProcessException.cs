using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace PWABuilder.MicrosoftStore.Models
{

    [Serializable]
    public sealed class ProcessException : Exception
    {
        /// <inheritdoc/>
        public string? StandardOutput { get; set; }

        /// <inheritdoc/>
        public string? StandardError { get; set; }

        /// <inheritdoc/>
        public ProcessException() { }

        /// <inheritdoc/>
        public ProcessException(string message, string? standardOutput, string? standardError) : base(message)
        {
            StandardOutput = standardOutput;
            StandardError = standardError;
        }

        /// <inheritdoc/>
        public ProcessException(string message, Exception inner, string? standardOutput, string? standardError) : base(message, inner)
        {
            StandardOutput = standardOutput;
            StandardError = standardError;
        }
    }
}

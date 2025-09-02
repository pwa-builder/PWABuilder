using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Microsoft.PWABuilder.Microsoft.Store.Common
{
    public static class VersionExtensions
    {
        /// <summary>
        /// Creates a version that is smaller than the specified version.
        /// Since the Microsoft Store requires that version revision be 0 for internal use, this method 
        /// preserves that zero'd or omitted revision and instead decrements the build, minor, and major elements of the version.
        /// </summary>
        /// <param name="version">The version to decrement. This must be >= 1.0.1, and its revision must be zero or omitted.</param>
        /// <returns></returns>
        public static Version DecrementForStore(this Version version)
        {
            if (version <= new Version(1, 0, 0))
            {
                throw new ArgumentOutOfRangeException(nameof(version), version, "Version must be > 1.0.0");
            }
            if (version.Revision > 0)
            {
                throw new ArgumentOutOfRangeException(nameof(version), version, "The version's revision must be zero or omitted.");
            }

            if (version.Build > 0)
            {
                return new Version(version.Major, version.Minor, version.Build - 1, 0);
            }
            if (version.Minor > 0)
            {
                return new Version(version.Major, version.Minor - 1, 9, 0);
            }
            if (version.Major > 1) // Store apps can't have a version starting with zero, so the main version must be 2 or greater to get a decremented 1.
            {
                return new Version(version.Major - 1, 9, 0, 0);
            }

            throw new ArgumentOutOfRangeException(nameof(version), version, "Unable to decrement version.");
        }

        /// <summary>
        /// Creates a new version that has a zero as the revision.
        /// </summary>
        /// <param name="version"></param>
        /// <returns></returns>
        public static Version WithZeroRevision(this Version version)
        {
            return new Version(version.Major, version.Minor, version.Build, 0);
        }
    }
}

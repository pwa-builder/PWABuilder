namespace PWABuilder.Common;

/// <summary>
/// Contains a GetHashCodeStable extension method for strings.
/// </summary>
public static class HashCodeExtensions
{
    /// <summary>
    /// Gets a stable, deterministic hash code for a string. 
    /// Unlike object.GetHashCode, this will return the same value across different runs of the app. 
    /// For more info, see https://andrewlock.net/why-is-string-gethashcode-different-each-time-i-run-my-program-in-net-core/
    /// </summary>
    /// <param name="val">The string value to get a stable hash code from.</param>
    /// <returns>A stable hash code that is unchanging between app runs.</returns>
    public static int GetHashCodeStable(this string val)
    {
        if (val == null)
        {
            return 0;
        }

        unchecked
        {
            int hash1 = (5381 << 16) + 5381;
            int hash2 = hash1;

            for (int i = 0; i < val.Length; i += 2)
            {
                hash1 = ((hash1 << 5) + hash1) ^ val[i];
                if (i == val.Length - 1)
                    break;
                hash2 = ((hash2 << 5) + hash2) ^ val[i + 1];
            }

            return hash1 + (hash2 * 1566083941);
        }
    }
}
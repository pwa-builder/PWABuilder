using System;
using System.Collections.Generic;
using System.Diagnostics.CodeAnalysis;
using System.Linq;
using System.Threading.Tasks;

namespace PWABuilder.IOS.Models
{
    public class Color
    {
        public Color(byte r, byte g, byte b)
        {
            this.R = r;
            this.G = g;
            this.B = b;
        }

        public byte R { get; init; }
        public byte G { get; init; }
        public byte B { get; init; }

        /// <summary>
        /// Gets a value between 0 and 1 representing the percentage of the value to the max of 255.
        /// </summary>
        /// <param name="val"></param>
        /// <returns></returns>
        public double GetRgbPercentage(byte val) => (double)val / 255;

        public string ToStoryboardColorString()
        {
            return $"red=\"{GetRgbPercentage(R)}\" green=\"{GetRgbPercentage(G)}\" blue=\"{GetRgbPercentage(B)}\"";
        }

        public static bool TryParseHexColor(
            string? hexString,
            [NotNullWhen(true)] out Color? validColor
        )
        {
            if (string.IsNullOrWhiteSpace(hexString))
            {
                validColor = null;
                return false;
            }

            var hexRegex = "^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$"; // See https://www.geeksforgeeks.org/how-to-validate-hexadecimal-color-code-using-regular-expression/
            if (System.Text.RegularExpressions.Regex.IsMatch(hexString, hexRegex))
            {
                // If it's shorthand hex (#fff), convert to longhand (#ffffff).
                if (hexString.Length == 4)
                {
                    hexString =
                        $"#{hexString[1]}{hexString[1]}{hexString[2]}{hexString[2]}{hexString[3]}{hexString[3]}";
                }

                // We should never hit this, as regex checks for this above.
                if (hexString.Length != 7)
                {
                    validColor = null;
                    return false;
                }

                var r = Convert.ToByte(hexString[1..3], 16);
                var g = Convert.ToByte(hexString[3..5], 16);
                var b = Convert.ToByte(hexString[5..], 16);
                validColor = new Color(r, g, b);
                return true;
            }

            validColor = null;
            return false;
        }
    }
}

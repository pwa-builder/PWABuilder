using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System.Xml;

namespace PWABuilder.MicrosoftStore.Common
{
    /// <summary>
    /// Extensions for working with XML documents.
    /// </summary>
    public static class XmlExtensions
    {
        /// <summary>
        /// Finds the first element matching the specified tag name in the XML doc. If not found, an <see cref="XmlException"/> is thrown.
        /// </summary>
        /// <param name="xmlDoc"></param>
        /// <param name="elementTagName"></param>
        /// <returns></returns>
        public static XmlElement GetRequiredElementByTagName(this XmlDocument xmlDoc, string elementTagName)
        {
            var element = xmlDoc.GetElementsByTagName(elementTagName)
                .OfType<XmlElement>()
                .FirstOrDefault();
            if (element == null)
            {
                throw new XmlException("Unable to find required element by tag name " + elementTagName);
            }

            return element;
        }

        /// <summary>
        /// Find the attribute of the specified name on the node. If no such attribute exists, an <see cref="XmlException"/> will be thrown.
        /// </summary>
        /// <param name="node">The node to find the attribute on.</param>
        /// <param name="attributeName">The name of the attribute.</param>
        /// <returns></returns>
        public static XmlAttribute GetRequiredAttribute(this XmlNode node, string attributeName)
        {
            var attr = node.Attributes?[attributeName];
            if (attr == null)
            {
                throw new XmlException($"Unable to find required attribute {attributeName} on node");
            }

            return attr;
        }
    }
}

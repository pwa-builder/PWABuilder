import { IconInfo, isIconInfos } from "../interfaces/IconInfo";
import { Icon } from "../interfaces/manifest";

/**
 * Finds an icon matching the specified purpose, dimensions, and mime type.
 * If no exact match can be found, it will consider icons larger than the specified dimensions.
 * @param icons The icons to search.
 * @param purpose The desired purpose of the icon, e.g. 'any', 'maskable', etc, or null to ignore purpose.
 * @param mimeType Should be an image mime type, e.g. 'image/png', or null or empty to ignore format.
 * @param desiredHeight The desired height of a match.
 * @param desiredWidth The desired width of a match.
 */
export function findSuitableIcon(
  icons: Icon[] | IconInfo[] | null | undefined,
  purpose: "any" | "maskable" | "monochrome" | null,
  desiredWidth: number,
  desiredHeight: number,
  mimeType: string | undefined
): Icon | null {
  if (!icons || icons.length === 0) {
    return null;
  }

  const iconInfos = isIconInfos(icons)
    ? icons
    : icons.map((i) => new IconInfo(i));
  const exactMatch = iconInfos.find((i) =>
    i.isExactMatch(purpose, desiredWidth, desiredHeight, mimeType)
  );
  if (exactMatch) {
    return exactMatch.getIcon();
  }

  var largerMatch = iconInfos.find((i) =>
    i.isSuitableIcon(purpose, desiredWidth, desiredHeight, mimeType)
  );
  return largerMatch?.getIcon() || null;
}

/**
 * Finds a app icon suitable as a general purpose app icon: idealy, a large, square, PNG icon whose purpose is any.
 * @param icons The icons in which to find a good primary app icon.
 * @returns An icon suitable to use as a general purpose app icon.
 */
export function findBestAppIcon(icons: Icon[] | null | undefined): Icon | null {
  const iconInfos = (icons || []).map((i) => new IconInfo(i));
  return (
    findSuitableIcon(iconInfos, "any", 512, 512, "image/png") ||
    findSuitableIcon(iconInfos, "maskable", 512, 512, "image/png") ||
    findSuitableIcon(iconInfos, "any", 192, 192, "image/png") ||
    findSuitableIcon(iconInfos, "maskable", 192, 192, "image/png") ||
    findSuitableIcon(iconInfos, "any", 512, 512, "image/jpeg") ||
    findSuitableIcon(iconInfos, "maskable", 512, 512, "image/jpeg") ||
    findSuitableIcon(iconInfos, "any", 192, 192, "image/jpeg") ||
    findSuitableIcon(iconInfos, "maskable", 192, 192, "image/jpeg") ||
    findSuitableIcon(iconInfos, "any", 512, 512, undefined) ||
    findSuitableIcon(iconInfos, "maskable", 512, 512, undefined) ||
    findSuitableIcon(iconInfos, "any", 192, 192, undefined) ||
    findSuitableIcon(iconInfos, "maskable", 192, 192, undefined) ||
    findSuitableIcon(iconInfos, "any", 0, 0, "image/png") ||
    findSuitableIcon(iconInfos, "maskable", 0, 0, "image/png") ||
    findSuitableIcon(iconInfos, "any", 0, 0, "image/jpeg") ||
    findSuitableIcon(iconInfos, "maskable", 0, 0, "image/jpeg") ||
    findSuitableIcon(iconInfos, "any", 0, 0, undefined) ||
    findSuitableIcon(iconInfos, "maskable", 0, 0, undefined)
  );
}

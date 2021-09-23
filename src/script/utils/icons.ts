import { Icon } from './interfaces';

type IconDimension = { width: number; height: number };

/**
 * Finds an icon matching the specified purpose and desired dimensions.
 * @param mimeType Should be an image mime type, e.g. "image/png", or null or empty to ignore format.
 */
export function findSuitableIcon(
  icons: Icon[] | null | undefined,
  purpose: 'any' | 'maskable' | 'monochrome' | null,
  desiredWidth: number,
  desiredHeight: number,
  mimeType: string | undefined
): Icon | null {
  if (!icons || icons.length === 0) {
    return null;
  }

  // See if we have an exact match for size and purpose.
  const desiredSize = `${desiredWidth}x${desiredHeight}`;
  const exactMatch = icons.find(
    i =>
      hasPurpose(i, purpose) &&
      hasSize(i, desiredSize) &&
      !isEmbedded(i) &&
      hasMimeType(i, mimeType)
  );
  if (exactMatch) {
    return exactMatch;
  }

  if (!purpose) {
    const withoutPurpose = icons.find(
      i => hasSize(i, desiredSize) && !isEmbedded(i) && hasMimeType(i, mimeType)
    );

    if (withoutPurpose) {
      return withoutPurpose;
    }
  }

  // Find a larger one if we're able.
  const isExpectingSquare = desiredWidth === desiredHeight;
  const matchesSquareRequirement = (i: Icon) =>
    !isExpectingSquare || isSquare(i);
  const largerIcon = icons.find(
    i =>
      hasPurpose(i, purpose) &&
      isLarger(i, desiredWidth, desiredHeight) &&
      !isEmbedded(i) &&
      hasMimeType(i, mimeType) &&
      matchesSquareRequirement(i)
  );
  return largerIcon || null;
}

/**
 * Finds a app icon suitable as a general purpose app icon: idealy, a large, square, PNG icon whose purpose is any.
 * @param icons The icons in which to find a good primary app icon.
 * @returns An icon suitable to use as a general purpose app icon.
 */
export function findBestAppIcon(icons: Icon[] | null | undefined): Icon | null {
  return (
    findSuitableIcon(icons, 'any', 512, 512, 'image/png') ||
    findSuitableIcon(icons, 'maskable', 512, 512, 'image/png') ||
    findSuitableIcon(icons, 'any', 192, 192, 'image/png') ||
    findSuitableIcon(icons, 'maskable', 192, 192, 'image/png') ||
    findSuitableIcon(icons, 'any', 512, 512, 'image/jpeg') ||
    findSuitableIcon(icons, 'maskable', 512, 512, 'image/jpeg') ||
    findSuitableIcon(icons, 'any', 192, 192, 'image/jpeg') ||
    findSuitableIcon(icons, 'maskable', 192, 192, 'image/jpeg') ||
    findSuitableIcon(icons, 'any', 512, 512, undefined) ||
    findSuitableIcon(icons, 'maskable', 512, 512, undefined) ||
    findSuitableIcon(icons, 'any', 192, 192, undefined) ||
    findSuitableIcon(icons, 'maskable', 192, 192, undefined) ||
    findSuitableIcon(icons, 'any', 0, 0, 'image/png') ||
    findSuitableIcon(icons, 'maskable', 0, 0, 'image/png') ||
    findSuitableIcon(icons, 'any', 0, 0, 'image/jpeg') ||
    findSuitableIcon(icons, 'maskable', 0, 0, 'image/jpeg') ||
    findSuitableIcon(icons, 'any', 0, 0, undefined) ||
    findSuitableIcon(icons, 'maskable', 0, 0, undefined)
  );
}

function hasPurpose(icon: Icon, purpose: string | null | undefined): boolean {
  if (!purpose) {
    return true;
  }

  return (icon.purpose || 'any').split(' ').some(p => p === purpose);
}

function hasSize(icon: Icon, size: string): boolean {
  return (icon.sizes || '0x0').split(' ').some(s => s === size);
}

function isEmbedded(icon: Icon): boolean {
  return icon.src.includes('data:image');
}

function hasMimeType(icon: Icon, mimeType: string | null | undefined): boolean {
  if (mimeType === undefined) {
    return true;
  }

  return (
    icon.type === mimeType ||
    (!icon.type && mimeType === 'image/png' && icon.src?.endsWith('.png')) || // best guess when the manifest doesn't specify the type of image
    (!icon.type && mimeType === 'image/jpeg' && icon.src?.endsWith('.jpg'))
  ); // best guess when the manifest doesn't specify the type of image
}

function getDimensions(icon: Icon): IconDimension[] {
  return (icon.sizes || '0x0').split(' ').map(size => {
    const dimensions = size.split('x');
    return {
      width: Number.parseInt(dimensions[0] || '0'),
      height: Number.parseInt(dimensions[1] || '0'),
    };
  });
}

function isLarger(icon: Icon, width: number, height: number): boolean {
  const dimensions = getDimensions(icon);
  return dimensions.some(i => i.width > width && i.height > height);
}

function isSquare(icon: Icon): boolean {
  const dimensions = getDimensions(icon);
  return dimensions.some(d => d.width === d.height);
}

/**
 * Clones the icon and if the src is a URL-encoded image, swaps out the src with a replacement.
 * @param icon The icon to clone.
 * @param newSrc The new desired src of the resulting clone.
 * @returns A clone of the icon with its src changed.
 */
export function cloneIconWithoutUrlEncodedSrc(icon: Icon, newSrc: string): Icon {
  const clone = { ...icon };
  if (clone.src?.startsWith('data:image')) {
    clone.src = newSrc;
  }
  return clone;
}

/**
 * Guesses the file extension from the icon's mime type.
 * @param icon The icon from whose mime type the file extension will be guessed.
 * @returns A best guess of the file extesion, or empty if no extension could be guessed.
 */
export function getProbableFileExtension(icon: Icon): string {
  if (!icon.type) {
    return '';
  }

  switch (icon.type) {
    case "image/png": return "png";
    case "image/jpeg": return "jpg";
    case "image/jpg": return "jpg";
    case "image/webp": return "webp";
    case "image/gif": return "gif";
    case "image/x-icon": return "ico";
    case "image/tiff": return "tiff";
    case "image/bmp": return "bmp";
    case "image/svg+xml": return "svg";
    default:
      const lastSlashIndex = icon.type.lastIndexOf('/');
      if (lastSlashIndex != -1) {
        return icon.type.substr(lastSlashIndex + 1);
      }

      return '';
  }
}


/**
 * Checks if the icon succesfully loads
 * @param icon The icon to check
 * @returns True if the icon is valid, rejects otherwise
 */
export function canLoadIcon(iconURL: string): Promise<boolean> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.src = iconURL;

    img.onload = () => {
      // there are cases where the image element could get into the onload event
      // but not be actually loaded.
      // As a double check, we check the naturalWidth is greater than 0
      // and if the image.complete property is true.
      if (img.naturalWidth > 0 && img.complete) {
        resolve(true);
      }
      else {
        // invalid icon
        reject(false);
      }
    }

    img.onerror = () => reject(false);
  })
}

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

/**
 * Check if an image succesfully loads.
 * @param icon_url The url to the icon to test.
 * @returns An boolean value based on whether the image loads or nothing if the image never
 * fires the load or error event.
 */
export function checkImageUrl(icon_url: string): boolean | void {
  const image = new Image();

  image.onload = () => {
    return true;
  };
  image.onerror = () => {
    return false;
  };

  image.src = icon_url;
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

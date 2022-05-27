import { ImageResource } from "./models";

interface Size {
  width: number;
  height: number;
}

/**
 * @param color - The background color (to contrast with)
 * @returns A color that will be visible on top of the specified color
 */
export const getContrastingColor = (color: string) => {
  // From the RGB values, compute the perceived lightness using the sRGB Luma method.
  const [r, g, b] = colorToRgba(color);
  const perceived_lightness = ((r * 0.2126) + (g * 0.7152) + (b * 0.0722)) / 255;
  return `hsl(0, 0%, ${(perceived_lightness - 0.5) * - 10000000}%)`;
}

export function isDarkColor(color: string): boolean {
  const [r, g, b] = colorToRgba(color);
  const luma = 0.2126 * r + 0.7152 * g + 0.0722 * b; // per ITU-R BT.709
  return luma <= 128;
}

export function getSuitableIcon(icons: ImageResource[]): ImageResource | undefined {
  // Do we have a 512x512 PNG image of any purpose? Use that.
  const idealIcon = icons.find(i =>
    (i.purpose || 'any') === 'any' &&
    isPngImage(i) &&
    isSquareImage(i) &&
    imageHasDimensions(i, 512, 512));
  if (idealIcon) {
    return idealIcon;
  }

  // No ideal icon. Order them by largest.
  const iconsLargestToSmallest = [...icons]
    .sort((a, b) => iconSizeSort(a, b))
    .reverse();
  const squareIconsLargestToSmallest = iconsLargestToSmallest
    .filter(i => isSquareImage(i));

  // Do we have a square, general purpose PNG 128x128 or larger? Use that.
  const squarePngAny = squareIconsLargestToSmallest
    .find(i => isAnyPurpose(i) && isPngImage(i) && imageIsAtLeast(i, 128, 128));
  if (squarePngAny) {
    return squarePngAny;
  }

  // Square general purpose JPG 128x128 or larger?
  const squareJpgAny = squareIconsLargestToSmallest
    .find(i => isAnyPurpose(i) && isJpgImage(i) && imageIsAtLeast(i, 128, 128));
  if (squareJpgAny) {
    return squareJpgAny;
  }

  // Square maskable PNG
  const squareMaskablePng = squareIconsLargestToSmallest
    .find(i => i.purpose === 'maskable' && isPngImage(i) && imageIsAtLeast(i, 128, 128));
  if (squareMaskablePng) {
    return squareMaskablePng;
  }

  // Square maskable JPG
  const squareMaskableJpg = squareIconsLargestToSmallest
    .find(i => i.purpose === 'maskable' && isJpgImage(i) && imageIsAtLeast(i, 128, 128));
  if (squareMaskableJpg) {
    return squareMaskableJpg;
  }

  // Any square icon?
  const squareIcon = squareIconsLargestToSmallest[0];
  if (squareIcon) {
    return squareIcon;
  }

  // Grab the largest icon.
  return iconsLargestToSmallest[0];
}

function isAnyPurpose(icon: ImageResource): boolean {
  return !icon.purpose || icon.purpose === "any";
}

function isSquareImage(icon: ImageResource): boolean {
  return getIconSizes(icon).some(s => s.height === s.width);
}

function isPngImage(icon: ImageResource): boolean {
  return icon.type === "image/png" || (!icon.type && icon.src?.endsWith(".png"));
}

function isJpgImage(icon: ImageResource): boolean {
  return icon.type === "image/jpeg" || icon.type === "image/jpg" || (!icon.type && icon.src?.endsWith(".jpg"));
}

function imageHasDimensions(icon: ImageResource, width: number, height: number): boolean {
  return getIconSizes(icon)
    .some(s => s.width === width && s.height === height);
}

function imageIsAtLeast(icon: ImageResource, width: number, height: number): boolean {
  const largestSize = getLargestIconSize(icon);
  return !!largestSize && largestSize.width >= width && largestSize.height >= height;
}

function getLargestIconSize(icon: ImageResource): Size | undefined {
  const sizes = getIconSizes(icon);
  if (sizes.length === 0) {
    return undefined;
  }

  const smallestToLargest = sizes
    .sort((a, b) => sizeSort(a, b));
  return smallestToLargest[smallestToLargest.length - 1];
}

function sizeSort(a: Size | null, b: Size | null): number {
  if (!a && !b) {
    return 0;
  }
  if (!a) {
    return -1;
  }
  if (!b) {
    return 1;
  }
  const aTotal = a.width + a.height;
  const bTotal = b.width + b.height;
  return aTotal > bTotal ? 1 : aTotal < bTotal ? -1 : 0;
}

function iconSizeSort(a: ImageResource, b: ImageResource) {
  const aLargestSize = getLargestIconSize(a);
  const bLargestSize = getLargestIconSize(b);
  return sizeSort(aLargestSize!, bLargestSize!);
}

function getIconSizes(icon: ImageResource): Size[] {
  const getDimensionFromSize = (size: string) => {
    const dimensions = size.split('x');
    return {
      width: Number.parseInt(dimensions[0] || '0', 16),
      height: Number.parseInt(dimensions[1] || '0', 16),
    };
  };

  return (icon.sizes || '')
    .split(' ') // separate the sizes
    .map(size => getDimensionFromSize(size));
}

// converts a color string in RGB, RGBA, hex, or named color format
// into an array containing the RGBA values of the color.
function colorToRgba(color: string): [number, number, number, number?] {
  if (!color) {
    return [0, 0, 0];
  }

  return hexToRgb(color) ||
    rgbStringToRgb(color) ||
    namedColorToRgb(color) ||
    [0, 0, 0];
}

function rgbStringToRgb(color: string): [number, number, number, number?] | null {
  // If we're already RGB, we're golden.
  var rgbMatch = color.match(/rgba?\((\d{1,3}), ?(\d{1,3}), ?(\d{1,3})\)?(?:, ?(\d(?:\.\d?))\))?/);
  if (rgbMatch && rgbMatch.length >= 4) {
    return [
      parseInt(rgbMatch[1]!, 16),
      parseInt(rgbMatch[2]!, 16),
      parseInt(rgbMatch[3]!, 16),
      rgbMatch[4] ? parseInt(rgbMatch[4], 16) : undefined
    ];
  }

  return null;
}

function hexToRgb(color: string): [number, number, number, number?] | null {
  // Expand shorthand form (e.g. "03F") to full form (e.g. "0033FF")
  const shorthandHexMatch = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
  color = color.replace(shorthandHexMatch, (_, r, g, b) => r + r + g + g + b + b);

  const hexMatch = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(color);
  if (hexMatch) {
    return [
      parseInt(hexMatch[1]!, 16),
      parseInt(hexMatch[2]!, 16),
      parseInt(hexMatch[3]!, 16),
      hexMatch[4] ? parseInt(hexMatch[4], 16) : undefined
    ];
  }

  return null;
}

function namedColorToRgb(color: string): [number, number, number, number?] | null {
  const canvas = document.createElement('canvas');
  canvas.width = 1;
  canvas.height = 1;
  const context = canvas.getContext('2d')!;
  context.fillStyle = color;
  context.fillRect(0, 0, 1, 1);
  const [red, green, blue, alpha] = context.getImageData(0, 0, 1, 1).data;
  return [
    red!,
    green!,
    blue!,
    alpha
  ];
}

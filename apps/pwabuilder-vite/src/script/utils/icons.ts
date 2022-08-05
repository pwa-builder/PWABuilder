import { env } from './environment';
import { Icon } from './interfaces';

type IconDimension = {
  width: number;
  height: number
}

type ImageFormat = {
  exts: [string, string?];
  mime: string;
}

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
  purpose: 'any' | 'maskable' | 'monochrome' | null,
  desiredWidth: number,
  desiredHeight: number,
  mimeType: string | undefined
): Icon | null {
  if (!icons || icons.length === 0) {
    return null;
  }

  const iconInfos = isIconInfos(icons) ? icons : icons.map(i => new IconInfo(i));
  const exactMatch = iconInfos.find(i => i.isExactMatch(purpose, desiredWidth, desiredHeight, mimeType));
  if (exactMatch) {
    return exactMatch.getIcon();
  }

  var largerMatch = iconInfos.find(i => i.isSuitableIcon(purpose, desiredWidth, desiredHeight, mimeType));
  return largerMatch?.getIcon() || null;
}

/**
 * Finds a app icon suitable as a general purpose app icon: idealy, a large, square, PNG icon whose purpose is any.
 * @param icons The icons in which to find a good primary app icon.
 * @returns An icon suitable to use as a general purpose app icon.
 */
export function findBestAppIcon(icons: Icon[] | null | undefined): Icon | null {
  const iconInfos = (icons || []).map(i => new IconInfo(i));
  return findSuitableIcon(iconInfos, 'any', 512, 512, 'image/png') ||
    findSuitableIcon(iconInfos, 'maskable', 512, 512, 'image/png') ||
    findSuitableIcon(iconInfos, 'any', 192, 192, 'image/png') ||
    findSuitableIcon(iconInfos, 'maskable', 192, 192, 'image/png') ||
    findSuitableIcon(iconInfos, 'any', 512, 512, 'image/jpeg') ||
    findSuitableIcon(iconInfos, 'maskable', 512, 512, 'image/jpeg') ||
    findSuitableIcon(iconInfos, 'any', 192, 192, 'image/jpeg') ||
    findSuitableIcon(iconInfos, 'maskable', 192, 192, 'image/jpeg') ||
    findSuitableIcon(iconInfos, 'any', 512, 512, undefined) ||
    findSuitableIcon(iconInfos, 'maskable', 512, 512, undefined) ||
    findSuitableIcon(iconInfos, 'any', 192, 192, undefined) ||
    findSuitableIcon(iconInfos, 'maskable', 192, 192, undefined) ||
    findSuitableIcon(iconInfos, 'any', 0, 0, 'image/png') ||
    findSuitableIcon(iconInfos, 'maskable', 0, 0, 'image/png') ||
    findSuitableIcon(iconInfos, 'any', 0, 0, 'image/jpeg') ||
    findSuitableIcon(iconInfos, 'maskable', 0, 0, 'image/jpeg') ||
    findSuitableIcon(iconInfos, 'any', 0, 0, undefined) ||
    findSuitableIcon(iconInfos, 'maskable', 0, 0, undefined);
}

function isIconInfos(icons: Icon[] | IconInfo[]): icons is IconInfo[] {
  const firstIcon = icons[0];
  if (firstIcon instanceof IconInfo) {
    return true;
  }

  return false;
}

/**
 * Wraps a manifest icon and provides information about it.
 */
export class IconInfo {

  static readonly pngFormat: ImageFormat = { exts: ['png'], mime: 'image/png' };
  static readonly jpgFormat: ImageFormat = { exts: ['jpg', 'jpeg'], mime: 'image/jpeg' };
  static readonly formats: ImageFormat[] = [
    IconInfo.pngFormat,
    IconInfo.jpgFormat,
    { exts: ['webp'], mime: 'image/webp' },
    { exts: ['gif'], mime: 'image/gif' },
    { exts: ['ico'], mime: 'image/x-icon' },
    { exts: ['tiff'], mime: 'image/tiff' },
    { exts: ['bmp'], mime: 'image/bmp' },
    { exts: ['svg'], mime: 'image/svg+xml' },
  ]

  constructor(private readonly icon: Icon) {
  }

  getProbableFileExtension(): string | null {
    if (!this.icon.type) {
      // No mime type? See if we can guess it from the src.
      return this.getFileExtensionFromSrc();
    }

    const format = this.getFormat();
    if (format) {
      return format.exts[0];
    }

    // Couldn't find a matching format? See if we can guess it from the last half of the mime type.
    const lastSlashIndex = this.icon.type.lastIndexOf('/');
    if (lastSlashIndex != -1) {
      return this.icon.type.substring(lastSlashIndex + 1);
    }

    return null;
  }

  isAtLeast(width: number, height: number): boolean {
    const dimensions = this.getDimensions();
    return dimensions.some(i => i.width >= width && i.height >= height);
  }

  get isPng(): boolean {
    return this.getMimeTypeOrGuessFromSrc() === IconInfo.pngFormat.mime;
  }

  get isJpg(): boolean {
    return this.getMimeTypeOrGuessFromSrc() === IconInfo.jpgFormat.mime;
  }

  get isSquare(): boolean {
    const dimensions = this.getDimensions();
    return dimensions.some(d => d.width === d.height);
  }

  get isEmbedded(): boolean {
    return this.icon.src.includes('data:image');
  }

  hasPurpose(purpose: string | null | undefined): boolean {
    if (!purpose) {
      return true;
    }

    return (this.icon.purpose || 'any')
      .split(' ')
      .some(p => p.toLowerCase() === purpose.toLowerCase());
  }

  hasSize(size: `${number}x${number}`): boolean {
    return (this.icon.sizes || '0x0')
      .split(' ')
      .some(s => s === size);
  }

  /**
   * Creates a clone of the this and if the src is a URL-encoded image, swaps out the src with a replacement.
   * @param icon The icon to clone.
   * @param newSrc The new desired src of the resulting clone.
   * @returns A clone of the icon with its src changed.
   */
  createIconWithoutUrlEncodedSrc(newSrc: string): Icon {
    const clone = { ...this.icon };
    if (clone.src?.startsWith('data:image')) {
      clone.src = newSrc;
    }
    return clone;
  }

  getIcon(): Icon {
    return this.icon;
  }

  getDimensions(): IconDimension[] {
    return (this.icon.sizes || '0x0')
      .split(' ')
      .map(size => {
        const dimensions = size.split('x');
        return {
          width: Number.parseInt(dimensions[0] || '0', 10),
          height: Number.parseInt(dimensions[1] || '0', 10),
        };
      });
  }

  hasMimeType(mimeType?: string | null): boolean {
    if (!mimeType) {
      return true;
    }

    return this.getMimeTypeOrGuessFromSrc() === mimeType.toLowerCase();
  }

  isExactMatch(
    purpose: 'any' | 'maskable' | 'monochrome' | null,
    desiredWidth: number,
    desiredHeight: number,
    mimeType: string | undefined): boolean {

    // See if we're an exact match.
    const desiredSize: `${number}x${number}` = `${desiredWidth}x${desiredHeight}`;
    return this.hasPurpose(purpose) &&
      this.hasSize(desiredSize) &&
      !this.isEmbedded &&
      this.hasMimeType(mimeType);
  }

  /**
   * Checks if this icon is suitable: matches the specified purpose,
   * is the desired dimensions or larger,
   * and has the desired mime type.
   * @param purpose 
   * @param desiredWidth 
   * @param desiredHeight 
   * @param mimeType 
   */
  isSuitableIcon(
    purpose: 'any' | 'maskable' | 'monochrome' | null,
    desiredWidth: number,
    desiredHeight: number,
    mimeType: string | undefined) {

    const exactMatch = this.isExactMatch(purpose, desiredWidth, desiredHeight, mimeType);
    if (exactMatch) {
      return true;
    }

    // See if everything matches but purpose is left empty.
    if (!purpose) {
      const withoutPurpose = this.isExactMatch(null, desiredWidth, desiredHeight, mimeType);
      if (withoutPurpose) {
        return true;
      }
    }

    // Find a larger one if we're able.
    const isExpectingSquare = desiredWidth === desiredHeight;
    const matchesSquareRequirement = !isExpectingSquare || this.isSquare;
    const largerIcon =
      this.hasPurpose(purpose) &&
      this.isAtLeast(desiredWidth, desiredHeight) &&
      !this.isEmbedded &&
      this.hasMimeType(mimeType) &&
      matchesSquareRequirement;
    return !!largerIcon;
  }

  /**
   * Attempts to load the icon and returns whether it loaded successfully.
   * @param manifestUrl The manifest URL from which to resolve the icon's URL.
   * @returns A promise that results in true if the image loaded successfully, false if it didn't.
   */
  async resolvesSuccessfully(manifestUrl: string): Promise<boolean> {
    if (!this.icon.src) {
      return Promise.resolve(false);
    }

    return new Promise(resolve => {
      const imageEl = new Image();
      const imgUrl = new URL(
        this.icon.src,
        manifestUrl
      );
      imageEl.src = `${env.safeUrlFetcher}?checkExistsOnly=false&url=${encodeURIComponent(imgUrl.toString())}`;
      imageEl.onload = () => {
        if (imageEl.complete && imageEl.naturalHeight > 0) {
          resolve(true);
        } else {
          resolve(false);
        }
      };
      imageEl.onerror = () => {
        resolve(false);
      };
    });
  }

  private getFileExtensionFromSrc(): string | null {
    const format = this.getFormat();
    return format?.exts[0] || null;
  }

  private getFormat(): ImageFormat | null {
    const formatByMimeType = IconInfo.formats.find(f => f.mime === this.icon.type);
    if (formatByMimeType) {
      return formatByMimeType;
    }

    // Couldn't find it by mime type. See if we can guess it by looking at src.
    const srcLower = this.icon.src?.toLowerCase() || '';
    const guessedFormat = IconInfo.formats
      .find(f => f.exts.some(ext => srcLower.endsWith(`.${ext}`)));
    return guessedFormat ?? null;
  }

  private getMimeTypeOrGuessFromSrc(): string | null {
    if (this.icon.type) {
      return this.icon.type;
    }

    const guessFormat = this.getFormat();
    return guessFormat?.mime || null;
  }
}
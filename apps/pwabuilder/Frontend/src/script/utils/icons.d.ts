import { Icon } from './interfaces';
type IconDimension = {
    width: number;
    height: number;
};
type ImageFormat = {
    exts: [string, string?];
    mime: string;
};
/**
 * Finds an icon matching the specified purpose, dimensions, and mime type.
 * If no exact match can be found, it will consider icons larger than the specified dimensions.
 * @param icons The icons to search.
 * @param purpose The desired purpose of the icon, e.g. 'any', 'maskable', etc, or null to ignore purpose.
 * @param mimeType Should be an image mime type, e.g. 'image/png', or null or empty to ignore format.
 * @param desiredHeight The desired height of a match.
 * @param desiredWidth The desired width of a match.
 */
export declare function findSuitableIcon(icons: Icon[] | IconInfo[] | null | undefined, purpose: 'any' | 'maskable' | 'monochrome' | null, desiredWidth: number, desiredHeight: number, mimeType: string | undefined): Icon | null;
/**
 * Finds a app icon suitable as a general purpose app icon: ideally, a large, square, PNG icon whose purpose is any.
 * @param icons The icons in which to find a good primary app icon.
 * @returns An icon suitable to use as a general purpose app icon.
 */
export declare function findBestAppIcon(icons: Icon[] | null | undefined): Icon | null;
/**
 * Wraps a manifest icon and provides information about it.
 */
export declare class IconInfo {
    private readonly icon;
    static readonly pngFormat: ImageFormat;
    static readonly jpgFormat: ImageFormat;
    static readonly formats: ImageFormat[];
    constructor(icon: Icon);
    getProbableFileExtension(): string | null;
    isAtLeast(width: number, height: number): boolean;
    get isPng(): boolean;
    get isJpg(): boolean;
    get isSquare(): boolean;
    get isEmbedded(): boolean;
    hasPurpose(purpose: string | null | undefined): boolean;
    hasSize(size: `${number}x${number}`): boolean;
    /**
     * Creates a clone of the this and if the src is a URL-encoded image, swaps out the src with a replacement.
     * @param icon The icon to clone.
     * @param newSrc The new desired src of the resulting clone.
     * @returns A clone of the icon with its src changed.
     */
    createIconWithoutUrlEncodedSrc(newSrc: string): Icon;
    getIcon(): Icon;
    getDimensions(): IconDimension[];
    hasMimeType(mimeType?: string | null): boolean;
    isExactMatch(purpose: 'any' | 'maskable' | 'monochrome' | null, desiredWidth: number, desiredHeight: number, mimeType: string | undefined): boolean;
    /**
     * Checks if this icon is suitable: matches the specified purpose,
     * is the desired dimensions or larger,
     * and has the desired mime type.
     * @param purpose
     * @param desiredWidth
     * @param desiredHeight
     * @param mimeType
     */
    isSuitableIcon(purpose: 'any' | 'maskable' | 'monochrome' | null, desiredWidth: number, desiredHeight: number, mimeType: string | undefined): boolean;
    /**
     * Attempts to load the icon and returns whether it loaded successfully.
     * @param manifestUrl The manifest URL from which to resolve the icon's URL.
     * @returns A promise that results in true if the image loaded successfully, false if it didn't.
     */
    resolvesSuccessfully(manifestUrl: string): Promise<boolean>;
    private getFileExtensionFromSrc;
    private getMimeTypeByExtension;
    private getFormat;
    private getMimeTypeOrGuessFromSrc;
    private validateSameMimeTypeAndExtension;
}
export {};

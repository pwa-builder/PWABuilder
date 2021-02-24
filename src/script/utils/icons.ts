import { Icon } from "./interfaces";

/**
   * Finds an icon matching the specified purpose and desired dimensions.
   * @param mimeType Should be an image mime type, e.g. "image/png", or null or empty to ignore format.
   */
  export function findSuitableIcon(
    icons: Icon[] | undefined,
    purpose: "any" | "maskable" | "monochrome",
    desiredWidth: number,
    desiredHeight: number,
    mimeType: string | undefined
  ): Icon | undefined {
    if (!icons || icons.length === 0) {
      return undefined;
    }

    const desiredSize = `${desiredWidth}x${desiredHeight}`;
    const iconHasPurpose = (i: Icon) =>
      (i.purpose || "any").split(" ").some((p) => p === purpose);
    const iconHasSize = (i: Icon) =>
      (i.sizes || "0x0").split(" ").some((size) => size === desiredSize);
    const iconIsEmbedded = (i: Icon) => i.src.includes("data:image");
    const iconHasMimeType = (i: Icon) =>
     i.type === mimeType ||
     (!i.type && mimeType === "image/png" && i.src && i.src.endsWith(".png")) || // best guess when the manifest doesn't specify the type of image
     (!i.type && mimeType === "image/jpeg" && i.src && i.src.endsWith(".jpg")); // best guess when the manifest doesn't specify the type of image

    // See if we have an exact match for size and purpose.
    const exactMatch = icons.find(
      (i) => iconHasPurpose(i) && iconHasSize(i) && !iconIsEmbedded(i) && iconHasMimeType(i)
    );
    if (exactMatch) {
      return exactMatch;
    }

    // Find a larger one if we're able.
    type IconDimension = { width: number; height: number };
    const getIconDimensions: (icon: Icon) => IconDimension[] = i =>
      (i.sizes || "0x0").split(" ").map((size) => {
        const dimensions = size.split("x");
        return {
          width: Number.parseInt(dimensions[0] || "0"),
          height: Number.parseInt(dimensions[1] || "0"),
        };
      });
    const iconIsLarger = (i: Icon) =>
      getIconDimensions(i).some(
        (dimensions) =>
          dimensions.width >= desiredWidth &&
          dimensions.height >= desiredHeight
      );
    const isExpectingSquare = desiredWidth === desiredHeight;
    const isSquare = (i: Icon) => getIconDimensions(i).some(d => d.width === d.height);
    const matchesSquareRequirement = (i: Icon) => !isExpectingSquare || isSquare(i);
    const largerIcon = icons.find(
      (i) => iconHasPurpose(i) && iconIsLarger(i) && !iconIsEmbedded(i) && iconHasMimeType(i) && matchesSquareRequirement(i)
    );
    return largerIcon || undefined;
  }
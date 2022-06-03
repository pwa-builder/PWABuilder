export function isStandardOrientation(orientation: string): boolean {
    const standardOrientations = [
      "any",
      "natural",
      "landscape",
      "landscape-primary",
      "landscape-secondary",
      "portrait",
      "portrait-primary",
      "portrait-secondary",
    ];
    return standardOrientations.includes(orientation);
  }
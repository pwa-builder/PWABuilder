/**
 * @param color - The background color (to contrast with)
 * @returns A color that will be visible on top of the specified color
 */
export const getContrastingColor = (color: string) => {
  const canvas = document.createElement('canvas');
  canvas.width = 1;
  canvas.height = 1;
  const context = canvas.getContext('2d')!;
  context.fillStyle = color;
  context.fillRect(0, 0, 1, 1);
  const [red, green, blue] = context.getImageData(0, 0, 1, 1).data;
  // From the RGB values, compute the perceived lightness using the sRGB Luma method.
  const perceived_lightness = ((red! * 0.2126) + (green! * 0.7152) + (blue! * 0.0722)) / 255;
  return `hsl(0, 0%, ${(perceived_lightness - 0.5) * - 10000000}%)`;
}
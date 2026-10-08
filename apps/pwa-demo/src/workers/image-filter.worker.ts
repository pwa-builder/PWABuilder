/// <reference lib="webworker" />
// Applies photo filters on a background thread using an OffscreenCanvas, so the
// UI never janks while pixels are crunched.

export type FilterName =
  | 'none'
  | 'grayscale'
  | 'sepia'
  | 'invert'
  | 'threshold'
  | 'vintage';

interface Request {
  id: number;
  bitmap: ImageBitmap;
  filter: FilterName;
}

function applyFilter(data: Uint8ClampedArray, filter: FilterName): void {
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    switch (filter) {
      case 'grayscale': {
        const y = 0.299 * r + 0.587 * g + 0.114 * b;
        data[i] = data[i + 1] = data[i + 2] = y;
        break;
      }
      case 'sepia': {
        data[i] = Math.min(255, 0.393 * r + 0.769 * g + 0.189 * b);
        data[i + 1] = Math.min(255, 0.349 * r + 0.686 * g + 0.168 * b);
        data[i + 2] = Math.min(255, 0.272 * r + 0.534 * g + 0.131 * b);
        break;
      }
      case 'invert': {
        data[i] = 255 - r;
        data[i + 1] = 255 - g;
        data[i + 2] = 255 - b;
        break;
      }
      case 'threshold': {
        const y = 0.299 * r + 0.587 * g + 0.114 * b;
        const v = y > 128 ? 255 : 0;
        data[i] = data[i + 1] = data[i + 2] = v;
        break;
      }
      case 'vintage': {
        data[i] = Math.min(255, r * 1.1 + 20);
        data[i + 1] = Math.min(255, g * 1.05);
        data[i + 2] = Math.min(255, b * 0.85);
        break;
      }
      case 'none':
      default:
        break;
    }
  }
}

self.addEventListener('message', async (event: MessageEvent<Request>) => {
  const { id, bitmap, filter } = event.data;
  const canvas = new OffscreenCanvas(bitmap.width, bitmap.height);
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    (self as unknown as Worker).postMessage({ id, error: 'no-2d-context' });
    return;
  }
  ctx.drawImage(bitmap, 0, 0);
  bitmap.close();
  const image = ctx.getImageData(0, 0, canvas.width, canvas.height);
  applyFilter(image.data, filter);
  ctx.putImageData(image, 0, 0);
  const blob = await canvas.convertToBlob({ type: 'image/png' });
  (self as unknown as Worker).postMessage({ id, blob });
});

// Generates all raster PNG assets (icons + screenshots) from SVG sources using
// sharp. Run with: npm run icons
//
// Keeping this as a committed script means the branded assets are reproducible
// and nobody has to hand-edit binary PNGs.
import sharp from 'sharp';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const iconsDir = join(root, 'public', 'assets', 'icons');
const shotsDir = join(root, 'public', 'assets', 'screenshots');

const iconSvg = await readFile(join(iconsDir, 'icon.svg'));

/** Rasterize the icon SVG at a given square size. */
async function icon(size, name) {
  await sharp(iconSvg, { density: 384 })
    .resize(size, size, { fit: 'cover' })
    .png()
    .toFile(join(iconsDir, name));
  console.log('icon', name, `${size}x${size}`);
}

const iconSizes = [
  [512, 'icon_512.png'],
  [192, 'icon_192.png'],
  [180, 'apple-touch-icon.png'],
  [48, 'icon_48.png'],
  [24, 'icon_24.png'],
  // Maskable variants reuse the full-bleed art (safe-zone respected in the SVG).
  [512, 'maskable_512.png'],
  [192, 'maskable_192.png'],
];

for (const [size, name] of iconSizes) {
  await icon(size, name);
}

/** Build a branded screenshot SVG for the manifest. */
function screenshotSvg(width, height, wide) {
  const title = 'Nimbus';
  const subtitle = 'Your offline-first notebook';
  const chips = ['Write', 'Sketch', 'Photos', 'Dictate', 'Offline'];
  const chipGap = 14;
  let chipY = wide ? height - 180 : height - 280;
  let x = 60;
  const chipEls = chips
    .map((c) => {
      const w = 46 + c.length * 18;
      const el = `
        <g transform="translate(${x} ${chipY})">
          <rect rx="26" ry="26" width="${w}" height="52" fill="#ffffff" opacity="0.16"/>
          <text x="${w / 2}" y="34" font-family="Segoe UI, sans-serif" font-size="24"
            fill="#f8fafc" text-anchor="middle">${c}</text>
        </g>`;
      x += w + chipGap;
      if (x > width - 240) {
        x = 60;
        chipY += 66;
      }
      return el;
    })
    .join('');

  return Buffer.from(`
    <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
      <defs>
        <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stop-color="#1e3a8a"/>
          <stop offset="0.5" stop-color="#0ea5e9"/>
          <stop offset="1" stop-color="#22d3ee"/>
        </linearGradient>
      </defs>
      <rect width="${width}" height="${height}" fill="url(#g)"/>
      <circle cx="${width * 0.85}" cy="${height * 0.15}" r="${height * 0.35}" fill="#ffffff" opacity="0.08"/>
      <circle cx="${width * 0.1}" cy="${height * 0.9}" r="${height * 0.3}" fill="#ffffff" opacity="0.07"/>
      <text x="60" y="${wide ? 180 : 220}" font-family="Segoe UI, sans-serif" font-size="${wide ? 96 : 88}"
        font-weight="700" fill="#ffffff">${title}</text>
      <text x="62" y="${wide ? 250 : 300}" font-family="Segoe UI, sans-serif" font-size="${wide ? 40 : 38}"
        fill="#e0f2fe">${subtitle}</text>
      ${chipEls}
    </svg>`);
}

async function screenshot(width, height, name, wide) {
  await sharp(screenshotSvg(width, height, wide)).png().toFile(join(shotsDir, name));
  console.log('screenshot', name, `${width}x${height}`);
}

await mkdir(shotsDir, { recursive: true });
await screenshot(1280, 720, 'wide.png', true);
await screenshot(720, 1280, 'narrow.png', false);

// A tiny favicon.ico-friendly png already exists as icon_24; also write favicon.
await writeFile(join(root, 'public', 'favicon.svg'), iconSvg);
console.log('done');

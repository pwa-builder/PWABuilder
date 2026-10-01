// Copies just the Font Awesome Free SVGs the app uses into public/assets/fa so
// icons are self-hosted and work fully offline (no Font Awesome Kit CDN, which
// 403s on Pro-only weights). Web Awesome is pointed here via a custom default
// icon library registered in app-index.ts (registerIconLibrary).
import { mkdir, copyFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = dirname(fileURLToPath(import.meta.url));
const faSvgs = join(root, '..', 'node_modules', '@fortawesome', 'fontawesome-free', 'svgs');
const outDir = join(root, '..', 'public', 'assets', 'fa');

// Icons rendered with the default (classic/solid) family.
const solid = [
  'address-book', 'arrow-right', 'battery-three-quarters', 'bell', 'bolt',
  'camera', 'camera-rotate', 'circle-dot', 'circle-info', 'clipboard',
  'compact-disc', 'compass', 'database', 'download', 'eraser', 'expand',
  'file-export', 'file-import', 'floppy-disk', 'font', 'gamepad', 'gauge-high',
  'globe', 'house', 'lightbulb', 'list-check', 'location-dot', 'microchip',
  'microphone', 'mobile-screen', 'note-sticky', 'paintbrush', 'pen-nib', 'plus',
  'rocket', 'rotate', 'share-nodes', 'stop', 'trash', 'trash-can', 'user-clock',
  'volume-high', 'wave-square', 'wifi', 'link-slash', 'xmark',
];

// Icons rendered with family="brands".
const brands = ['bluetooth', 'github'];

async function copyFolder(family, names) {
  const dest = join(outDir, family);
  await mkdir(dest, { recursive: true });
  const missing = [];
  let copied = 0;
  for (const name of names) {
    const src = join(faSvgs, family, `${name}.svg`);
    if (existsSync(src)) {
      await copyFile(src, join(dest, `${name}.svg`));
      copied++;
    } else {
      missing.push(name);
    }
  }
  return { copied, missing };
}

const solidResult = await copyFolder('solid', solid);
const brandsResult = await copyFolder('brands', brands);
const missing = [
  ...solidResult.missing.map((n) => `solid/${n}`),
  ...brandsResult.missing.map((n) => `brands/${n}`),
];
console.log(`Copied ${solidResult.copied} solid + ${brandsResult.copied} brands icons.`);
if (missing.length) {
  console.error(`MISSING (${missing.length}): ${missing.join(', ')}`);
  process.exit(1);
}

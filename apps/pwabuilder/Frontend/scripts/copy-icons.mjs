// Copies Bootstrap Icons SVGs into the public assets folder so <wa-icon> can
// resolve them at runtime (preserving the icon set shipped by default).
import { existsSync, mkdirSync, cpSync, rmSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const src = resolve(root, 'node_modules/bootstrap-icons/icons');
const dest = resolve(root, 'public/assets/bootstrap-icons');

if (!existsSync(src)) {
  console.error(`bootstrap-icons not found at ${src}. Run npm install first.`);
  process.exit(1);
}

rmSync(dest, { recursive: true, force: true });
mkdirSync(dirname(dest), { recursive: true });
cpSync(src, dest, { recursive: true });
console.info(`Copied Bootstrap Icons to ${dest}`);

import { api } from '../utils/api';
import { download } from '../utils/download';
import { Icon } from '../utils/interfaces';
import { fetchOrCreateManifest, updateManifest } from './manifest';

type Platform =
  | 'windows10'
  | 'windows'
  | 'msteams'
  | 'android'
  | 'chrome'
  | 'firefox';

type ColorHex = string;

interface MissingImagesConfig {
  file: File;
}

interface IconGeneratorConfig {
  fileName: File;
  padding: number;
  colorOption: 'transparent' | 'choose';
  color?: ColorHex;
  colorChanged?: '1' | undefined;
  platform: Array<Platform>;
}

const base64ImageGeneratorUrl =
  'https://appimagegenerator-prod.azurewebsites.net/api/image/base64';

export async function  generateMissingImagesBase64(
  config: MissingImagesConfig
): Promise<Array<Icon> | undefined> {
  try {
    const form = new FormData();
    form.append('baseImage', config.file);
    form.append('padding', '0');
    //form.append('color', '#0000000');
    form.append('colorChanged', 'false');
    form.append('platform', 'windows10');
    form.append('platform', 'android');
    form.append('platform', 'ios');

    const response = await fetch(base64ImageGeneratorUrl, {
      method: 'POST',
      body: form,
    });

    if (response.ok) {
      const manifestContext = await fetchOrCreateManifest();
      const manifest = manifestContext.manifest;

      if (!manifest) {
        console.error('Manifest was unexpectedly null or undefined');
        return;
      }

      let icons = manifest.icons ?? [];
      icons = icons.concat((await response.json()) as unknown as Array<Icon>);

      try {
        const resolvedIcons = await Promise.all(icons.map(icon => fetch(icon.src)));
        const iconBlobs = await Promise.all(resolvedIcons.map(resolvedIcon => resolvedIcon.blob()));
        const iconBlobUrls = iconBlobs.map(blob => URL.createObjectURL(blob));

        icons.forEach((icon, index) => {
          icon.src = icon.src.includes('data:image') && iconBlobUrls[index] || icon.src;
        });
      } catch(e) {
        console.log(e)
      }

      updateManifest({
        icons,
      });

      return icons;
    } else {
      return;
    }
  } catch (e) {
    console.error(e);
    return;
  }
}

export const iconGeneratorDefaults: Partial<IconGeneratorConfig> = {
  padding: 0.3,
  colorOption: 'transparent',
  platform: ['windows', 'windows10', 'android', 'chrome', 'firefox'],
};

async function fetchIcons(id: string) {
  try {
    return fetch(api.imageGenerator.download(id), {
      method: 'GET',
      cache: 'no-cache',
      headers: new Headers({
        'Content-Type': 'application/json',
      }),
    });
  } catch (e) {
    console.error(e);
  }

  return undefined;
}

export async function downloadZip(id: string) {
  try {
    const generatedIcons = await fetchIcons(id);

    if (generatedIcons) {
      download({
        id: 'generated icons zip',
        fileName: 'icons.zip',
        blob: await generatedIcons.blob(),
      });
    }
  } catch (e) {
    console.error(e);
  }
}

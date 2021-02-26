import jszip from 'jszip';
import { api } from '../utils/api';
import { download } from '../utils/download';
import { Icon } from '../utils/interfaces';
import { updateManifest } from './manifest';

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

interface IconGeneratorResponse {
  Uri: string;
}

// Only has src and sizes
interface GeneratedImageIcons {
  icons: Array<Partial<Icon>>;
}

export const iconGeneratorDefaults: Partial<IconGeneratorConfig> = {
  padding: 0.3,
  colorOption: 'transparent',
  platform: ['windows', 'windows10', 'android', 'chrome', 'firefox'],
};

export async function generateMissingImages(config: MissingImagesConfig) {
  try {
    const generateIconsResult = await generateIcons({
      fileName: config.file,
      padding: 0,
      platform: [],
      colorOption: 'transparent',
    });

    if (generateIconsResult) {
      await updateManifestWithGeneratedIcons(generateIconsResult.Uri);
    }
  } catch (e) {
    console.error(e);
  }

  return undefined;
}

export async function generateIcons(config: IconGeneratorConfig) {
  try {
    console.assert(
      config.fileName,
      'generateIcons()  requires a file to generate icons with'
    );
    if (!config.fileName) {
      const err = new Error('requires an icon');
      err.name = 'NoFileError';

      throw err;
    }

    const request = await fetch(api.imageGenerator.post, {
      method: 'POST',
      mode: 'no-cors',
      cache: 'no-cache',
      headers: new Headers({
        'Content-Type': 'multipart/form-data',
      }),
      body: createForm(config),
    });

    return (await request.json()) as IconGeneratorResponse;
  } catch (e) {
    if (e.name === 'NoFileError') {
      console.error('This API requires a file', e);
    }
  }

  return undefined;
}

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

export async function updateManifestWithGeneratedIcons(id: string) {
  try {
    const generatedIcons = await fetchIcons(id);
    const blob = await generatedIcons?.blob();

    if (blob) {
      const zip = await jszip.loadAsync(blob);
      const file = zip.file('icons.json');
      let zipContents: GeneratedImageIcons = { icons: [] };

      if (file) {
        zipContents = JSON.parse(
          await file.async('string')
        ) as GeneratedImageIcons;
      }

      const icons: Array<Icon> = [];
      for (let i = 0; i < zipContents.icons.length; i++) {
        const icon = zipContents.icons[i];
        const zipSrc = icon.src;

        if (zipSrc) {
          const [platform] = zipSrc.split('/');
          const file = zip.file(zipSrc) ?? undefined;
          const base64Img = await file?.async('base64');

          if (base64Img) {
            icons.push({
              src: base64Img,
              type: 'image/png',
              generated: true,
              platform,
              purpose: 'any',
            });

            // TODO cache icon separately? or the zip?
          }
        }
      }

      updateManifest({
        icons,
      });
    }
  } catch (e) {
    console.error(e);
  }
}

export async function downloadZip(id: string) {
  try {
    const generatedIcons = await fetchIcons(id);
    console.log(generatedIcons);

    //TODO convert into Object URL? will that be all?

    download({
      id: '',
      fileName: 'icons.zip',
      url: '',
    });
  } catch (e) {
    console.error(e);
  }
}

function createForm(config: IconGeneratorConfig) {
  const formData = new FormData();
  const fileFormat = config.fileName.name.split('.').pop();

  formData.append('fileName', config.fileName, `source_img.${fileFormat}`);
  formData.append('padding', String(config.padding));
  formData.append('colorOption', config.colorOption);

  if (config.color) {
    formData.append('color', config.color);
    formData.append('colorChanged', '1');
  }

  addPlatforms(formData, config.platform);

  return formData;
}

function addPlatforms(formData: FormData, platforms: Array<Platform>) {
  const len = platforms.length;
  for (let i = 0; i < len; i++) {
    formData.append('platform', platforms[i]);
  }
}

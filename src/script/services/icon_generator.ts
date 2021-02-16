import { api } from '../utils/api';
import { download } from '../utils/download';

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

export const iconGeneratorDefaults: Partial<IconGeneratorConfig> = {
  padding: 0.3,
  colorOption: 'transparent',
  platform: ['windows', 'windows10', 'android', 'chrome', 'firefox'],
};

export async function generateMissingImages(config: MissingImagesConfig) {
  try {
    const formData = new FormData();
    formData.append('file', config.file);

    const request = await fetch(api.generateMissingImages.post, {
      method: 'POST',
      mode: 'no-cors',
      cache: 'no-cache',
      body: formData,
    });

    // TODO handle
    const response = await request.json();
  } catch (e) {
    console.error(e);
  }
}

export async function generateIcons(config: IconGeneratorConfig) {
  try {
    console.assert(
      config.fileName,
      'generateIcons()  requires a file to generate icons with'
    );
    if (config.fileName) {
      const err = new Error('requires an icon');
      err.name = 'NoFileError';

      throw err;
    }

    const request = await fetch(api.imageGenerator.post, {
      method: 'POST',
      mode: 'no-cors',
      cache: 'no-cache',
      headers: new Headers({}),
      body: createForm(config),
    });
    const response = (await request.json()) as IconGeneratorResponse;
    await fetchIcons(response.Uri);
  } catch (e) {
    if (e.name === 'NoFileError') {
      console.error('This API requires an error');
    }
  }
}

export async function fetchIcons(id: string) {
  try {
    const request = await fetch(api.imageGenerator.download(id), {
      method: 'GET',
      cache: 'no-cache',
    });

    // TODO
    const response = await request.blob();
    // download({
    //   id: `fetchIcons-${id}`
    //   // url: response
    // })
  } catch (e) {
    console.error(e);
  }
}

function createForm(config: IconGeneratorConfig) {
  const formData = new FormData();

  formData.append('fileName', config.fileName);
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

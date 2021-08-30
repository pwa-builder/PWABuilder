import { download } from '../utils/download';
import { Icon } from '../utils/interfaces';

const url = 'https://azure-express-zip-creator.azurewebsites.net/api';

export async function generateAndDownloadIconZip(images: Array<Icon>) {
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: new Headers({
        'content-type': 'application/json',
      }),
      body: JSON.stringify({
        images,
      }),
    });

    if (!response.ok) {
      throw new Error(JSON.stringify(await response.json()));
    }

    const blob = await response.blob();
    await download({
      id: 'icon',
      fileName: 'pwabuilder-icons.zip',
      blob,
    });
  } catch (e) {
    console.error(e);
  }
}

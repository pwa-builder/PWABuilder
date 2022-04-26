import { download } from '../utils/download';
import { Icon } from '../utils/interfaces';
import { env } from '../utils/environment';

const url = env.zipCreatorUrl;

function convertBase64ToBlob(base64Image: string) {
  // Split into two parts
  const parts = base64Image.split(';base64,');

  // Hold the content type
  const imageType = parts[0]!.split(':')[1];

  // Decode Base64 string
  const decodedData = window.atob(parts[1]!);

  // Create UNIT8ARRAY of size same as row data length
  const uInt8Array = new Uint8Array(decodedData.length);

  // Insert all character code into uInt8Array
  for (let i = 0; i < decodedData.length; ++i) {
    uInt8Array[i] = decodedData.charCodeAt(i);
  }

  // Return BLOB image after conversion
  return new Blob([uInt8Array], { type: imageType });
}

export async function generateAndDownloadIconZip(images: Array<Icon>) {
  let formData = new FormData();
  let formArray = images.map(image => {
    let imageClone = Object.assign({}, image);
    if(imageClone.src.includes('data:image')) {
      imageClone.src = "data:image";
    }
    return imageClone;
  });
  formData.append("icons", JSON.stringify(formArray));
  
  images.forEach(image => {
    if(image.src.includes('data:image')) {
      let newImageBlob = convertBase64ToBlob(image.src);
      formData.append("images", newImageBlob);
    }; 
  });

  try {
    const response = await fetch(url, { 
      method: 'POST',
      body: formData
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

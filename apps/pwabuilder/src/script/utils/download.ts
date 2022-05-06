
interface DownloadConfig {
  id?: string;
  fileName: string;
  url?: string;
  blob?: Blob;
}

export async function download(config: DownloadConfig) {
  try {
    const fsOpts = {
      fileName: config.fileName || 'PWABuilderImages.zip',
      extensions: ['.zip'],
      mimeTypes: ['application/zip'],
    };

    if (config.blob) {
      let link = document.createElement("a");

      link.href = URL.createObjectURL(config.blob);

      link.setAttribute("download", fsOpts.fileName);

      link.click();
    }
  } catch (e) {
    console.error(e);
  }
}

import { fileSave, FileWithHandle } from "browser-fs-access";
interface DownloadConfig {
  id: string;
  fileName: string;
  url?: string;
  blob?: Blob | FileWithHandle ;
}

export async function download(config: DownloadConfig) {
  try {
    const fsOpts = {
      fileName: config.fileName || "PWABuilder Images",
      extensions: ['zip'],
      mimeTypes: ['application/zip'],
    };

    if (config.blob) {
      await fileSave(config.blob, fsOpts)
    }
  } catch (e) {
    console.error(e);
  }
}

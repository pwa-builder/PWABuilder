enum Modes {
  fileApi,
  link,
}

interface DownloadConfig {
  id: string;
  fileName: string;
  url?: string;
  blob?: Blob;
}

export async function download(config: DownloadConfig) {
  let mode = Modes.link;

  try {
    mode = chooseMode(config);

    switch (mode) {
      case Modes.link:
        linkDownload(config);
        break;
      case Modes.fileApi:
        await fileApi(config);
        break;
      default:
        throw Error('mode not specified');
    }
  } catch (e) {
    console.error(e);
  } finally {
    cleanup(mode, config);
  }
}

function chooseMode(config: DownloadConfig) {
  if (window['chooseFileSystemEntries'] && config.blob) {
    return Modes.fileApi;
  }

  if (config.url) {
    return Modes.link;
  }

  throw new Error('cannot download with the information given');
}

function linkDownload(config: DownloadConfig) {
  const link = document.createElement('a');
  link.id = downloadLinkId(config);
  link.href = config.url;
  link.setAttribute('download', config.fileName);
  link.click();
}

async function fileApi(config: DownloadConfig) {
  try {
    const fsOpts = {
      type: 'save-file',
      accepts: [
        {
          description: 'PWA Builder Image Zip',
          extensions: ['zip'],
          mimeTypes: ['application/zip'],
        },
      ],
    };

    const fileHandle = await window['chooseFileSystemEntries'](fsOpts);
    const writable = await fileHandle.createWritable();
    await writable.write(config.blob);
  } catch (e) {
    console.error(e);
  }
}

function downloadLinkId(config: DownloadConfig) {
  return `download-${config.id}`;
}

async function cleanup(mode: Modes, config: DownloadConfig) {
  try {
    if (mode === Modes.link) {
      const el = document.getElementById(config.id);
      if (el) {
        el.remove();
      }
    }
  } catch (e) {
    console.error(e);
  }
}

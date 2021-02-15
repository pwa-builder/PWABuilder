enum Modes {
  fileApi,
  link,
}

interface DownloadConfig {
  id: string;
  url: string;
  fileName: string;
}

export async function download(config: DownloadConfig) {
  let mode = Modes.link;

  try {
    mode = chooseMode();

    switch (mode) {
      case Modes.link:
        linkDownload(config);
        break;
      case Modes.fileApi:
      default:
        // TODO
        break;
    }
  } catch (e) {
    console.error(e);
  } finally {
    cleanup(mode, config);
  }
}

function chooseMode() {
  // TODO flesh out tests and feature detection.
  return Modes.link;
}

function linkDownload(config: DownloadConfig) {
  const link = document.createElement('a');
  link.id = downloadLinkId(config);
  link.href = config.url;
  link.setAttribute('download', config.fileName);
  link.click();
}

function downloadLinkId(config: DownloadConfig) {
  return `download-${config.id}`;
}

async function cleanup(mode: Modes, config: DownloadConfig) {
  try {
    // TODO
    if (mode === Modes.link) {
      const el = document.getElementById(downloadLinkId(config));
      el.parentElement.removeChild(el);
    }
  } catch (e) {
    console.error(e);
  }
}

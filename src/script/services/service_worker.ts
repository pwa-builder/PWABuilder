import { fileSave } from 'browser-fs-access';

const apiUrl = 'https://pwabuilder-sw-server.azurewebsites.net';

let chosenSW: number | undefined;

export async function getServiceWorkers() {
  try {
    const response = await fetch(`${apiUrl}/listing`, {
      headers: {
        'Content-Type': 'application/json',
      },
      method: 'GET',
    });
    const swData = await response.json();

    if (swData) {
      const data = JSON.parse(swData);
      return data;
    }
  } catch (e) {
    handleError(e);
  }
}

export async function getServiceWorkerCode(serviceworker: number) {
  try {
    const response = await fetch(`${apiUrl}/codePreview?id=${serviceworker}`, {
      headers: {
        'Content-Type': 'application/json',
      },
      method: 'GET',
    });
    const result = await response.json();

    if (result && result.serviceWorker) {
      return result.serviceWorker;
    }
  } catch (e) {
    handleError(e);
  }
}

export async function downloadServiceWorker(serviceworker: number) {
  try {
    const response = await fetch(`${apiUrl}/download?id=${serviceworker}`, {
      headers: {
        'Content-Type': 'application/zip',
      },
      method: 'GET',
    });
    const blob = await response.blob();

    await fileSave(blob, {
      fileName: 'service_worker.zip',
      extensions: ['.zip'],
    });
  } catch (e) {
    handleError(e);
  }
}

export async function chooseServiceWorker(serviceworker: number) {
  chosenSW = serviceworker;
  return chosenSW;
}

export function unsetServiceWorker() {
  chosenSW = undefined;
}

export function getChosenServiceWorker() {
  return chosenSW;
}

function handleError(e: any) {
  const errorMessage = e.response.data
    ? e.response.data.error
    : e.response.data || e.response.statusText;
  throw new Error(errorMessage);
}

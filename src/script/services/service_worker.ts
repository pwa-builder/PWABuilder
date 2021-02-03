import { fileSave } from 'browser-fs-access';

const apiUrl = 'https://pwabuilder-sw-server.azurewebsites.net';

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

    if (result) {
      return result;
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

function handleError(e) {
  const errorMessage = e.response.data
    ? e.response.data.error
    : e.response.data || e.response.statusText;
  throw new Error(errorMessage);
}

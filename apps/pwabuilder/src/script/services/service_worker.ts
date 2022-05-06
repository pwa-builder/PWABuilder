import { fileSave } from 'browser-fs-access';

const apiUrl = 'https://pwabuilder-sw-server.azurewebsites.net';

// By default we are going to use the Advanced Caching SW.
let chosenSW: number | undefined = 5;
let setCounter: number = 0;

export async function getServiceWorkers() {
  try {
    const response = await fetch(`${apiUrl}/listing`, {
      headers: {
        'Content-Type': 'application/json',
      },
      method: 'GET',
    });
    if (!response.ok) {
      throw new Error(`Unable to fetch service workers due to error: ${response}`);
    }

    const swData = await response.json();
    if (swData) {
      const data = JSON.parse(swData);
      return data;
    }
  } catch (e) {
    handleError(e);
  }
}

export async function getServiceWorkerCode(
  serviceworker: number
): Promise<{ website: string; serviceWorker: string } | undefined> {
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
    } else {
      return undefined;
    }
  } catch (e) {
    handleError(e);
    return undefined;
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
  setCounter += 1;
  return chosenSW;
}

export function getSetSWCounter() {
  return setCounter;
}

export function unsetServiceWorker() {
  chosenSW = 5;
  setCounter = 0;
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

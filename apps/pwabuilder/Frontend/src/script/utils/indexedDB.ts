async function getDB(objectStore: string): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('pwa-db', 1);
    request.onupgradeneeded = () => {
      try {
        const db = request.result;
        if (!db.objectStoreNames.contains(objectStore)) {
          db.createObjectStore(objectStore);
        }
      } catch (err) {
        reject(new Error('Failed to upgrade IndexedDB: ' + (err as Error).message));
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(new Error('Failed to open IndexedDB: ' + request.error));
  });
}

export async function setDataInDB(objectStore: string, key: string, data: any) {
  try {
    const db = await getDB(objectStore);
    return new Promise<void>((resolve, reject) => {
      const tx = db.transaction(objectStore, 'readwrite');
      tx.objectStore(objectStore).put(data, key);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(new Error(`Failed to save data to ${objectStore}: ` + tx.error));
    });
  } catch (err) {
    console.error('setFormDataInDB error:', err);
    throw err;
  }
}

export async function getDataFromDB(objectStore: string, key: string): Promise<any | undefined> {
  try {
    const db = await getDB(objectStore);
    return new Promise((resolve, reject) => {
      const tx = db.transaction(objectStore, 'readonly');
      const req = tx.objectStore(objectStore).get(key);
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(new Error(`Failed to load data from ${objectStore}: ` + req.error));
    });
  } catch (err) {
    console.error('getFormDataFromDB error:', err);
    throw err;
  }
}

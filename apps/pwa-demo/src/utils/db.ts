// Tiny promise-based IndexedDB wrapper — no dependencies, just the platform.
// Nimbus stores notes and captured photos here so everything works offline.

const DB_NAME = 'nimbus';
const DB_VERSION = 1;

export interface NoteRecord {
  id: string;
  title: string;
  body: string;
  updated: number;
}

export interface PhotoRecord {
  id: string;
  blob: Blob;
  created: number;
  location?: { lat: number; lon: number } | null;
  filter?: string;
}

type StoreName = 'notes' | 'photos';

let dbPromise: Promise<IDBDatabase> | null = null;

function openDb(): Promise<IDBDatabase> {
  if (dbPromise) {
    return dbPromise;
  }
  dbPromise = new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains('notes')) {
        db.createObjectStore('notes', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('photos')) {
        db.createObjectStore('photos', { keyPath: 'id' });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
  return dbPromise;
}

function tx<T>(
  store: StoreName,
  mode: IDBTransactionMode,
  run: (os: IDBObjectStore) => IDBRequest<T>
): Promise<T> {
  return openDb().then(
    (db) =>
      new Promise<T>((resolve, reject) => {
        const transaction = db.transaction(store, mode);
        const request = run(transaction.objectStore(store));
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      })
  );
}

export function putRecord<T>(store: StoreName, value: T): Promise<IDBValidKey> {
  return tx(store, 'readwrite', (os) => os.put(value as any));
}

export function deleteRecord(store: StoreName, id: string): Promise<undefined> {
  return tx(store, 'readwrite', (os) => os.delete(id));
}

export function getAll<T>(store: StoreName): Promise<T[]> {
  return tx(store, 'readonly', (os) => os.getAll() as IDBRequest<T[]>);
}

/** Convenience: a short unique id without pulling in a uuid dependency. */
export function uid(): string {
  return (
    Date.now().toString(36) + Math.random().toString(36).slice(2, 8)
  ).toUpperCase();
}

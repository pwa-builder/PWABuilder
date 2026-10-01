// Helpers around installability, connectivity, and storage. These power the
// home dashboard and the install banner.

let deferredPrompt: any = null;

export interface InstallState {
  canInstall: boolean;
  installed: boolean;
}

const listeners = new Set<(state: InstallState) => void>();

function currentState(): InstallState {
  return {
    canInstall: deferredPrompt !== null,
    installed: isStandalone(),
  };
}

function emit(): void {
  const state = currentState();
  listeners.forEach((fn) => fn(state));
}

// Capture the beforeinstallprompt event so we can trigger it on demand.
window.addEventListener('beforeinstallprompt', (event) => {
  event.preventDefault();
  deferredPrompt = event;
  emit();
});

window.addEventListener('appinstalled', () => {
  deferredPrompt = null;
  emit();
});

/** Subscribe to install-state changes; returns an unsubscribe function. */
export function onInstallStateChange(
  fn: (state: InstallState) => void
): () => void {
  listeners.add(fn);
  fn(currentState());
  return () => listeners.delete(fn);
}

/** Show the native install prompt if one is queued. */
export async function promptInstall(): Promise<'accepted' | 'dismissed' | 'unavailable'> {
  if (!deferredPrompt) {
    return 'unavailable';
  }
  deferredPrompt.prompt();
  const choice = await deferredPrompt.userChoice;
  deferredPrompt = null;
  emit();
  return choice.outcome;
}

/** True when the app is running as an installed PWA. */
export function isStandalone(): boolean {
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    window.matchMedia('(display-mode: window-controls-overlay)').matches ||
    (navigator as any).standalone === true
  );
}

export interface StorageInfo {
  usage: number;
  quota: number;
  persisted: boolean;
}

/** Estimate storage usage and whether it is persistent. */
export async function getStorageInfo(): Promise<StorageInfo | null> {
  if (!('storage' in navigator) || !navigator.storage.estimate) {
    return null;
  }
  const estimate = await navigator.storage.estimate();
  let persisted = false;
  if (navigator.storage.persisted) {
    persisted = await navigator.storage.persisted();
  }
  return {
    usage: estimate.usage ?? 0,
    quota: estimate.quota ?? 0,
    persisted,
  };
}

/** Ask the browser to make storage persistent (won't be evicted under pressure). */
export async function requestPersistentStorage(): Promise<boolean> {
  if (navigator.storage?.persist) {
    return navigator.storage.persist();
  }
  return false;
}

export function formatBytes(bytes: number): string {
  if (!bytes) {
    return '0 B';
  }
  const units = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(i ? 1 : 0)} ${units[i]}`;
}

/** Subscribe to online/offline changes; returns an unsubscribe function. */
export function onConnectivityChange(fn: (online: boolean) => void): () => void {
  const update = () => fn(navigator.onLine);
  window.addEventListener('online', update);
  window.addEventListener('offline', update);
  update();
  return () => {
    window.removeEventListener('online', update);
    window.removeEventListener('offline', update);
  };
}

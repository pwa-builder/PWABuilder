export async function getServiceWorkerVersions(session) {
  return new Promise((resolve, reject) => {
    const versionUpdatedListener = (data) => {
      // find a service worker with runningStatus that looks like active
      const activateCandidates = data.versions.filter((sw) => sw.status !== 'redundant');
      const hasActiveServiceWorker = activateCandidates.find((sw) => sw.status === 'activated');
      if (!activateCandidates.length || hasActiveServiceWorker) {
        session.off('ServiceWorker.workerVersionUpdated', versionUpdatedListener);
        session.sendCommand('ServiceWorker.disable').then((_) => resolve(data), reject);
      }
    };
    session.on('ServiceWorker.workerVersionUpdated', versionUpdatedListener);
    session.sendCommand('ServiceWorker.enable').catch(reject);
  });
}

export async function getServiceWorkerRegistrations(session) {
  return new Promise((resolve, reject) => {
    session.once('ServiceWorker.workerRegistrationUpdated', (data) => {
      session.sendCommand('ServiceWorker.disable').then((_) => resolve(data), reject);
    });
    session.sendCommand('ServiceWorker.enable').catch(reject);
  });
}

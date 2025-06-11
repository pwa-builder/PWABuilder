import * as LH from 'lighthouse/types/lh.js';

type ProtocolSession = LH.Gatherer.ProtocolSession;

type WorkerVersionUpdatedEvent = LH.Crdp.ServiceWorker.WorkerVersionUpdatedEvent;
type WorkerRegistrationUpdatedEvent = LH.Crdp.ServiceWorker.WorkerRegistrationUpdatedEvent;

async function getServiceWorkerVersions(session: ProtocolSession): Promise<WorkerVersionUpdatedEvent> {
  return new Promise((resolve, reject) => {
    const versionUpdatedListener = (data: WorkerVersionUpdatedEvent) => {
      // find a service worker with runningStatus that looks like active
      // on slow connections the serviceworker might still be installing
      const activateCandidates = data.versions.filter(sw => sw.status !== 'redundant');
      const hasActiveServiceWorker = activateCandidates.find(sw => sw.status === 'activated' /*|| sw.status === 'installing'*/);

      if (!activateCandidates.length || hasActiveServiceWorker) {
        session.off('ServiceWorker.workerVersionUpdated', versionUpdatedListener);
        session.sendCommand('ServiceWorker.disable').then(_ => resolve(data), reject);
      }
    };

    session.on('ServiceWorker.workerVersionUpdated', versionUpdatedListener);
    session.sendCommand('ServiceWorker.enable').catch(reject);
  });
}

async function getServiceWorkerRegistrations(session: ProtocolSession): Promise<WorkerRegistrationUpdatedEvent> {
  return new Promise((resolve, reject) => {
    session.once('ServiceWorker.workerRegistrationUpdated', data => {
      session.sendCommand('ServiceWorker.disable').then(_ => resolve(data), reject);
    });
    session.sendCommand('ServiceWorker.enable').catch(reject);
  });
}

export {getServiceWorkerVersions, getServiceWorkerRegistrations};

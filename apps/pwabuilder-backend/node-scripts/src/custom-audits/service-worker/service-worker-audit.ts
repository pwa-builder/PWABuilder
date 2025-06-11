import * as LH from 'lighthouse/types/lh.js';
import { Audit, Artifacts, IcuMessage } from 'lighthouse';
import * as i18n from 'lighthouse/core/lib/i18n/i18n.js';

const UIStrings = {
  title: 'Registers a service worker that controls page and `start_url`',
  failureTitle: 'Does not register a service worker that controls page and `start_url`',
  description: 'The service worker is the technology that enables your app to use many ' +
    'Progressive Web App features, such as offline, add to homescreen, and push ' +
    'notifications. [Learn more about Service Workers](https://developer.chrome.com/docs/lighthouse/pwa/service-worker/).',
  explanationOutOfScope: 'This origin has one or more service workers, however the page ' +
    '({pageUrl}) is not in scope.',
  explanationNoManifest: 'This page is controlled by a service worker, however ' +
    'no `start_url` was found because no manifest was fetched.',
  explanationBadManifest: 'This page is controlled by a service worker, however ' +
    'no `start_url` was found because manifest failed to parse as valid JSON',
  explanationBadStartUrl: 'This page is controlled by a service worker, however ' +
    'the `start_url` ({startUrl}) is not in the service worker\'s scope ({scopeUrl})',
};

const str_ = i18n.createIcuMessageFn(import.meta.url, UIStrings);

interface ServiceWorkerUrls {
  scopeUrl: string;
  scriptUrl: string;
}

class ServiceWorkerAudit extends Audit {
  static get meta(): LH.Audit.Meta {
    return {
      id: 'service-worker-audit',
      title: str_(UIStrings.title),
      failureTitle: str_(UIStrings.failureTitle),
      description: str_(UIStrings.description),
      supportedModes: ['navigation'],
      // @ts-ignore
      requiredArtifacts: ['URL', 'ServiceWorkerGatherer', 'WebAppManifest'],
    };
  }

  static getVersionsForOrigin(
    versions: LH.Crdp.ServiceWorker.ServiceWorkerVersion[],
    pageUrl: URL
  ): LH.Crdp.ServiceWorker.ServiceWorkerVersion[] {
    return versions
      .filter(v => v.status === 'activated' /*|| v.status === 'installing'*/)
      .filter(v => new URL(v.scriptURL).origin === pageUrl.origin);
  }

  static getControllingServiceWorker(
    matchingSWVersions: LH.Crdp.ServiceWorker.ServiceWorkerVersion[],
    registrations: LH.Crdp.ServiceWorker.ServiceWorkerRegistration[],
    pageUrl: URL
  ):  ServiceWorkerUrls | undefined {
    const scriptByScopeUrlList: ServiceWorkerUrls[] = [];

    for (const version of matchingSWVersions) {
      const matchedRegistration = registrations
        .find(r => r.registrationId === version.registrationId);

      if (matchedRegistration) {
        const scopeUrl = new URL(matchedRegistration.scopeURL).href;
        const scriptUrl = new URL(version.scriptURL).href;
        scriptByScopeUrlList.push({scopeUrl, scriptUrl});
      }
    }

    const pageControllingUrls = scriptByScopeUrlList
      .filter(ss => pageUrl.href.startsWith(ss.scopeUrl))
      .sort((ssA, ssB) => ssA.scopeUrl.length - ssB.scopeUrl.length)
      .pop();

    return pageControllingUrls;
  }

  static checkStartUrl(
    WebAppManifest: Artifacts['WebAppManifest'],
    scopeUrl: string
  ): IcuMessage | undefined {
    if (!WebAppManifest) {
      return str_(UIStrings.explanationNoManifest);
    }
    if (!WebAppManifest.value) {
      return str_(UIStrings.explanationBadManifest);
    }

    const startUrl = WebAppManifest.value.start_url.value;
    if (!startUrl.startsWith(scopeUrl)) {
      return str_(UIStrings.explanationBadStartUrl, {startUrl, scopeUrl});
    }
  }

  static audit(artifacts: Artifacts): LH.Audit.Product {
    const { mainDocumentUrl } = artifacts.URL;
    if (!mainDocumentUrl) throw new Error('mainDocumentUrl must exist in navigation mode');
    const pageUrl = new URL(mainDocumentUrl);
    // @ts-ignore
    const {versions, registrations } = artifacts.ServiceWorkerGatherer as IServiceWorkerGatherer;

    const versionsForOrigin = ServiceWorkerAudit.getVersionsForOrigin(versions, pageUrl);
    if (versionsForOrigin.length === 0) {
      return {
        score: 0,
      };
    }

    const serviceWorkerUrls = ServiceWorkerAudit.getControllingServiceWorker(versionsForOrigin,
        registrations, pageUrl);
    if (!serviceWorkerUrls) {
      return {
        score: 0,
        explanation: str_(UIStrings.explanationOutOfScope, {pageUrl: pageUrl.href}),
      };
    }

    const {scriptUrl, scopeUrl} = serviceWorkerUrls;
    const details: LH.Audit.Details.DebugData = {
      type: 'debugdata',
      scriptUrl,
      scopeUrl,
    };

    const startUrlFailure = ServiceWorkerAudit.checkStartUrl(artifacts.WebAppManifest,
      serviceWorkerUrls.scopeUrl);
    if (startUrlFailure) {
      return {
        score: 0,
        details,
        explanation: startUrlFailure,
      };
    }

    return {
      score: 1,
      details,
    };
  }
}

export default ServiceWorkerAudit;
export { UIStrings };
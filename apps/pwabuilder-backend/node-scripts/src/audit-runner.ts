import puppeteer from 'puppeteer';
import lighthouse, { OutputMode, Flags } from 'lighthouse';
import customConfig from './custom-config.js';
import { screenEmulationMetrics, userAgents } from 'lighthouse/core/config/constants.js';

// Configuration Constants
const MAX_WAIT_FOR_LOAD = 30 * 1000; // milliseconds
const MAX_WAIT_FOR_FCP = 15 * 1000; // milliseconds

// Main Lighthouse Auditing Function
const audit = async (page: any, url: string, desktop?: boolean) => {
  console.error('Audit is running', process.pid);

  // Puppeteer with Lighthouse flags
  const flags = {
    logLevel: 'silent', // 'silent' | 'error' | 'info' | 'verbose'
    output: 'json', // 'json' | 'html' | 'csv'
    locale: 'en-US',

    maxWaitForFcp: MAX_WAIT_FOR_FCP,
    maxWaitForLoad: MAX_WAIT_FOR_LOAD,

    pauseAfterLoadMs: 250,
    pauseAfterFcpMs: 250,
    pauseAfterNetworkQuietMs: 250,
    pauseAfterCPUIdleMs: 250,
    networkQuietThresholdMs: 250,
    cpuQuietThresholdMs: 250,

    throttling: {
      rttMs: 0,
      throughputKbps: 0,
      requestLatencyMs: 0,
      downloadThroughputKbps: 0,
      uploadThroughputKbps: 0,
      cpuSlowdownMultiplier: 0,
    },

    disableStorageReset: true,
    disableFullPageScreenshot: true,

    skipAboutBlank: true,
    formFactor: desktop ? 'desktop' : 'mobile',
    screenEmulation: screenEmulationMetrics[desktop ? 'desktop' : 'mobile'],
    emulatedUserAgent: `${desktop ? userAgents.desktop : userAgents.mobile} PWABuilderHttpAgent`,
    onlyAudits: ['installable-manifest', 'is-on-https', 'service-worker-audit', 'https-audit', 'offline-audit'],
  } as Flags;

  try {
    // @ts-ignore
    const rawResult = await lighthouse(url, flags, customConfig, page);
    return {
      audits: rawResult?.lhr?.audits,
      artifacts: {
        Manifest: {
          // @ts-ignore
          url: rawResult?.artifacts.WebAppManifest?.url,
          // @ts-ignore
          raw: rawResult?.artifacts.WebAppManifest?.raw,
        },
        // @ts-ignore
        ServiceWorker: rawResult?.artifacts.ServiceWorkerGatherer,
      },
    };
  } catch (error) {
    writeAndExit(error, 1);
  }
};

// Function to write and exit with results
const writeAndExit = (data, code) => {
  if (process.stdout) {
    if (code) {
      process.stdout.write(JSON.stringify(data, Object.getOwnPropertyNames(data)), () => {
        process.exit(code);
      });
    } else {
      process.stdout.write(JSON.stringify(data), () => {
        process.exit(code);
      });
    }
  } else process.exit(code);
};

const disabledFeatures = [
  'Translate',
  'TranslateUI',
  // AcceptCHFrame disabled because of crbug.com/1348106.
  'AcceptCHFrame',
  'AutofillServerCommunication',
  'CalculateNativeWinOcclusion',
  'CertificateTransparencyComponentUpdater',
  'InterestFeedContentSuggestions',
  'MediaRouter',
  'DialMediaRouteProvider',
  // 'OptimizationHints'
];

// Puppeteer setup and Lighthouse run function
async function execute() {
  console.error('Execute is running', process.pid);

  const url = process.argv[2];
  const desktop = process.argv[3] === 'desktop';

  // Launch Puppeteer with necessary flags
  const currentBrowser = await puppeteer.launch({
    args: [
      '--no-sandbox',
      '--no-pings',
      '--deny-permission-prompts',
      '--disable-domain-reliability',
      '--disable-gpu',
      '--block-new-web-contents',
      `--disable-features=${disabledFeatures.join(',')}`,
    ],
    headless: true,
    defaultViewport: {
      width: screenEmulationMetrics[desktop ? 'desktop' : 'mobile'].width,
      height: screenEmulationMetrics[desktop ? 'desktop' : 'mobile'].height,
      deviceScaleFactor: screenEmulationMetrics[desktop ? 'desktop' : 'mobile'].deviceScaleFactor,
      isMobile: desktop ? false : true,
      hasTouch: desktop ? false : true,
      isLandscape: desktop ? true : false,
    },
  });

  const page = await currentBrowser.pages().then((pages) => pages[0]);
  await page.setBypassServiceWorker(true);
  await page.setRequestInterception(true);

  page.on('dialog', (dialog) => {
    dialog.dismiss();
  });

  page.on('request', (req) => {
    req.continue();
  });

  const manifest_alt = {
    url: '',
    raw: '',
    json: {},
  };

  page.on('response', async (res) => {
    if (res.request().resourceType() === 'manifest') {
      try {
        manifest_alt.raw = await res.text();
        manifest_alt.url = res.url();
      } catch (error) {}
    }
  });

  let valveTriggered = false;
  const turnValve = setTimeout(async () => {
    valveTriggered = true;
    try {
      const client = await page.target().createCDPSession();
      await client.send('ServiceWorker.enable');
      await client.send('ServiceWorker.stopAllWorkers');
    } catch (error) {
      console.error(error);
    }
  }, MAX_WAIT_FOR_LOAD * 2);

  try {
    // Run Lighthouse audit
    const webAppReport = await audit(page, url, desktop);
    clearTimeout(turnValve);
    if (valveTriggered && webAppReport?.audits?.['service-worker-audit']) {
      // @ts-ignore
      webAppReport.audits['service-worker-audit'].details = {
        error: 'Service worker timed out',
      };
    }

    if (
      manifest_alt.url &&
      webAppReport &&
      manifest_alt.raw &&
      (!webAppReport.artifacts.Manifest.raw || manifest_alt.raw > webAppReport.artifacts.Manifest.raw)
    ) {
      webAppReport.artifacts.Manifest = manifest_alt;
    }

    await currentBrowser.close();
    writeAndExit(webAppReport, 0);
  } catch (error) {
    await currentBrowser.close();
    writeAndExit(error, 1);
  }
}

// Run the execute function
await execute();

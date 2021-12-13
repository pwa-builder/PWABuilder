import { default_timeout } from '../../utils/api';
import { ManifestContext, TestResult } from '../../utils/interfaces';
import { runManifestChecks } from '../../utils/manifest-validation';
import { fetchOrCreateManifest } from '../manifest';

const default_results: TestResult[] = [
  {
    infoString: 'Web Manifest Properly Attached',
    result: false,
    category: 'required',
  },
  {
    infoString: 'Lists icons for add to home screen',
    result: false,
    category: 'required',
  },
  {
    infoString: 'Contains name property',
    result: false,
    category: 'required',
  },
  {
    infoString: 'Contains short_name property',
    result: false,
    category: 'required',
  },
  {
    infoString: 'Designates a start_url',
    result: false,
    category: 'required',
  },
  {
    infoString: 'Specifies a display mode',
    result: false,
    category: 'recommended',
  },
  {
    infoString: 'Has a background color',
    result: false,
    category: 'recommended',
  },
  {
    infoString: 'Has a theme color',
    result: false,
    category: 'recommended',
  },
  {
    infoString: 'Specifies an orientation mode',
    result: false,
    category: 'recommended',
  },
  {
    infoString: 'Contains screenshots for app store listings',
    result: false,
    category: 'recommended',
  },
  {
    infoString: 'Has a square PNG icon 512x512 or larger',
    result: false,
    category: 'required',
  },
  {
    infoString: 'Has a maskable PNG icon',
    result: false,
    category: 'recommended',
  },
  {
    infoString: 'Lists shortcuts for quick access',
    result: false,
    category: 'recommended',
  },
  {
    infoString: 'Contains categories to classify the app',
    result: false,
    category: 'recommended',
  },
  {
    infoString: 'Icons specify their type',
    result: false,
    category: 'recommended',
  },
  {
    infoString: 'Icons specify their size',
    result: false,
    category: 'recommended',
  },
  {
    infoString: 'Contains an IARC ID',
    result: false,
    category: 'optional',
  },
  {
    infoString: 'Specifies related_application',
    result: false,
    category: 'optional',
  },
];

export async function testManifest(
  url: string
): Promise<Array<TestResult> | boolean> {
  try {
    const manifestData = fetchOrCreateManifest(url);

    const twentySecondTimeout = new Promise<Array<TestResult>>(resolve =>
      setTimeout(() => resolve(default_results), default_timeout)
    );

    const fetchResultOrTimeout: Array<TestResult> | ManifestContext =
      await Promise.race([twentySecondTimeout, manifestData]);

    if (!fetchResultOrTimeout) {
      console.warn('Manifest check timed out after 20 seconds.');
      return default_results;
    }

    if (fetchResultOrTimeout) {
      const manifest = fetchResultOrTimeout;
      if (Array.isArray(manifest)) {
        console.error('Could not test manifest, returning default results');
        return manifest as Array<TestResult>;
      } else {
        return await runManifestChecks(manifest);
      }
    } else {
      console.error('Could not get manifest data');
      return default_results;
    }
  } catch (err) {
    console.warn('Could not fetch a manifest to test due to error.', err);
    return default_results;
  }
}
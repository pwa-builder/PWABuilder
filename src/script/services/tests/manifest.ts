import { default_timeout } from '../../utils/api';
import { findSuitableIcon } from '../../utils/icons';
import { ManifestDetectionResult, TestResult } from '../../utils/interfaces';
import { fetchManifest } from '../manifest';

const default_results = [
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
    const manifestData = fetchManifest(url);

    const twentySecondTimeout = new Promise<Array<TestResult>>(resolve =>
      setTimeout(() => resolve(default_results), default_timeout)
    );

    const fetchResultOrTimeout:
      | Array<TestResult>
      | ManifestDetectionResult = await Promise.race([
      twentySecondTimeout,
      manifestData,
    ]);

    if (!fetchResultOrTimeout) {
      console.warn('Manifest check timed out after 20 seconds.');
      return default_results;
    }

    if (fetchResultOrTimeout) {
      const manifest = await fetchResultOrTimeout;

      if (manifest && (manifest as ManifestDetectionResult).content) {
        return doTest(manifest as ManifestDetectionResult);
      } else {
        console.error('Could not test manifest, returning default results');
        return manifest as Array<TestResult>;
      }
    } else {
      console.error('Could not get manifest data');
      return default_results;
    }
  } catch (err) {
    console.error(
      'Could not fetch a manifest to test within the specified time limit.'
    );
    return default_results;
  }
}

function doTest(manifest: ManifestDetectionResult) {
  if (manifest.generated && manifest.generated === true) {
    return default_results;
  } else {
    return [
      {
        infoString: 'Web Manifest Properly Attached',
        result: true,
        category: 'required',
      },
      {
        infoString: 'Lists icons for add to home screen',
        result:
          manifest.content.icons && manifest.content.icons.length > 0
            ? true
            : false,
        category: 'required',
      },
      {
        infoString: 'Contains name property',
        result:
          manifest.content.name && manifest.content.name.length > 1
            ? true
            : false,
        category: 'required',
      },
      {
        infoString: 'Contains short_name property',
        result:
          manifest.content.short_name && manifest.content.short_name.length > 1
            ? true
            : false,
        category: 'required',
      },
      {
        infoString: 'Designates a start_url',
        result:
          manifest.content.start_url && manifest.content.start_url.length > 0
            ? true
            : false,
        category: 'required',
      },
      {
        infoString: 'Specifies a display mode',
        result:
          manifest.content.display &&
          ['fullscreen', 'standalone', 'minimal-ui', 'browser'].includes(
            manifest.content.display
          )
            ? true
            : false,
        category: 'recommended',
      },
      {
        infoString: 'Has a background color',
        result: manifest.content.background_color ? true : false,
        category: 'recommended',
      },
      {
        infoString: 'Has a theme color',
        result: manifest.content.theme_color ? true : false,
        category: 'recommended',
      },
      {
        infoString: 'Specifies an orientation mode',
        result:
          manifest.content.orientation &&
          isStandardOrientation(manifest.content.orientation)
            ? true
            : false,
        category: 'recommended',
      },
      {
        infoString: 'Contains screenshots for app store listings',
        result:
          manifest.content.screenshots &&
          manifest.content.screenshots.length > 0
            ? true
            : false,
        category: 'recommended',
      },
      {
        infoString: 'Has a square PNG icon 512x512 or larger',
        result: findSuitableIcon(manifest.content.icons, null, 512, 512, 'image/png') ? true : false,
        category: 'required',
      },
      {
        infoString: 'Has a maskable PNG icon',
        result: findSuitableIcon(manifest.content.icons, 'maskable', 512, 512, 'image/png') ? true : false,
        category: 'recommended',
      },
      {
        infoString: 'Lists shortcuts for quick access',
        result:
          manifest.content.shortcuts && manifest.content.shortcuts.length > 0
            ? true
            : false,
        category: 'recommended',
      },
      {
        infoString: 'Contains categories to classify the app',
        result:
          manifest.content.categories &&
          manifest.content.categories.length > 0 &&
          containsStandardCategory(manifest.content.categories)
            ? true
            : false,
        category: 'recommended',
      },
      {
        infoString: 'Contains an IARC ID',
        result: manifest.content.iarc_rating_id ? true : false,
        category: 'optional',
      },
      {
        infoString: 'Specifies related_applications',
        result:
          manifest.content.related_applications &&
          manifest.content.related_applications.length > 0
            ? true
            : false,
        category: 'optional',
      },
    ];
  }
}

function containsStandardCategory(categories: string[]): boolean {
  // https://github.com/w3c/manifest/wiki/Categories
  const standardCategories = [
    'books',
    'business',
    'education',
    'entertainment',
    'finance',
    'fitness',
    'food',
    'games',
    'government',
    'health',
    'kids',
    'lifestyle',
    'magazines',
    'medical',
    'music',
    'navigation',
    'news',
    'personalization',
    'photo',
    'politics',
    'productivity',
    'security',
    'shopping',
    'social',
    'sports',
    'travel',
    'utilities',
    'weather',
  ];
  return categories.some(c => standardCategories.includes(c));
}

function isStandardOrientation(orientation: string) {
  const standardOrientations = [
    'any',
    'natural',
    'landscape',
    'landscape-primary',
    'landscape-secondary',
    'portrait',
    'portrait-primary',
    'portrait-secondary',
  ];
  return standardOrientations.includes(orientation);
}

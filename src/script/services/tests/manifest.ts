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

export async function testManifest(url: string): Promise<Array<TestResult>> {
  const manifestData = await fetchManifest(url);

  if (manifestData) {
    const manifest = manifestData;

    if (manifest) {
      return doTest(manifest);
    } else {
      throw new Error('Could not test manifest');
    }
  } else {
    throw new Error('Could not get manifest data');
  }
}

function doTest(manifest: ManifestDetectionResult): Array<TestResult> {
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
        result: true,
        category: 'required',
      },
      {
        infoString: 'Has a maskable PNG icon',
        result: true,
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
        infoString: 'Specifies related_application',
        result:
          manifest.content.related_applications &&
          manifest.content.related_applications.length > 0 &&
          manifest.content.prefer_related_applications !== undefined
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

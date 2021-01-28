import { Manifest, ManifestTestResults } from '../../utils/interfaces';
import { fetchManifest } from '../manifest';

export async function testManifest(
  url: string
): Promise<ManifestTestResults | undefined> {
  console.info('Testing Manifest');
  const manifestData = await fetchManifest(url);

  if (manifestData) {
    const manifest = manifestData.content;

    if (manifest) {
      const testResults = doTest(manifest);

      return testResults;
    } else {
      throw new Error('Could not test manifest');
    }
  } else {
    throw new Error('Could not get manifest data');
  }
}

function doTest(manifest: Manifest): any {
  return [
    {
      infoString: 'Web Manifest Properly Attached',
      result: true,
    },
    {
      infoString: 'Lists icons for add to home screen',
      result: manifest.icons && manifest.icons.length > 0 ? true : false,
    },
    {
      infoString: 'Contains name property',
      result: manifest.name && manifest.name.length > 1 ? true : false,
    },
    {
      infoString: 'Contains short_name property',
      result:
        manifest.short_name && manifest.short_name.length > 1 ? true : false,
    },
    {
      infoString: 'Designates a start_url',
      result:
        manifest.start_url && manifest.start_url.length > 0 ? true : false,
    },
    {
      infoString: 'Specifies a display mode',
      result:
        manifest.display &&
        ['fullscreen', 'standalone', 'minimal-ui', 'browser'].includes(
          manifest.display
        )
          ? true
          : false,
    },
    {
      infoString: 'Has a background color',
      result: manifest.background_color ? true : false,
    },
    {
      infoString: 'Has a theme color',
      result: manifest.theme_color ? true : false,
    },
    {
      infoString: 'Specifies an orientation mode',
      result:
        manifest.orientation && isStandardOrientation(manifest.orientation)
          ? true
          : false,
    },
    {
      infoString: 'Contains screenshots for app store listings',
      result:
        manifest.screenshots && manifest.screenshots.length > 0 ? true : false,
    },
    { infoString: 'Has a square PNG icon 512x512 or larger', result: true },
    { infoString: 'Has a maskable PNG icon', result: true },
    {
      infoString: 'Lists shortcuts for quick access',
      result:
        manifest.shortcuts && manifest.shortcuts.length > 0 ? true : false,
    },
    {
      infoString: 'Contains categories to classify the app',
      result:
        manifest.categories &&
        manifest.categories.length > 0 &&
        containsStandardCategory(manifest.categories)
          ? true
          : false,
    },
    {
      infoString: 'Contains an IARC ID',
      result: manifest.iarc_rating_id ? true : false,
    },
    {
      infoString: 'Specifies related_application',
      result:
        manifest.related_applications &&
        manifest.related_applications.length > 0 &&
        manifest.prefer_related_applications !== undefined
          ? true
          : false,
    },
  ];
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

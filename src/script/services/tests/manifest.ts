import { Manifest, ManifestTestResults } from '../../utils/interfaces';
import { fetchManifest } from '../manifest';

export async function testManifest(
  url: string
): Promise<ManifestTestResults | undefined> {
  console.info("Testing Manifest");
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

function doTest(manifest: Manifest): ManifestTestResults {
  return {
    has_manifest: true,
    has_icons: manifest.icons && manifest.icons.length > 0 ? true : false,
    has_name: manifest.name && manifest.name.length > 1 ? true : false,
    has_short_name:
      manifest.short_name && manifest.short_name.length > 1 ? true : false,
    has_start_url:
      manifest.start_url && manifest.start_url.length > 0 ? true : false,
    has_display_mode:
      manifest.display &&
      ['fullscreen', 'standalone', 'minimal-ui', 'browser'].includes(
        manifest.display
      ) ? true : false,
    has_background_color: manifest.background_color ? true : false,
    has_theme_color: manifest.theme_color ? true : false,
    has_orientation_mode:
      manifest.orientation && isStandardOrientation(manifest.orientation)
        ? true
        : false,
    has_screenshots: manifest.screenshots && manifest.screenshots.length > 0 ? true : false,
    has_square_512: true,
    has_maskable_icon: true,
    has_shortcuts: manifest.shortcuts && manifest.shortcuts.length > 0 ? true : false,
    has_categories:
      manifest.categories &&
      manifest.categories.length > 0 &&
      containsStandardCategory(manifest.categories)
        ? true
        : false,
    has_rating_id: manifest.iarc_rating_id ? true : false,
    has_related:
      manifest.related_applications &&
      manifest.related_applications.length > 0 &&
      manifest.prefer_related_applications !== undefined
        ? true
        : false,
  };
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

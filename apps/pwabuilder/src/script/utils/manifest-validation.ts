import { testWebsiteUrl } from '../services/regex';
import { findBestAppIcon, findSuitableIcon, IconInfo } from './icons';
import { ManifestContext, TestResult } from './interfaces';

export function validateScreenshotUrlsList(urls: Array<string | undefined>) {
  const results: Array<boolean> = [];

  const length = urls.length;
  for (let i = 0; i < length; i++) {
    const urlToHandle = urls[i];
    results[i] = urlToHandle ? testWebsiteUrl(urlToHandle) : false;
  }

  return results;
}

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

export async function runManifestChecks(context: ManifestContext): Promise<Array<TestResult>> {
  if (context.isGenerated === true) {
    return default_results;
  } else {

    // go ahead and try to find mainIcon
    // so we can use it for the below check
    const mainIcon = findBestAppIcon(context.manifest.icons);
    const mainIconInfo = mainIcon ? new IconInfo(mainIcon) : null;

    // checking if the icon can be succesfully loaded
    const iconCanBeLoaded = mainIconInfo ? await mainIconInfo.resolvesSuccessfully(context.manifestUrl) : false;
    return [
      {
        infoString: 'Web Manifest Properly Attached',
        result: true,
        category: 'required',
      },
      {
        infoString: 'Lists icons for add to home screen',
        result:
          context.manifest.icons && context.manifest.icons.length > 0
            ? true
            : false,
        category: 'required',
      },
      {
        infoString: 'Contains name property',
        result:
          context.manifest.name && context.manifest.name.length > 1
            ? true
            : false,
        category: 'required',
      },
      {
        infoString: 'Contains short_name property',
        result:
          context.manifest.short_name && context.manifest.short_name.length > 1
            ? true
            : false,
        category: 'required',
      },
      {
        infoString: 'Designates a start_url',
        result:
          context.manifest.start_url && context.manifest.start_url.length > 0
            ? true
            : false,
        category: 'required',
      },
      {
        infoString: 'Specifies a display mode',
        result:
          context.manifest.display &&
            ['fullscreen', 'standalone', 'minimal-ui', 'browser'].includes(
              context.manifest.display
            )
            ? true
            : false,
        category: 'recommended',
      },
      {
        infoString: 'Has a background color',
        result: context.manifest.background_color ? true : false,
        category: 'recommended',
      },
      {
        infoString: 'Has a theme color',
        result: context.manifest.theme_color ? true : false,
        category: 'recommended',
      },
      {
        infoString: 'Specifies an orientation mode',
        result:
          context.manifest.orientation &&
            isStandardOrientation(context.manifest.orientation)
            ? true
            : false,
        category: 'recommended',
      },
      {
        infoString: 'Contains screenshots for app store listings',
        result:
          context.manifest.screenshots &&
            context.manifest.screenshots.length > 0
            ? true
            : false,
        category: 'recommended',
      },
      {
        infoString: 'Has a square PNG icon 512x512 or larger',
        result: !!mainIconInfo && mainIconInfo.isPng && mainIconInfo.isAtLeast(512, 512),
        category: 'required',
      },
      {
        infoString: '512x512 or larger icon can be loaded succesfully from the network',
        result: iconCanBeLoaded,
        category: 'required'
      },
      {
        infoString: 'Has a maskable PNG icon 512x512 or larger',
        result: findSuitableIcon(
          context.manifest.icons,
          'maskable',
          512,
          512,
          'image/png'
        )
          ? true
          : false,
        category: 'recommended',
      },
      {
        infoString: 'Lists shortcuts for quick access',
        result:
          context.manifest.shortcuts && context.manifest.shortcuts.length > 0
            ? true
            : false,
        category: 'recommended',
      },
      {
        infoString: categoryReport(context.manifest.categories) as any,
        result:
          context.manifest.categories &&
            context.manifest.categories.length > 0 &&
            containsStandardCategory(context.manifest.categories)
            ? true
            : false,
        category: 'recommended',
      },
      {
        infoString: 'Icons specify their type',
        result: !!context.manifest.icons && context.manifest.icons.every(i => !!i.type),
        category: 'recommended',
      },
      {
        infoString: 'Icons specify their size',
        result: !!context.manifest.icons && context.manifest.icons.every(i => !!i.sizes),
        category: 'recommended',
      },
      {
        infoString: 'Contains an IARC ID',
        result: context.manifest.iarc_rating_id ? true : false,
        category: 'optional',
      },
      {
        infoString: 'Specifies related_applications',
        result:
          context.manifest.related_applications &&
            context.manifest.related_applications.length > 0
            ? true
            : false,
        category: 'optional',
      },
    ];
  }
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

function categoryReport(categories: string[] | undefined) {
  if(categories &&
    categories.length > 0 &&
      !containsStandardCategory(categories)) {
      return 'Contains non-standard categories';
      
  } else {
        return 'Contains categories to classify the app';
  }

} 
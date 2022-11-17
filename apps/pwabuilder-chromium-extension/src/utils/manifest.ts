import { testWebsiteUrl } from "./regex";
import { findBestAppIcon } from "./icons";
import { IconInfo } from "../interfaces/IconInfo";
import { ManifestContext, TestResult } from "../interfaces/manifest";
import { Validation, validateManifest } from "@pwabuilder/manifest-validation";

export function validateScreenshotUrlsList(urls: Array<string | undefined>) {
  const results: Array<boolean> = [];

  const length = urls.length;
  for (let i = 0; i < length; i++) {
    const urlToHandle = urls[i];
    results[i] = urlToHandle ? testWebsiteUrl(urlToHandle) : false;
  }

  return results;
}

const default_results: any[] = [
  {
    infoString: "Web Manifest Properly Attached",
    result: false,
    category: "required",
  },
  {
    infoString: "Lists icons for add to home screen",
    result: false,
    category: "required",
  },
  {
    infoString: "Contains name property",
    result: false,
    category: "required",
  },
  {
    infoString: "Contains short_name property",
    result: false,
    category: "required",
  },
  {
    infoString: "Designates a start_url",
    result: false,
    category: "required",
  },
  {
    infoString: "Specifies a display mode",
    result: false,
    category: "recommended",
  },
  {
    infoString: "Has a background color",
    result: false,
    category: "recommended",
  },
  {
    infoString: "Has a theme color",
    result: false,
    category: "recommended",
  },
  {
    infoString: "Specifies an orientation mode",
    result: false,
    category: "recommended",
  },
  {
    infoString: "Contains screenshots for app store listings",
    result: false,
    category: "recommended",
  },
  {
    infoString: "Has a square PNG icon 512x512 or larger",
    result: false,
    category: "required",
  },
  {
    infoString: "Has a maskable PNG icon",
    result: false,
    category: "recommended",
  },
  {
    infoString: "Lists shortcuts for quick access",
    result: false,
    category: "recommended",
  },
  {
    infoString: "Contains categories to classify the app",
    result: false,
    category: "recommended",
  },
  {
    infoString: "Icons specify their type",
    result: false,
    category: "recommended",
  },
  {
    infoString: "Icons specify their size",
    result: false,
    category: "recommended",
  },
  {
    infoString: "Contains an IARC ID",
    result: false,
    category: "optional",
  },
  {
    infoString: "Specifies related_application",
    result: false,
    category: "optional",
  },
];

export async function runManifestChecks(
  context: ManifestContext
): Promise<Array<TestResult>> {
  if (context.isGenerated === true || !context.manifest) {
    return default_results;
  } else {
    const manifestTests: Validation[] = await validateManifest((context.manifest as any));

    let results = [];

    // bring up with Jaylyn
    for (let i = 0; i <= 17; i++) {
      results.push(
        {
          infoString: manifestTests[i].displayString,
          result: manifestTests[i].valid,
          category: manifestTests[i].category,
          description: manifestTests[i].infoString,
          errorString: manifestTests[i].errorString
        }
      )
    };

    return (results as TestResult[]);
  }
}

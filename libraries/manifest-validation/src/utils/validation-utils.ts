import { Manifest, Validation } from "../interfaces";
import { langCodes, languageCodes } from "../locales";
import { maniTests } from "../validations";

const possibleManiKeys = [
  "background_color",
  "description",
  "dir",
  "display",
  "lang",
  "name",
  "orientation",
  "prefer_related_applications",
  "related_applications",
  "scope",
  "short_name",
  "start_url",
  "theme_color",
  "shortcuts",
  "categories",
  "screenshots",
  "iarc_rating_id",
  "icons",
  "share_target",
  "display_override"
];

export function isStandardOrientation(orientation: string): boolean {
  const standardOrientations = [
    "any",
    "natural",
    "landscape",
    "landscape-primary",
    "landscape-secondary",
    "portrait",
    "portrait-primary",
    "portrait-secondary",
  ];
  return standardOrientations.includes(orientation);
}

// is this valid JSON
export function isValidJSON(json: Manifest): boolean {
  try {
    JSON.parse(JSON.stringify(json));
    return true;
  } catch (e) {
    return false;
  }
}

export async function loopThroughKeys(manifest: Manifest): Promise<Array<Validation>> {
  return new Promise((resolve) => {
      let data: Array<Validation> = [];

      const keys = Object.keys(manifest);

      keys.forEach((key) => {
          maniTests.forEach(async (test) => {
              if (test.member === key && test.test) {
                  const testResult = await test.test(manifest[key]);

  
                  if(testResult){
                    test.valid = true;
                    data.push(test);
                  }
                  else {
                    test.valid = false;
                    data.push(test);
                  }
              }
          })
      })

      resolve(data);
  })
}

export async function findMissingKeys(manifest: Manifest): Promise<Array<string>> {
  return new Promise((resolve) => {
    let data: string[] = [];

    const keys = Object.keys(manifest);

    // find missing possible keys in manifest
    possibleManiKeys.forEach((key) => {
      if (keys.includes(key) === false) {
        data.push(key);
      }
    })

    resolve(data);
  });
}

export async function loopThroughRequiredKeys(manifest: Manifest): Promise<Array<Validation>> {
  return new Promise((resolve) => {
    let data: Array<Validation> = [];

    const keys = Object.keys(manifest);

    keys.forEach((key) => {
      maniTests.forEach(async (test) => {
        if (test.category === "required") {
          if (test.member === key && test.test) {
            const testResult = await test.test(manifest[key]);

            if (testResult === false) {
              test.valid = false;
              data.push(test);
            }
            else {
              test.valid = true;
              data.push(test);
            }
          }
        }
      })
    })

    resolve(data);
  })
}

export async function findSingleField(field: string, value: any): Promise<Validation | boolean | undefined> {
  return new Promise(async (resolve) => {

    // For && operations, true is the base.
    let singleField = true;

    maniTests.forEach((test) => {
      if (test.member === field && test.test) {
        const testResult = test.test(value);

        // If the test passes true && true = true.
        // If the test fails true && false = false
        // If a field has MULTIPLE tests, they will stack
        // ie: true (base) && true (test 1) && false (ie test 2 fails).
        singleField = singleField && testResult;
      }
    });

    resolve(singleField);
  })
}

export function containsStandardCategory(categories: string[]): boolean {
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

export function isValidLanguageCode(code: string){
  // temporary fix that helps with codes like en-US that we don't cover.
  let langUsed = code.split("-")[0];
  let flag = false;

  languageCodes.forEach((lang: langCodes) => {
    if(lang.code === langUsed) {
      flag = true;
    }
  })
  return flag;
}

export const required_fields = ["icons", "name", "short_name", "start_url"];
export const reccommended_fields = ["display", "background_color", "theme_color", "orientation", "screenshots", "shortcuts"];
export const optional_fields = ["iarc_rating_id", "related_applications", "prefer_related_applications", "lang", "dir", "description", "protocol_handlers", "display_override", "share_target", "scope", "categories"];

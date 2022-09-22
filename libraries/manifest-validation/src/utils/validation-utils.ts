import { Manifest, RelatedApplication } from "../interfaces";
import { langCodes, languageCodes } from "../locales";

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

function getDimensions(sizes: string){
  return (sizes || '0x0')
    .split(' ')
    .map(size => {
      const dimensions = size.split('x');
      return {
        width: Number.parseInt(dimensions[0] || '0', 10),
        height: Number.parseInt(dimensions[1] || '0', 10),
      };
    });
}

export function isAtLeast(sizes: string, width: number, height: number): boolean {
  const dimensions = getDimensions(sizes);
  return dimensions.some(i => i.width >= width && i.height >= height);
}

export function validateSingleRelatedApp(ra: RelatedApplication){
  if(!platformOptions.includes(ra.platform)){
    return "platform";
  }

  if(!isValidURL(ra.url!)){
    return "url";
  }

  return "valid";
}

function isValidURL(str: string) {
  // from https://stackoverflow.com/a/14582229 but removed the ip address section
  var pattern = new RegExp(
    '^((https?:)?\\/\\/)?' + // protocol
    '(?:\\S+(?::\\S*)?@)?(([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}' + // domain name
    '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*' + // port and path
    '(\\?[;&a-z\\d%_.~+=-]*)?' + // query string
    '(\\\\#[-a-z\\\\d_]*)?', // fragment locator
    'i' // case insensitive
  );
  return !!pattern.test(str);
}

function isValidRelativeURL(str: string){
  var pattern = new RegExp('^(?!www\.|(?:http|ftp)s?://|[A-Za-z]:\\|//).*');
  return !!pattern.test(str);
}

export function validateSingleProtocol(proto: any){
  let validProtocol = validProtocols.includes(proto.protocol) || proto.protocol.startsWith("web+") || proto.protocol.startsWith("web+")
  if(!validProtocol){
    return "protocol";
  }

  // i guess more importantly we should check if its in the scope of the site.

  let validURL = isValidURL(proto.url) || isValidRelativeURL(proto.url);

  if(!validURL){
    return "url";
  }

  return "valid";
}



const platformOptions: Array<String> = ["windows", "chrome_web_store", "play", "itunes", "webapp", "f-droid", "amazon"]
const validProtocols: Array<String> = ["bitcoin", "dat", "dweb", "ftp", "geo", "gopher", "im", "ipfs", "ipns", "irc", "ircs", "magnet", "mailto", "matrix", "mms", "news", "nntp", "sip", "sms", "smsto", "ssb", "ssh", "tel", "urn", "webcal", "wtai", "xmpp"];
export const required_fields = ["icons", "name", "short_name", "start_url"];
export const reccommended_fields = ["display", "background_color", "theme_color", "orientation", "screenshots", "shortcuts"];
export const optional_fields = ["iarc_rating_id", "related_applications", "prefer_related_applications", "lang", "dir", "description", "protocol_handlers", "display_override", "share_target", "scope", "categories"];
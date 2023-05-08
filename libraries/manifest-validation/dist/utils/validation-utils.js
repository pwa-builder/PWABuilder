import { languageCodes } from "../locales/locales.js";
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
export function isStandardOrientation(orientation) {
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
export function isValidJSON(json) {
    try {
        JSON.parse(JSON.stringify(json));
        return true;
    }
    catch (e) {
        return false;
    }
}
export async function findMissingKeys(manifest) {
    return new Promise((resolve) => {
        let data = [];
        const keys = Object.keys(manifest);
        possibleManiKeys.forEach((key) => {
            if (keys.includes(key) === false) {
                data.push(key);
            }
        });
        resolve(data);
    });
}
export function containsStandardCategory(categories) {
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
export function isValidLanguageCode(code) {
    let langUsed = code.split("-")[0];
    let flag = false;
    languageCodes.forEach((lang) => {
        if (lang.code === langUsed) {
            flag = true;
        }
    });
    return flag;
}
function getDimensions(sizes) {
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
export function isAtLeast(sizes, width, height) {
    const dimensions = getDimensions(sizes);
    return dimensions.some(i => i.width >= width && i.height >= height);
}
export function validateSingleRelatedApp(ra) {
    if (!platformOptions.includes(ra.platform)) {
        return false;
    }
    if (!isValidURL(ra.url)) {
        return false;
    }
    return true;
}
export function isValidURL(str) {
    var pattern = new RegExp('^((https?:)?\\/\\/)?' +
        '(?:\\S+(?::\\S*)?@)?(([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}' +
        '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*' +
        '(\\?[;&a-z\\d%_.~+=-]*)?' +
        '(\\\\#[-a-z\\\\d_]*)?', 'i');
    return !!pattern.test(str);
}
export function checkRelativeUrlBasedOnScope(url, scope) {
    if (scope.endsWith("/") && url.startsWith("/")) {
        return true;
    }
    else if (url.startsWith(scope) || url.startsWith("/")) {
        return true;
    }
    else {
        return false;
    }
}
const platformOptions = ["windows", "chrome_web_store", "play", "itunes", "webapp", "f-droid", "amazon"];
export const validProtocols = ["bitcoin", "dat", "dweb", "ftp", "geo", "gopher", "im", "ipfs", "ipns", "irc", "ircs", "magnet", "mailto", "matrix", "mms", "news", "nntp", "sip", "sms", "smsto", "ssb", "ssh", "tel", "urn", "webcal", "wtai", "xmpp"];
export const required_fields = ["icons", "name", "short_name", "start_url"];
export const recommended_fields = ["display", "background_color", "theme_color", "orientation", "screenshots", "shortcuts"];
export const optional_fields = ["iarc_rating_id", "related_applications", "prefer_related_applications", "lang", "dir", "description", "protocol_handlers", "display_override", "share_target", "scope", "categories", "edge_side_panel"];
//# sourceMappingURL=validation-utils.js.map
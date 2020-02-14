/*
Code below originally from the llama-pack project https://github.com/GoogleChromeLabs/llama-pack/blob/master/src/lib/TwaManifest.ts#L55
*/

const DISALLOWED_ANDROID_PACKAGE_CHARS_REGEX = /[^ a-zA-Z0-9_\.]/;

export function generatePackageId(host: string): string {
  const parts = host.split('.').reverse();
  parts.push('twa');
  return parts.join('.').replace(DISALLOWED_ANDROID_PACKAGE_CHARS_REGEX, '_');
}
export const websiteRegex =
  /((([A-Za-z]{3,9}:(?:\/\/)?)(?:[-;:&=\+\$,\w]+@)?[A-Za-z0-9.-]+|(?:www.|[-;:&=\+\$,\w]+@)?[A-Za-z0-9.-]+)((?:\/[\+~%\/.\w\-_]*)?\??(?:[-\+=&;%@.\w_]*)#?(?:[\w]*))?)/;

export function testRegex(str: string, regex: RegExp): boolean {
  return regex.test(str);
}

export function testWebsiteUrl(str: string): boolean {
  return testRegex(str, websiteRegex);
}
export function testRegex(str: string, regex: RegExp): boolean {
  return regex.test(str);
}

export function testEmail(str: string): boolean {
  return testRegex(str, emailRegex);
}

export function testWebsiteUrl(str: string): boolean {
  return testRegex(str, websiteRegex);
}

import { getURL } from "../services/app-info";

export function getReportErrorUrl(errorMessage: string, platform: string): string {
  if (!errorMessage) {
    return "https://github.com/pwa-builder/pwabuilder/issues/new";
  }

  console.log('error message in error', errorMessage);
  const title = encodeURIComponent(`Error generating ${platform} package`);
  const message = encodeURIComponent(
    `I received the following error when generating a package for ${
      getURL() || "my app"
    }\n\n${errorMessage}`
  );
  return `https://github.com/pwa-builder/pwabuilder/issues/new?title=${title}&body=${message}`;
}
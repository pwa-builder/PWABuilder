import { getURL } from '../services/app-info';

export function getReportErrorUrl(
  errorMessage: string | Object,
  platform: string
): string {
  if (!errorMessage) {
    return 'https://github.com/pwa-builder/pwabuilder/issues/new';
  }

  // We must trim the error message to 2000 chars. Otherwise, very long error
  // messages + stack traces will cause Github to say, "Whoa there, URL is too long"
  const gitHubErrorMessageMaxLength = 2000;
  const errorMessageTrimmed = errorMessage
    .toString()
    .substring(0, gitHubErrorMessageMaxLength);
  const title = encodeURIComponent(`Error generating ${platform} package`);
  const message = encodeURIComponent(
    `I received the following error when generating a package for ${
      getURL() || 'my app'
    }\n\n${errorMessageTrimmed}`
  );

  return `https://github.com/pwa-builder/pwabuilder/issues/new?title=${title}&body=${message}`;
}

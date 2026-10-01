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
  const errorMessageTrimmed = redactSigningSecrets(
    errorMessage.toString()
  ).substring(0, gitHubErrorMessageMaxLength);
  const title = encodeURIComponent(`Error generating ${platform} package`);
  const message = encodeURIComponent(
    `I received the following error when generating a package for ${
      getURL() || 'my app'
    }\n\n${errorMessageTrimmed}`
  );

  return `https://github.com/pwa-builder/pwabuilder/issues/new?title=${title}&body=${message}`;
}

/**
 * Redacts signing secrets (key alias, keystore password, key password) from an error message
 * so they aren't leaked when the message is used to create a public GitHub issue.
 * @param message The error message that may contain apksigner arguments with secrets.
 * @returns The message with any secret values replaced by asterisks.
 */
export function redactSigningSecrets(message: string): string {
  if (!message) {
    return message;
  }

  // Matches apksigner-style args, e.g. --ks-pass pass:"secret", --key-pass pass:secret,
  // --ks-key-alias "my-key-alias", as well as the pass:file/env variants.
  const secretArgPattern =
    /(--(?:ks-key-alias|ks-pass|key-pass|ks-key-pass)[=\s]+(?:(?:pass|file|env):)?)("[^"]*"|'[^']*'|\S+)/gi;
  return message.replace(secretArgPattern, (_match, prefix: string, value: string) => {
    const quote = value.startsWith('"') ? '"' : value.startsWith("'") ? "'" : '';
    return `${prefix}${quote}****${quote}`;
  });
}

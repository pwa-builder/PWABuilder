import chalk from "chalk";

const lavender: chalk.Chalk = chalk.hex('#cc99ff');
const purple: chalk.Chalk = chalk.hex('#9966ff');

export function formatCodeSnippet(text: string): string {
  return lavender.bold(text);
}

export function formatEmphasis(text: string): string {
  return purple.bold(text);
}

export function formatEmphasisStrong(text: string): string {
  return purple.inverse(text);
}

export function formatErrorEmphasisStrong(text: string): string {
  return chalk.red.inverse(text);
}

export function formatErrorEmphasisWeak(text: string): string {
  return chalk.bold.red(text);
}

export function formatSuccessEmphasis(text: string): string {
  return chalk.greenBright(text);
}
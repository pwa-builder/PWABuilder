import chalk from "chalk";

const lavender: chalk.Chalk = chalk.hex('#cc99ff');
const purple: chalk.Chalk = chalk.hex('#9966ff');

export function formatCodeSnippet(text: string): string {
  return lavender.bold(text);
}

export function formatEmphasis(text: string): string {
  return purple.bold(text);
}

export function formatErrorEmphasis(text: string): string {
  return chalk.bgRed(text);
}

export function formatSuccessEmphasis(text: string): string {
  return chalk.greenBright(text);
}
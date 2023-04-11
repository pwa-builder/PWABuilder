#!/usr/bin/env node

import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';

const termsString: string = `Privacy Statement: 
https://privacy.microsoft.com/en-us/privacystatement
Terms of Use: 
https://github.com/pwa-builder/PWABuilder/blob/master/TERMS_OF_USE.md`;
yargs(hideBin(process.argv))
  .commandDir('commands')
  .scriptName('pwa')
  .strict()
  .epilog(termsString)
  .alias({ h: 'help' })
  .command('$0', `Displays help command.`, () => {}, (argv) => {
    yargs.showHelp();
  })
  .argv;
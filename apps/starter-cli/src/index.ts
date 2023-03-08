#!/usr/bin/env node

import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';

yargs(hideBin(process.argv))
  .commandDir('commands')
  .scriptName('pwa')
  .strict()
  .alias({ h: 'help' })
  .argv;
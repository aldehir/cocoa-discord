import * as yargs from 'yargs'

const args = yargs
  .alias('c', 'config')
  .nargs('c', 1)
  .describe('c', 'Load configuration')
  .default('c', './cocoa.json')
  .count('verbose')
  .alias('v', 'verbose')
  .describe('v', 'Output more details')
  .help('h')
  .alias('h', 'help')
  .argv

console.log(args)

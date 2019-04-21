#!/usr/bin/env node
import * as yargs from 'yargs'
import * as path from 'path'
import * as fs from 'fs'

import logger from './logger'
import Cocoa from './cocoa'

function parseArguments () {
  const parser = yargs
    .alias('h', 'help')
    .help('h')

  parser
    .alias('c', 'config')
    .nargs('c', 1)
    .describe('c', 'Load configuration')
    .default('c', './cocoa.json')

  parser
    .count('verbose')
    .alias('v', 'verbose')
    .describe('v', 'Output more details')

  return parser.argv
}

const args = parseArguments()

let configContents = fs.readFileSync(args.config as string)
let config = JSON.parse(configContents.toString('utf8'))

if (config.token === undefined) {
  logger.error("No token in configuration file")
  process.exit(1)
}

if (!config.services || !config.services.googleAPIKey) {
  logger.error("No Google API Key found in configuration file")
  process.exit(1)
}

let cocoa = new Cocoa({
  token: config.token as string,
  google: {
    apiKey: config.services.googleAPIKey
  }
})

cocoa.run()

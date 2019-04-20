import yargsParser from 'yargs-parser'

const COMMAND_REGEX = /^([^\s]+)\s*(.*)$/

export interface CommandArguments {
  _: string[]
  [argName: string]: any
}

export interface Command {
  name: string
  args: CommandArguments
}

export interface ParserOptions {
  prefix?: string
}

export default class Parser {
  readonly prefix: string = '!'

  constructor(opts: ParserOptions) {
    if (opts.prefix) {
      this.prefix = opts.prefix
    }
  }

  parse(text: string): Command | null {
    let split = this.stripPrefixAndSplit(text)
    if (split === null) {
      return null;
    }

    let [name, argsString] = split
    let yargs = yargsParser(argsString)

    return {
      name: name,
      args: yargs
    }
  }

  private stripPrefixAndSplit(text: string): [string, string] | null {
    if (!text.startsWith(this.prefix)) {
      return null
    }

    let stripped = text.slice(this.prefix.length)

    let match = stripped.match(COMMAND_REGEX)
    if (match === null) {
      return null
    }

    return [match[1], match[2]]
  }
}

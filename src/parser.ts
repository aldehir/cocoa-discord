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
  prefix: string
}


const defaults: ParserOptions = {
  prefix: '!'
}

export default class Parser {
  opts: ParserOptions

  constructor(opts: ParserOptions) {
    this.opts = Object.assign({}, defaults, opts)
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
    if (!text.startsWith(this.opts.prefix)) {
      return null
    }

    let stripped = text.slice(this.opts.prefix.length)

    let match = stripped.match(COMMAND_REGEX)
    if (match === null) {
      return null
    }

    return [match[1], match[2]]
  }
}

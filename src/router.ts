import { EventEmitter } from 'events'
import { Message } from 'discord.js'

import Parser, { Command, ParserOptions } from './parser'

type RouteCallback = (command: Command, ...extras: any[]) => void

export default class Router {
  readonly emitter: EventEmitter
  readonly parser: Parser

  constructor(parserOptions: ParserOptions = {}) {
    this.emitter = new EventEmitter()
    this.parser = new Parser(parserOptions)
  }

  route(command: string, callback: RouteCallback) {
    this.emitter.on(command, callback)
  }

  unroute(command: string, callback: RouteCallback) {
    this.emitter.removeListener(command, callback)
  }

  process(text: string, ...extras: any[]) {
    let result = this.parser.parse(text)
    if (result === null) {
      return
    }

    let command = result as Command
    this.emitter.emit(command.name, command, ...extras)
  }
}

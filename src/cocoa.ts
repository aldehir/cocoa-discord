import * as Discord from 'discord.js'

import logger from './logger'
import Router from './router'
import { Command } from './parser'

import Service from './service'
import TimeService, { GoogleTimeAPI } from './services/time'

interface CocoaConfig {
  token: string
  google: GoogleAPIConfig
  prefix?: string
}

interface GoogleAPIConfig {
  apiKey: string
}

export default class Cocoa {
  readonly token: string
  readonly prefix: string

  private client: Discord.Client
  private router: Router
  private services: Service[]

  constructor(config: CocoaConfig) {
    this.token = config.token
    this.prefix = config.prefix || '!'

    this.client = new Discord.Client()
    this.router = new Router({ prefix: this.prefix })
    this.services = [
      new TimeService(new GoogleTimeAPI(config.google.apiKey))
    ]

    this.setupClient()
    this.setupRouter()
    this.setupServices()
  }

  run() {
    this.client.login(this.token)
    logger.info('Cocoa running')
  }

  private setupClient() {
    this.client.on("message", this.processMessage.bind(this))
  }

  private setupRouter() {
    this.router.route('help', this.onHelp.bind(this))
  }

  private setupServices() {
    this.services.forEach(x => x.inject(this.router))
  }

  private processMessage(msg: Discord.Message) {
    logger.info(`Received message '${msg.content}' from ${msg.author.username}`)
    this.router.process(msg.content, msg)
  }

  private onHelp(command: Command, msg: any) {
    let message = msg as Discord.Message 
    message.channel.sendCode('text', `usage: ${this.prefix}help`)
  }
}

import * as Discord from 'discord.js'

import logger from './logger'

interface CocoaConfig {
  token: string
}

export default class Cocoa {
  config: CocoaConfig
  client: Discord.Client

  constructor(config: CocoaConfig) {
    this.config = config
    this.client = new Discord.Client()
    this.setup()
  }

  private setup() {
    this.client.on("message", (msg) => {
      if (msg.content == "ping") {
        logger.info(`Received ping from ${msg.author.username} in ${msg.guild.name}#${msg.channel.id}`)
        msg.reply("pong")
      }
    })
  }

  run() {
    this.client.login(this.config.token)
    logger.info('Cocoa running')
  }
}

import * as winston from 'winston'

import { format } from 'logform'

export default winston.createLogger({
  level: 'info',
  transports: [
    new winston.transports.Console({
      format: format.combine(
        format.colorize(),
        format.timestamp(),
        format.align(),
        format.printf(info => `${info.level} ${info.timestamp}: ${info.message}`)
      )
    })
  ]
})

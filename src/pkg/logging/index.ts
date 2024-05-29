import winston from 'winston';

import { config } from '~/pkg/env';

winston.addColors({
  error: 'redBright',
  warn: 'orange',
  info: 'green',
  debug: 'cyan',
});

export const logger = winston.createLogger({
  format:
    config.ENVIRONMENT === 'development'
      ? winston.format.combine(
          winston.format.colorize(),
          winston.format.simple(),
          winston.format.errors({ stack: true }),
        )
      : winston.format.combine(
          winston.format.timestamp(),
          winston.format.json(),
          winston.format.errors({ stack: true }),
        ),
  transports: [new winston.transports.Console()],
  level: config.LOG_LEVEL,
});

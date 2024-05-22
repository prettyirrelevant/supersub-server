import { type Options, pinoHttp } from 'pino-http';
import { StatusCodes } from 'http-status-codes';

import { LogLevel } from '~/pkg/logging';
import { config } from '~/pkg/env';

export const requestLoggerMiddleware = (options?: Options) => {
  return pinoHttp({
    customLogLevel: (_req, res, err?: Error) => {
      if (err || res.statusCode >= StatusCodes.INTERNAL_SERVER_ERROR) return LogLevel.Error;
      if (res.statusCode >= StatusCodes.BAD_REQUEST) return LogLevel.Warn;
      if (res.statusCode >= StatusCodes.MULTIPLE_CHOICES) return LogLevel.Silent;
      return LogLevel.Info;
    },
    serializers:
      config.ENVIRONMENT !== 'production'
        ? {
            req: (req) => ({ method: req.method, url: req.url }),
            res: (res) => ({ status: res.statusCode }),
          }
        : undefined,
    customErrorMessage: (_req, res) => `request errored with status code: ${res.statusCode}`,
    customReceivedMessage: (req) => `request received: ${req.method}`,
    ...options,
  });
};

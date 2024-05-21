import express, { type NextFunction, type Application, type Response, type Request } from 'express';
import { StatusCodes } from 'http-status-codes';
import pinoHttp from 'pino-http';
import helmet from 'helmet';
import cors from 'cors';

import { type SuccessResponse } from './pkg/responses';
import { handleError, ApiError } from './pkg/errors';
import { ConsoleLogger } from './pkg/logging';
import env from './pkg/env';

export const application: Application = express();
export const logger = new ConsoleLogger({ level: env.LOG_LEVEL });

application.use(helmet());
application.use(cors());
application.use(pinoHttp({ logger: logger.getInstance() }));
application.use(express.json());

application.get('/', (req: Request, res: Response<SuccessResponse>) => {
  return res.status(StatusCodes.OK).json({ data: { ping: 'pong' } });
});

application.use((_req: Request, _res: Response, next: NextFunction) => {
  next(
    new ApiError(StatusCodes.NOT_FOUND, {
      message: 'The page you requested cannot be found. Perhaps you mistyped the URL or the page has been moved.',
    }),
  );
});

application.use(handleError);

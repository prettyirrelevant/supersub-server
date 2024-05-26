import express, { type NextFunction, type Application, type Response, type Request } from 'express';
import { StatusCodes } from 'http-status-codes';
import helmet from 'helmet';
import cors from 'cors';

import { requestLoggerMiddleware } from '~/middlewares/requestLogger';
import { bullBoardMiddleware } from '~/middlewares/bullBoard';
import { ConsoleLogger, LogLevel } from '~/pkg/logging';
import { type SuccessResponse } from '~/pkg/responses';
import { handleError, ApiError } from '~/pkg/errors';
import { queue } from '~/pkg/bullmq';
import { config } from '~/pkg/env';
import { prisma } from '~/pkg/db';

import { privyAuthenticationMiddleware } from './middlewares/auth';
import { generateApiKeyPair } from './utils';

export const application: Application = express();
export const logger = new ConsoleLogger({ level: config.LOG_LEVEL as LogLevel });

application.use(cors());
application.use(helmet());
application.use(express.json());
application.use(requestLoggerMiddleware({ logger: logger.getInstance() }));
application.use('/ui', bullBoardMiddleware());

application.get('/', async (req: Request, res: Response<SuccessResponse>) => {
  await queue.add('new-job', { foo: 'bar' });
  return res.status(StatusCodes.OK).json({ data: { ping: 'pong' } });
});

application.post(
  '/api/api-keys',
  privyAuthenticationMiddleware,
  async (req: Request, res: Response<SuccessResponse>) => {
    const address = req.auth.address;
    const apiKey = await prisma.apiKey.findFirst({ where: { accountAddress: address } });
    if (apiKey) {
      return res.status(StatusCodes.BAD_REQUEST).json({ data: { error: 'apiKey already exists for this user' } });
    }
    const { secretKey, publicKey } = generateApiKeyPair();
    await prisma.apiKey.create({
      data: {
        account: {
          connect: { smartAccountAddress: address },
        },
        publicKey: publicKey,
        secretKey: secretKey,
      },
    });
    return res.status(StatusCodes.CREATED).json({ data: { publicKey: publicKey, secretKey: secretKey } });
  },
);

application.post(
  '/api/api-keys/reset',
  privyAuthenticationMiddleware,
  async (req: Request, res: Response<SuccessResponse>) => {
    const address = req.auth.address;
    const { secretKey, publicKey } = generateApiKeyPair();
    await prisma.apiKey.upsert({
      create: {
        account: {
          connect: { smartAccountAddress: address },
        },
        publicKey: publicKey,
        secretKey: secretKey,
      },
      update: {
        publicKey: publicKey,
        secretKey: secretKey,
      },
      where: { accountAddress: address },
    });
    return res.status(StatusCodes.OK).json({ data: { publicKey: publicKey, secretKey: secretKey } });
  },
);

application.use((_req: Request, _res: Response, next: NextFunction) => {
  next(
    new ApiError(StatusCodes.NOT_FOUND, {
      message: 'The page you requested cannot be found. Perhaps you mistyped the URL or the page has been moved.',
    }),
  );
});

application.use(handleError);

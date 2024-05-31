import express, { type NextFunction, type Application, type Response, type Request } from 'express';
import { TransactionType, Prisma } from '@prisma/client';
import { StatusCodes } from 'http-status-codes';
import helmet from 'helmet';
import cors from 'cors';

import { type SuccessResponse, successResponse } from '~/pkg/responses';
import { requestLoggerMiddleware } from '~/middlewares/requestLogger';
import { bullBoardMiddleware } from '~/middlewares/bullBoard';
import { handleError, ApiError } from '~/pkg/errors';
import { prisma } from '~/pkg/db';

import { privyAuthenticationMiddleware } from './middlewares/auth';
import { generateApiKeyPair } from './utils';

export const application: Application = express();

application.use(cors());
application.use(helmet());
application.use(express.json());
application.use(requestLoggerMiddleware());
application.use('/ui', bullBoardMiddleware());

application.get('/', async (req: Request, res: Response<SuccessResponse>) => {
  return successResponse(res, { ping: 'pong' }, StatusCodes.OK);
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

application.get(
  '/api/transactions',
  privyAuthenticationMiddleware,
  async (req: Request, res: Response<SuccessResponse>) => {
    const address = req.auth.address;
    const { offset = '0', limit = '10', reference, product } = req.query;

    const where: Prisma.TransactionWhereInput = {
      OR: [
        {
          AND: [{ sender: address }, { type: TransactionType.WITHDRAWAL }],
        },
        {
          AND: [{ recipient: address }, { type: TransactionType.DEPOSIT }],
        },
      ],
    };

    if (reference) {
      where.subscriptionOnchainReference = parseInt(reference as string);
    }
    if (product) {
      where.subscription = {
        product: {
          name: product as string,
        },
      };
    }

    const skip = parseInt(offset as string);
    const take = parseInt(limit as string);
    const transactions = await prisma.transaction.findMany({
      where: where,
      take: take,
      skip: skip,
    });
    return res.status(StatusCodes.OK).json({ data: { transactions } });
  },
);

application.get(
  '/api/subscriptions',
  privyAuthenticationMiddleware,
  async (req: Request, res: Response<SuccessResponse>) => {
    const address = req.auth.address;
    const { isActive } = req.query;

    const where: Prisma.SubscriptionWhereInput = {
      subscriberAddress: address,
    };
    if (isActive) {
      where.isActive = ['true', '1'].includes(isActive.toString().toLowerCase())
        ? true
        : ['false', '0'].includes(isActive.toString().toLowerCase())
          ? false
          : undefined;
    }

    const subscriptions = await prisma.subscription.findMany({
      include: { product: true, plan: true },
      where: where,
    });

    return res.status(StatusCodes.OK).json({ data: { subscriptions: subscriptions } });
  },
);

application.get(
  '/api/products',
  privyAuthenticationMiddleware,
  async (req: Request, res: Response<SuccessResponse>) => {
    const address = req.auth.address;
    const products = await prisma.product.findMany({
      include: { creator: true, plans: true },
      where: { creatorAddress: address },
    });
    return res.status(StatusCodes.OK).json({ data: { products: products } });
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

import express, { type NextFunction, type Application, type Response, type Request } from 'express';
import { TransactionType, Prisma } from '@prisma/client';
import { StatusCodes } from 'http-status-codes';
import { Network } from 'alchemy-sdk';
import { formatEther } from 'viem';
import helmet from 'helmet';
import cors from 'cors';

import { combinedAuthenticationMiddleware, privyAuthenticationMiddleware } from '~/middlewares/auth';
import { type SuccessResponse, successResponse } from '~/pkg/responses';
import { requestLoggerMiddleware } from '~/middlewares/requestLogger';
import { AlchemyWebhookEvent, generateApiKeyPair } from '~/utils';
import { bullBoardMiddleware } from '~/middlewares/bullBoard';
import { handleError, ApiError } from '~/pkg/errors';
import { getAlchemyClient } from '~/pkg/evm';
import { prisma } from '~/pkg/db';

import { queue } from './pkg/bullmq';

export const application: Application = express();

application.use(cors());
application.use(helmet());
application.use(express.json());
application.use(requestLoggerMiddleware());
application.use('/ui', bullBoardMiddleware());

application.get('/', async (req: Request, res: Response<SuccessResponse>) => {
  return successResponse(res, { ping: 'pong' }, StatusCodes.OK);
});

application.get(
  '/api/balances',
  privyAuthenticationMiddleware,
  async (req: Request, res: Response<SuccessResponse>, next: NextFunction) => {
    const address = req.auth.address;
    const alchemyClient = getAlchemyClient(Network.MATIC_AMOY);

    try {
      const nativeBalance = await alchemyClient.core.getBalance(address);
      const tokenBalances = await alchemyClient.core.getTokensForOwner(address);
      return successResponse(
        res,
        { nativeBalance: formatEther(nativeBalance.toBigInt()), tokenBalances },
        StatusCodes.OK,
      );
    } catch (e) {
      next(e);
      return;
    }
  },
);

application.get(
  '/api/api-keys',
  privyAuthenticationMiddleware,
  async (req: Request, res: Response<SuccessResponse>, next: NextFunction) => {
    const address = req.auth.address;
    const apiKey = await prisma.apiKey.findFirst({ where: { accountAddress: address } });
    if (!apiKey) {
      next(new ApiError(StatusCodes.NOT_FOUND, { message: 'apiKey does not exist for this user' }));
      return;
    }
    return successResponse(res, { publicKey: apiKey.publicKey, secretKey: apiKey.secretKey }, StatusCodes.OK);
  },
);

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
    return successResponse(res, { publicKey, secretKey }, StatusCodes.CREATED);
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
    return successResponse(res, { publicKey, secretKey }, StatusCodes.OK);
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
      include: { subscription: { include: { product: true } }, token: true },
      where: where,
      take: take,
      skip: skip,
    });
    return successResponse(res, { transactions }, StatusCodes.OK);
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
      include: { product: { include: { token: true } }, plan: true },
      where: where,
    });

    return successResponse(res, { subscriptions }, StatusCodes.OK);
  },
);

application.get(
  '/api/products',
  combinedAuthenticationMiddleware,
  async (req: Request, res: Response<SuccessResponse>) => {
    const address = req.auth.address;
    const products = await prisma.product.findMany({
      include: { _count: { select: { subscriptions: true } }, creator: true, plans: true, token: true },
      where: { creatorAddress: address },
    });

    return successResponse(res, { products }, StatusCodes.OK);
  },
);

application.get(
  '/api/products/:reference',
  combinedAuthenticationMiddleware,
  async (req: Request, res: Response<SuccessResponse>) => {
    const address = req.auth.address;
    const product = await prisma.product.findUnique({
      include: { _count: { select: { subscriptions: true } }, creator: true, plans: true, token: true },
      where: { onchainReference: Number(req.params.reference), creatorAddress: address },
    });

    return successResponse(res, { product }, StatusCodes.OK);
  },
);

application.post('/_webhook', async (req: Request, res: Response<SuccessResponse>) => {
  const webhookEvent = req.body as AlchemyWebhookEvent;
  await queue.add('alchemy-address-activity', { webhook: webhookEvent });

  return successResponse(res, {}, StatusCodes.OK);
});

application.use((_req: Request, _res: Response, next: NextFunction) => {
  next(
    new ApiError(StatusCodes.NOT_FOUND, {
      message: 'The page you requested cannot be found. Perhaps you mistyped the URL or the page has been moved.',
    }),
  );
});

application.use(handleError);

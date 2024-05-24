import { NextFunction, Response, Request } from 'express';
import { StatusCodes } from 'http-status-codes';

import { errorResponse } from '~/pkg/responses';
import { prisma } from '~/pkg/db';

export const apiKeyAuthenticationMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  const apiKey = req.header('x-api-key');
  if (!apiKey) {
    return errorResponse(res, 'API key is missing', StatusCodes.UNAUTHORIZED);
  }

  const isValid = apiKey.startsWith('sk_') || apiKey.startsWith('pk_');
  if (!isValid) {
    return errorResponse(res, 'Invalid API key provided', StatusCodes.BAD_REQUEST);
  }

  try {
    const apiKeyInDb = await prisma.apiKey.findFirst({
      where: { OR: [{ secretKey: apiKey }, { publicKey: apiKey }] },
      include: { account: true },
    });
    if (!apiKeyInDb) {
      return errorResponse(res, 'Invalid API key provided', StatusCodes.BAD_REQUEST);
    }

    req.auth = {
      apiKey: apiKey.startsWith('pk_') ? 'public' : apiKey.startsWith('sk_') ? 'secret' : null,
      account: apiKeyInDb.account,
      method: 'api-key',
    };

    next();
  } catch {
    return errorResponse(res, 'Invalid API key provided', StatusCodes.BAD_REQUEST);
  }
};

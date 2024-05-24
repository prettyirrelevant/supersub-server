import { NextFunction, Response, Request } from 'express';
import { StatusCodes } from 'http-status-codes';
import { polygonAmoy } from '@alchemy/aa-core';

import { getMultiOwnerModularAccountAddresses } from '~/pkg/evm';
import { errorResponse } from '~/pkg/responses';
import { privy } from '~/pkg/privy';
import { prisma } from '~/pkg/db';

export const privyAuthenticationMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  const authorizationHeader = req.header('authorization');
  if (!authorizationHeader) {
    return errorResponse(res, 'Authorization header is missing', StatusCodes.UNAUTHORIZED);
  }

  const [type, accessToken] = authorizationHeader.split(' ');
  if (type !== 'Bearer') {
    return errorResponse(res, 'Invalid authorization header provided', StatusCodes.BAD_REQUEST);
  }

  let verifiedClaims;
  try {
    verifiedClaims = await privy.verifyAuthToken(accessToken);
  } catch (e) {
    return errorResponse(res, 'Invalid authorization header provided', StatusCodes.BAD_REQUEST);
  }

  try {
    let account = await prisma.account.findFirst({
      where: { metadata: { equals: verifiedClaims.userId, path: ['privyDid'] } },
    });
    if (!account) {
      const privyUser = await privy.getUser(verifiedClaims.userId);
      const privyAddress = privyUser.wallet?.address as `0x${string}`;
      const smartAccountAddresses = await getMultiOwnerModularAccountAddresses(polygonAmoy, [privyAddress]);

      account = await prisma.account.create({
        data: {
          smartAccountAddress: smartAccountAddresses[privyAddress],
          emailAddress: privyUser.email?.address as string,
          metadata: { privyDid: privyUser.id },
          eoaAddress: privyAddress,
        },
      });
    }

    req.auth = {
      method: 'access-token',
      account: account,
      apiKey: null,
    };

    next();
  } catch {
    return errorResponse(res, 'Invalid authorization header provided', StatusCodes.BAD_REQUEST);
  }
};

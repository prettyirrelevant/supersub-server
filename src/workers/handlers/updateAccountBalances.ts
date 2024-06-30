import { formatEther, zeroAddress, Chain } from 'viem';
import { Network } from 'alchemy-sdk';

import { getAlchemyClient, formatBalance } from '~/pkg/evm';
import { logger } from '~/pkg/logging';
import { prisma } from '~/pkg/db';

export const updateHourlyBalances = async (chain: Chain) => {
  try {
    logger.info('Checking for account balances to update');
    const alchemyClient = getAlchemyClient(Network.BASE_SEPOLIA);
    const accounts = await prisma.account.findMany();

    const balanceData = await Promise.all(
      accounts.map(async (account) => {
        const nativeBalance = await alchemyClient.core.getBalance(account.smartAccountAddress);
        const tokenBalancesResponse = await alchemyClient.core.getTokenBalances(account.smartAccountAddress);

        const tokenBalances = await Promise.all(
          tokenBalancesResponse.tokenBalances.map((t) => formatBalance(chain, t)),
        );

        const balances = {
          [zeroAddress]: formatEther(nativeBalance.toBigInt()),
          ...Object.fromEntries(tokenBalances),
        };

        return {
          accountAddress: account.smartAccountAddress,
          balances: balances,
        };
      }),
    );

    await prisma.$transaction([
      prisma.accountBalance.createMany({
        skipDuplicates: true,
        data: balanceData,
      }),
    ]);
  } catch (error) {
    logger.error(error, { description: 'Error updating account balances' });
  }
};

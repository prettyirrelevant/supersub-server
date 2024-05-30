import { type Chain } from 'viem/chains';
import { erc20Abi } from 'viem';

import { getEvmHttpClient } from '~/pkg/evm';
import { prisma } from '~/pkg/db';

export const enrichERC20Tokens = async (chain: Chain) => {
  const tokens = await prisma.token.findMany({ where: { decimals: null } });

  const client = getEvmHttpClient(chain);
  const calls = tokens.map((token) => {
    const contract = { address: token.address as `0x${string}`, abi: erc20Abi } as const;

    return [
      { ...contract, functionName: 'decimals' },
      { ...contract, functionName: 'symbol' },
    ];
  });
  const results = await client.multicall({ contracts: calls.flat() });

  const dbActions = [];
  for (let i = 0; i < results.length; i += 2) {
    const [decimalsResult, symbolResult] = results.slice(i, i + 2);
    if (decimalsResult.status !== 'success' || symbolResult.status !== 'success') {
      continue;
    }

    dbActions.push(
      prisma.token.update({
        data: { decimals: Number(decimalsResult.result), symbol: symbolResult.result as string },
        where: { address: tokens[i / 2].address },
      }),
    );
  }

  await prisma.$transaction(dbActions);
};

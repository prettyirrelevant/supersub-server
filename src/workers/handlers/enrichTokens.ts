import { type Chain } from 'viem/chains';
import { erc20Abi } from 'viem';

import { getEvmHttpClient } from '~/pkg/evm';
import { prisma } from '~/pkg/db';

export const enrichERC20Tokens = async (chain: Chain) => {
  const tokens = await prisma.token.findMany({ where: { decimals: 0 } });

  const client = getEvmHttpClient(chain);
  const calls = tokens.map((token) => {
    const contract = { address: token.address as `0x${string}`, abi: erc20Abi } as const;

    return { ...contract, functionName: 'decimals' };
  });

  const results = await client.multicall({ contracts: calls });
  results.forEach(async (result, index) => {
    if (result.status === 'success') {
      await prisma.token.update({
        where: { address: tokens[index].address },
        data: { decimals: Number(result.result) },
      });
    }
  });
};

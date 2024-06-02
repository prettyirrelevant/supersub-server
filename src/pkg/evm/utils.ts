import {
  getDefaultMultiOwnerModularAccountFactoryAddress,
  MultiOwnerModularAccountFactoryAbi,
} from '@alchemy/aa-accounts';
import { createPublicClient, fromHex, http } from 'viem';
import { Alchemy, Network } from 'alchemy-sdk';
import { getChain } from '@alchemy/aa-core';
import { type Chain } from 'viem/chains';
import dayjs from 'dayjs';

import { config } from '~/pkg/env';

export const getAlchemyClient = (network: Network) => {
  return new Alchemy({ apiKey: config.ALCHEMY_API_KEY, network });
};

export const getEvmHttpClient = (chain: Chain) => {
  return createPublicClient({ transport: http(), chain });
};

export const getMultiOwnerModularAccountAddresses = async (chain: Chain, owners: `0x${string}`[]) => {
  const client = getEvmHttpClient(chain);
  const viemToAlchemyChain = getChain(chain.id);
  const factoryAddress = getDefaultMultiOwnerModularAccountFactoryAddress(viemToAlchemyChain);
  const factoryContract = { abi: MultiOwnerModularAccountFactoryAbi, address: factoryAddress } as const;

  const calls = owners.map((owner) => ({
    ...factoryContract,
    functionName: 'getAddress',
    args: [0n, [owner]],
  }));

  const results = await client.multicall({ contracts: calls });
  return results.reduce(
    (acc, result, index) => {
      if (result.status === 'success') {
        acc[owners[index]] = result.result as `0x${string}`;
      }
      return acc;
    },
    {} as Record<`0x${string}`, `0x${string}`>,
  );
};

export const hexToString = (hex: `0x${string}`): string => fromHex(hex, 'string');

export const solidityTimestampToDateTime = (ts: bigint): Date => {
  return dayjs.unix(Number(ts)).toDate();
};

export const bytes32ToText = (hex: `0x${string}`): string => fromHex(hex, { to: 'string', size: 32 });

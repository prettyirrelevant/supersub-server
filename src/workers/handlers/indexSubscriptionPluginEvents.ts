import { type PublicClient, decodeEventLog } from 'viem';
import { type Chain } from 'viem/chains';

import {
  SUBSCRIPTION_PLUGIN_INIT_BLOCK,
  SUBSCRIPTION_PLUGIN_ADDRESS,
  SubscriptionPluginAbi,
  getEvmHttpClient,
  CHUNK_SIZE,
} from '~/pkg/evm';
import { getRanges } from '~/utils';
import { prisma } from '~/pkg/db';

export const indexSubscriptionPluginEvents = async (chain: Chain) => {
  const client = getEvmHttpClient(chain);
  const lastQueriedBlockCache = await prisma.cache.upsert({
    create: {
      value: SUBSCRIPTION_PLUGIN_INIT_BLOCK.toString(),
    },
    where: {
      key: 'last-queried-block',
    },
  });

  const lastQueriedBlock = BigInt(lastQueriedBlockCache.value);
  const latestBlock = await client.getBlockNumber();

  const ranges: [bigint, bigint][] = getRanges(Number(lastQueriedBlock), Number(latestBlock), CHUNK_SIZE);
  const eventPromises = await Promise.allSettled(
    ranges.map(([start, end]) => getSubscriptionPluginEvents(client, start, end)),
  );
  const events = eventPromises.filter((event) => event.status === 'fulfilled');
  // now based on the topic of the event, store in the database.

  await prisma.cache.update({
    data: {
      value: latestBlock.toString(),
    },
    where: {
      key: 'last-queried-block',
    },
  });
};

const getSubscriptionPluginEvents = async (client: PublicClient, from: bigint, to: bigint) => {
  const logs = await client.getContractEvents({
    address: SUBSCRIPTION_PLUGIN_ADDRESS,
    abi: SubscriptionPluginAbi,
    fromBlock: from,
    toBlock: to,
  });

  return logs.map((log) => ({
    decoded: decodeEventLog({ abi: SubscriptionPluginAbi, topics: log.topics, data: log.data }),
    raw: log,
  }));
};

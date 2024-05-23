import { decodeEventLog, type Log } from 'viem';
import { type Chain } from 'viem/chains';

import {
  SUBSCRIPTION_PLUGIN_INIT_BLOCK,
  SUBSCRIPTION_PLUGIN_ADDRESS,
  SubscriptionPluginAbi,
  getEvmHttpClient,
  hexToString,
  CHUNK_SIZE,
} from '~/pkg/evm';
import { getRanges } from '~/utils';
import { prisma } from '~/pkg/db';

export const indexSubscriptionPluginEvents = async (chain: Chain) => {
  const client = getEvmHttpClient(chain);
  const lastQueriedBlockCache = await prisma.cache.upsert({
    create: {
      value: SUBSCRIPTION_PLUGIN_INIT_BLOCK.toString(),
      key: 'last-queried-block',
    },
    where: {
      key: 'last-queried-block',
    },
    update: {},
  });

  const lastQueriedBlock = BigInt(lastQueriedBlockCache.value);
  const latestBlock = await client.getBlockNumber();

  const ranges: [bigint, bigint][] = getRanges(Number(lastQueriedBlock), Number(latestBlock), CHUNK_SIZE);
  const eventPromises = await Promise.allSettled(
    ranges.map(
      async ([start, end]) =>
        await client.getContractEvents({
          address: SUBSCRIPTION_PLUGIN_ADDRESS,
          abi: SubscriptionPluginAbi,
          fromBlock: start,
          toBlock: end,
        }),
    ),
  );
  const events = eventPromises.map((entry) => (entry.status === 'fulfilled' ? entry.value : [])).flat();
  for (const event of events) {
    if (event.eventName === 'ProductCreated') {
      await handleProductCreated(event);
    } else if (event.eventName === 'ProductUpdated') {
      await handleProductUpdated(event);
    } else if (event.eventName === 'PlanCreated') {
      await handlePlanCreated(event);
    } else if (event.eventName === 'PlanUpdated') {
      await handlePlanUpdated(event);
    } else if (event.eventName === 'SubscriptionPlanChanged') {
      await handleSubscriptionPlanChanged(event);
    } else if (event.eventName === 'Subscribed') {
      await handleSubscribed(event);
    } else if (event.eventName === 'UnSubscribed') {
      await handleUnSubscribed(event);
    } else if (event.eventName === 'SubscriptionCharged') {
      await handleSubscriptionCharged(event);
    }
  }

  await prisma.cache.update({
    data: {
      value: latestBlock.toString(),
    },
    where: {
      key: 'last-queried-block',
    },
  });
};

const handleProductCreated = async (
  event: Log<bigint, number, false, undefined, true, typeof SubscriptionPluginAbi, 'ProductCreated'>,
) => {
  const decodedEvent = decodeEventLog({ abi: SubscriptionPluginAbi, ...event });
  await prisma.product.create({
    data: {
      token: {
        connectOrCreate: {
          create: {
            address: decodedEvent.args.chargeToken,
          },
          where: {
            address: decodedEvent.args.chargeToken,
          },
        },
      },
      creator: {
        connect: { smartAccountAddress: decodedEvent.args.provider },
      },
      destinationChain: Number(decodedEvent.args.destinationChain),
      receivingAddress: decodedEvent.args.receivingAddress,
      onchainReference: decodedEvent.args.productId,
      name: hexToString(decodedEvent.args.name),
      isActive: decodedEvent.args.isActive,
    },
  });
};

const handleProductUpdated = async (
  event: Log<bigint, number, false, undefined, true, typeof SubscriptionPluginAbi, 'ProductUpdated'>,
) => {
  const decodedEvent = decodeEventLog({ abi: SubscriptionPluginAbi, ...event });
  await prisma.product.update({
    data: {
      token: {
        connect: { address: decodedEvent.args.chargeToken },
      },
      destinationChain: Number(decodedEvent.args.destinationChain),
      receivingAddress: decodedEvent.args.receivingAddress,
      isActive: decodedEvent.args.isActive,
    },
    where: { onchainReference: decodedEvent.args.productId },
  });
};

const handlePlanCreated = async (
  event: Log<bigint, number, false, undefined, true, typeof SubscriptionPluginAbi, 'PlanCreated'>,
) => {
  const decodedEvent = decodeEventLog({ abi: SubscriptionPluginAbi, ...event });
  await prisma.plan.create({
    data: {
      product: {
        connect: { onchainReference: decodedEvent.args.productId },
      },
      chargeInterval: Number(decodedEvent.args.chargeInterval),
      onchainReference: decodedEvent.args.planId,
      price: decodedEvent.args.price.toString(),
      isActive: decodedEvent.args.isActive,
    },
  });
};

const handlePlanUpdated = async (
  event: Log<bigint, number, false, undefined, true, typeof SubscriptionPluginAbi, 'PlanUpdated'>,
) => {
  const decodedEvent = decodeEventLog({ abi: SubscriptionPluginAbi, ...event });
  await prisma.product.update({
    where: { onchainReference: decodedEvent.args.planId },
    data: { isActive: decodedEvent.args.isActive },
  });
};

const handleSubscriptionPlanChanged = async (
  event: Log<bigint, number, false, undefined, true, typeof SubscriptionPluginAbi, 'SubscriptionPlanChanged'>,
) => {
  const decodedEvent = decodeEventLog({ abi: SubscriptionPluginAbi, ...event });
  await prisma.subscription.update({
    data: { plan: { connect: { onchainReference: decodedEvent.args.planId } } },
    where: { onchainReference: decodedEvent.args.subscriptionId },
  });
};

const handleSubscribed = async (
  event: Log<bigint, number, false, undefined, true, typeof SubscriptionPluginAbi, 'Subscribed'>,
) => {
  const decodedEvent = decodeEventLog({ abi: SubscriptionPluginAbi, ...event });
  await prisma.subscription.create({
    data: {
      subscriber: { connect: { smartAccountAddress: decodedEvent.args.subscriber } },
      creator: { connect: { smartAccountAddress: decodedEvent.args.provider } },
      product: { connect: { onchainReference: decodedEvent.args.product } },
      plan: { connect: { onchainReference: decodedEvent.args.plan } },
      onchainReference: decodedEvent.args.subscriptionId,
      isActive: true,
    },
  });
};

const handleUnSubscribed = async (
  event: Log<bigint, number, false, undefined, true, typeof SubscriptionPluginAbi, 'Subscribed'>,
) => {
  const decodedEvent = decodeEventLog({ abi: SubscriptionPluginAbi, ...event });
  await prisma.subscription.update({
    where: {
      onchainReference: decodedEvent.args.subscriptionId,
    },
    data: {
      isActive: false,
    },
  });
};

const handleSubscriptionCharged = async (
  event: Log<bigint, number, false, undefined, true, typeof SubscriptionPluginAbi, 'Subscribed'>,
) => {
  const decodedEvent = decodeEventLog({ abi: SubscriptionPluginAbi, ...event });
  await prisma.subscription.update({
    where: { onchainReference: decodedEvent.args.subscriptionId },
    data: { lastChargeDate: event. },
  });
  // create a withdrawal transaction & a deposit transaction.
  // update the last charge date on the subscription row.
};

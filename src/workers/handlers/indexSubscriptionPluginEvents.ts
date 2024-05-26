import { decodeEventLog, type Log } from 'viem';
import { type Chain } from 'viem/chains';

import {
  SUBSCRIPTION_PLUGIN_INIT_BLOCK,
  solidityTimestampToDateTime,
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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const eventHandlers: Record<string, (event: any) => Promise<void>> = {
    // SubscriptionPlanChanged: handleSubscriptionPlanChanged,
    SubscriptionCharged: handleSubscriptionCharged,
    ProductCreated: handleProductCreated,
    ProductUpdated: handleProductUpdated,
    Unsubscribed: handleUnSubscribed,
    PlanCreated: handlePlanCreated,
    PlanUpdated: handlePlanUpdated,
    Subscribed: handleSubscribed,
  };
  for (const event of events) {
    const handler = eventHandlers[event.eventName];
    if (handler) {
      await handler(event);
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
      type: decodedEvent.args.productType === 0 ? 'RECURRING' : 'SUBSCRIPTION',
      destinationChain: Number(decodedEvent.args.destinationChain),
      onchainReference: Number(decodedEvent.args.productId),
      receivingAddress: decodedEvent.args.receivingAddress,
      description: decodedEvent.args.description,
      name: hexToString(decodedEvent.args.name),
      isActive: decodedEvent.args.isActive,
      logoUrl: decodedEvent.args.logoUrl,
    },
  });
};

const handleProductUpdated = async (
  event: Log<bigint, number, false, undefined, true, typeof SubscriptionPluginAbi, 'ProductUpdated'>,
) => {
  const decodedEvent = decodeEventLog({ abi: SubscriptionPluginAbi, ...event });
  await prisma.product.update({
    data: {
      destinationChain: Number(decodedEvent.args.destinationChain),
      receivingAddress: decodedEvent.args.receivingAddress,
      isActive: decodedEvent.args.isActive,
    },
    where: { onchainReference: Number(decodedEvent.args.productId) },
  });
};

const handlePlanCreated = async (
  event: Log<bigint, number, false, undefined, true, typeof SubscriptionPluginAbi, 'PlanCreated'>,
) => {
  const decodedEvent = decodeEventLog({ abi: SubscriptionPluginAbi, ...event });
  await prisma.plan.create({
    data: {
      product: {
        connect: { onchainReference: Number(decodedEvent.args.productId) },
      },
      chargeInterval: Number(decodedEvent.args.chargeInterval),
      onchainReference: Number(decodedEvent.args.planId),
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
    where: { onchainReference: Number(decodedEvent.args.planId) },
    data: { isActive: decodedEvent.args.isActive },
  });
};

// const handleSubscriptionPlanChanged = async (
//   event: Log<bigint, number, false, undefined, true, typeof SubscriptionPluginAbi, 'SubscriptionPlanChanged'>,
// ) => {
//   const decodedEvent = decodeEventLog({ abi: SubscriptionPluginAbi, ...event });
//   await prisma.subscription.update({
//     data: { plan: { connect: { onchainReference: Number(decodedEvent.args.planId) } } },
//     where: { onchainReference: Number(decodedEvent.args.subscriptionId) },
//   });
// };

const handleSubscribed = async (
  event: Log<bigint, number, false, undefined, true, typeof SubscriptionPluginAbi, 'Subscribed'>,
) => {
  const decodedEvent = decodeEventLog({ abi: SubscriptionPluginAbi, ...event });
  await prisma.subscription.create({
    data: {
      subscriber: { connect: { smartAccountAddress: decodedEvent.args.subscriber } },
      product: { connect: { onchainReference: Number(decodedEvent.args.product) } },
      subscriptionExpiry: solidityTimestampToDateTime(decodedEvent.args.endTime),
      creator: { connect: { smartAccountAddress: decodedEvent.args.provider } },
      plan: { connect: { onchainReference: Number(decodedEvent.args.plan) } },
      onchainReference: Number(decodedEvent.args.subscriptionId),
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
      onchainReference: Number(decodedEvent.args.subscriptionId),
    },
    data: {
      isActive: false,
    },
  });
};

const handleSubscriptionCharged = async (
  event: Log<bigint, number, false, undefined, true, typeof SubscriptionPluginAbi, 'SubscriptionCharged'>,
) => {
  const decodedEvent = decodeEventLog({ abi: SubscriptionPluginAbi, ...event });
  const subscription = await prisma.subscription.findUnique({
    where: { onchainReference: Number(decodedEvent.args.subscriptionId) },
    include: { product: true },
  });

  await prisma.transaction.createMany({
    data: [
      {
        subscriptionOnchainReference: Number(decodedEvent.args.subscriptionId),
        tokenAddress: subscription?.product.tokenAddress as string,
        amount: decodedEvent.args.amount.toString(),
        onchainReference: event.transactionHash,
        recipient: subscription?.creatorAddress,
        narration: 'Subscription fee deducted',
        sender: decodedEvent.args.subscriber,
        type: 'WITHDRAWAL',
        status: 'SUCCESS',
      },
      {
        subscriptionOnchainReference: Number(decodedEvent.args.subscriptionId),
        tokenAddress: subscription?.product.tokenAddress as string,
        amount: decodedEvent.args.amount.toString(),
        onchainReference: event.transactionHash,
        recipient: subscription?.creatorAddress,
        narration: 'Subscription fee received',
        sender: decodedEvent.args.subscriber,
        status: 'SUCCESS',
        type: 'DEPOSIT',
      },
    ],
  });

  await prisma.subscription.update({
    data: { lastChargeDate: solidityTimestampToDateTime(decodedEvent.args.timestamp) },
    where: { onchainReference: Number(decodedEvent.args.subscriptionId) },
  });
};

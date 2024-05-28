import { type Chain } from 'viem/chains';
import { type Log } from 'viem';

import {
  SUBSCRIPTION_PLUGIN_INIT_BLOCK,
  solidityTimestampToDateTime,
  SUBSCRIPTION_PLUGIN_ADDRESS,
  SubscriptionPluginAbi,
  getEvmHttpClient,
  bytes32ToText,
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
  await prisma.product.create({
    data: {
      token: {
        connectOrCreate: {
          create: {
            address: event.args.chargeToken,
          },
          where: {
            address: event.args.chargeToken,
          },
        },
      },
      creator: {
        connect: { smartAccountAddress: event.args.provider },
      },
      type: event.args.productType === 0 ? 'RECURRING' : 'SUBSCRIPTION',
      destinationChain: Number(event.args.destinationChain),
      onchainReference: Number(event.args.productId),
      receivingAddress: event.args.receivingAddress,
      name: bytes32ToText(event.args.name),
      description: event.args.description,
      isActive: event.args.isActive,
      logoUrl: event.args.logoUrl,
    },
  });
};

const handleProductUpdated = async (
  event: Log<bigint, number, false, undefined, true, typeof SubscriptionPluginAbi, 'ProductUpdated'>,
) => {
  await prisma.product.update({
    data: {
      destinationChain: Number(event.args.destinationChain),
      receivingAddress: event.args.receivingAddress,
      isActive: event.args.isActive,
    },
    where: { onchainReference: Number(event.args.productId) },
  });
};

const handlePlanCreated = async (
  event: Log<bigint, number, false, undefined, true, typeof SubscriptionPluginAbi, 'PlanCreated'>,
) => {
  await prisma.plan.create({
    data: {
      product: {
        connect: { onchainReference: Number(event.args.productId) },
      },
      chargeInterval: Number(event.args.chargeInterval),
      onchainReference: Number(event.args.planId),
      price: event.args.price.toString(),
      isActive: event.args.isActive,
    },
  });
};

const handlePlanUpdated = async (
  event: Log<bigint, number, false, undefined, true, typeof SubscriptionPluginAbi, 'PlanUpdated'>,
) => {
  await prisma.product.update({
    where: { onchainReference: Number(event.args.planId) },
    data: { isActive: event.args.isActive },
  });
};

// const handleSubscriptionPlanChanged = async (
//   event: Log<bigint, number, false, undefined, true, typeof SubscriptionPluginAbi, 'SubscriptionPlanChanged'>,
// ) => {
//   await prisma.subscription.update({
//     data: { plan: { connect: { onchainReference: Number(event.args.planId) } } },
//     where: { onchainReference: Number(event.args.subscriptionId) },
//   });
// };

const handleSubscribed = async (
  event: Log<bigint, number, false, undefined, true, typeof SubscriptionPluginAbi, 'Subscribed'>,
) => {
  const futureDate = new Date(2024 + 500, 1, 1);
  await prisma.subscription.create({
    data: {
      subscriptionExpiry: event.args.endTime === 0n ? futureDate : solidityTimestampToDateTime(event.args.endTime),
      subscriber: { connect: { smartAccountAddress: event.args.subscriber } },
      product: { connect: { onchainReference: Number(event.args.product) } },
      creator: { connect: { smartAccountAddress: event.args.provider } },
      plan: { connect: { onchainReference: Number(event.args.plan) } },
      onchainReference: Number(event.args.subscriptionId),
      isActive: true,
    },
  });
};

const handleUnSubscribed = async (
  event: Log<bigint, number, false, undefined, true, typeof SubscriptionPluginAbi, 'Subscribed'>,
) => {
  await prisma.subscription.update({
    where: {
      onchainReference: Number(event.args.subscriptionId),
    },
    data: {
      isActive: false,
    },
  });
};

const handleSubscriptionCharged = async (
  event: Log<bigint, number, false, undefined, true, typeof SubscriptionPluginAbi, 'SubscriptionCharged'>,
) => {
  const subscription = await prisma.subscription.findUnique({
    where: { onchainReference: Number(event.args.subscriptionId) },
    include: { product: true },
  });

  await prisma.transaction.createMany({
    data: [
      {
        narration:
          subscription?.product.type === 'SUBSCRIPTION'
            ? 'Subscription fee charged'
            : `Recurring payment made to ${subscription?.product.receivingAddress}`,
        recipient:
          subscription?.product.type === 'SUBSCRIPTION'
            ? subscription?.creatorAddress
            : subscription?.product.receivingAddress,
        subscriptionOnchainReference: Number(event.args.subscriptionId),
        tokenAddress: subscription?.product.tokenAddress as string,
        onchainReference: event.transactionHash,
        amount: event.args.amount.toString(),
        sender: event.args.subscriber,
        type: 'WITHDRAWAL',
        status: 'SUCCESS',
      },
      {
        narration:
          subscription?.product.type === 'SUBSCRIPTION'
            ? 'Subscription fee received'
            : `Recurring payment received from ${event.args.subscriber}`,
        recipient:
          subscription?.product.type === 'SUBSCRIPTION'
            ? subscription?.creatorAddress
            : subscription?.product.receivingAddress,
        subscriptionOnchainReference: Number(event.args.subscriptionId),
        tokenAddress: subscription?.product.tokenAddress as string,
        onchainReference: event.transactionHash,
        amount: event.args.amount.toString(),
        sender: event.args.subscriber,
        status: 'SUCCESS',
        type: 'DEPOSIT',
      },
    ],
  });

  await prisma.subscription.update({
    data: { lastChargeDate: solidityTimestampToDateTime(event.args.timestamp) },
    where: { onchainReference: Number(event.args.subscriptionId) },
  });
};

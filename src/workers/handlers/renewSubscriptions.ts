import { privateKeyToAccount } from 'viem/accounts';
import { createWalletClient, http } from 'viem';
import { type Chain } from 'viem/chains';
import dayjs from 'dayjs';

import { SUBSCRIPTION_PLUGIN_ADDRESS, SubscriptionPluginAbi, getEvmHttpClient } from '~/pkg/evm';
import { config } from '~/pkg/env';
import { prisma } from '~/pkg/db';

export const renewSubscriptions = async (chain: Chain) => {
  const now = dayjs();

  const activeSubscriptions = await prisma.subscription.findMany({
    where: {
      OR: [
        {
          createdAt: { lt: now.subtract(1, 'hour').toDate() },
          lastChargeDate: null,
        },
        {
          lastChargeDate: { lt: now.toDate() },
        },
      ],
      subscriptionExpiry: { lt: now.toDate() },
      product: { isActive: true },
      plan: { isActive: true },
      isActive: true,
    },
    include: {
      product: true,
      plan: true,
    },
  });

  const subscriptionsForRenewal = activeSubscriptions.filter((sub) => {
    if (!sub.lastChargeDate) return true;
    return sub.lastChargeDate < now.subtract(sub.plan.chargeInterval, 'seconds').toDate();
  });

  // charge users.
  await Promise.allSettled(
    subscriptionsForRenewal.map(
      async (sub) => await chargeUser(chain, sub.subscriberAddress as `0x${string}`, BigInt(sub.onchainReference)),
    ),
  );
};

const chargeUser = async (chain: Chain, subscriber: `0x${string}`, subscriptionId: bigint) => {
  const publicClient = getEvmHttpClient(chain);
  const account = privateKeyToAccount(config.PRIVATE_KEY as `0x${string}`);
  const walletClient = createWalletClient({
    transport: http(),
    account,
    chain,
  });

  const { request } = await publicClient.simulateContract({
    address: SUBSCRIPTION_PLUGIN_ADDRESS,
    args: [subscriber, subscriptionId],
    abi: SubscriptionPluginAbi,
    functionName: 'charge',
    account,
  });

  await walletClient.writeContract(request);
};

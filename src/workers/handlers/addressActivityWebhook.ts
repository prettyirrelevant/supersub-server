import { zeroAddress, getAddress, fromHex } from 'viem';

import { SUBSCRIPTION_PLUGIN_ADDRESS } from '~/pkg/evm';
import { AlchemyWebhookEvent } from '~/utils';
import { logger } from '~/pkg/logging';
import { prisma } from '~/pkg/db';
import dayjs from 'dayjs';

const ModularAccountFactoryAddress = getAddress('0x0046000000000151008789797b54fdb500e2a61e');

export const handleAlchemyAddressActivityWebhook = async (webhook: AlchemyWebhookEvent) => {
  try {
    if (webhook.type !== 'ADDRESS_ACTIVITY' || webhook.event.network !== 'MATIC_AMOY') {
      logger.info(`Ignoring webhook event of type ${webhook.type} for network ${webhook.event.network}`);
      return;
    }

    for (const activity of webhook.event.activity) {
      if (!['internal', 'external', 'token'].includes(activity.category)) {
        logger.warn(`No handler found for activity with category: ${activity.category}`);
        continue;
      }

      const toAddress = getAddress(activity.toAddress);
      const fromAddress = getAddress(activity.fromAddress);

      if (
        [ModularAccountFactoryAddress, SUBSCRIPTION_PLUGIN_ADDRESS].includes(toAddress) ||
        [ModularAccountFactoryAddress, SUBSCRIPTION_PLUGIN_ADDRESS].includes(fromAddress)
      ) {
        logger.info(`Ignoring activity involving Modular Account Factory or Subscription Plugin`);
        continue;
      }

      if (activity.value === 0) {
        logger.info(`Ignoring zero value activity with hash: ${activity.hash}`);
        continue;
      }

      const tokenAddress =
        activity.asset === 'MATIC' ? zeroAddress : getAddress(activity.rawContract.address as `0x${string}`);
      const amount = fromHex(activity.rawContract.rawValue as `0x${string}`, 'bigint').toString();

      const withdrawalNarration = `Sent ${activity.value} ${activity.asset} to ${toAddress}`;
      const depositNarration = `Received ${activity.value} ${activity.asset} from ${fromAddress}`;

      await prisma.token.createMany({ data: [{ address: tokenAddress }], skipDuplicates: true });

      await prisma.transaction.createMany({
        data: [
          {
            createdAt: dayjs(webhook.createdAt).toDate(),
            updatedAt: dayjs(webhook.createdAt).toDate(),
            onchainReference: activity.hash,
            narration: withdrawalNarration,
            recipient: toAddress,
            sender: fromAddress,
            type: 'WITHDRAWAL',
            status: 'SUCCESS',
            tokenAddress,
            amount,
          },
          {
            createdAt: dayjs(webhook.createdAt).toDate(),
            updatedAt: dayjs(webhook.createdAt).toDate(),
            onchainReference: activity.hash,
            narration: depositNarration,
            recipient: toAddress,
            sender: fromAddress,
            status: 'SUCCESS',
            type: 'DEPOSIT',
            tokenAddress,
            amount,
          },
        ],
        skipDuplicates: true,
      });

      logger.info(`Successfully processed activity with hash: ${activity.hash}`);
    }
  } catch (error) {
    logger.error('Error processing Alchemy address activity webhook', { webhook, error });
  }
};

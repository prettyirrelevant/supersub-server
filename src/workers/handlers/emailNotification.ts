import { ProductType } from '@prisma/client';
import { formatUnits } from 'viem';
import dayjs from 'dayjs';

import { logger } from '~/pkg/logging';
import { resend } from '~/pkg/resend';
import { prisma } from '~/pkg/db';
import { chunks } from '~/utils';

export const notifyUsersForUpcomingSubscriptionRenewal = async () => {
  try {
    logger.info('Checking for upcoming subscription renewals');
    const now = dayjs();
    const in24Hours = now.add(24, 'hours');

    const upcomingRenewals = await prisma.subscription.findMany({
      where: {
        OR: [
          {
            createdAt: { lt: in24Hours.toDate() },
            lastChargeDate: null,
          },
          {
            lastChargeDate: { lt: in24Hours.subtract(1, 'seconds').toDate() },
          },
        ],
        subscriptionExpiry: { gt: in24Hours.toDate() },
        product: { isActive: true },
        plan: { isActive: true },
        isActive: true,
      },
      include: {
        subscriber: true,
        product: true,
        plan: true,
      },
    });

    if (upcomingRenewals.length === 0) {
      logger.info('No upcoming subscription renewals found');
      return;
    }

    const subscribersToNotify = upcomingRenewals.filter((sub) => {
      if (!sub.lastChargeDate) return true;
      return sub.lastChargeDate < in24Hours.subtract(sub.plan.chargeInterval, 'seconds').toDate();
    });

    logger.info('Preparing email payloads', { numSubscribers: subscribersToNotify.length });
    const payloads = subscribersToNotify.map((subscription) => ({
      text: getEmailBodyTemplate({
        amount: formatUnits(BigInt(subscription.plan.price.toString()), subscription.product.token.decimals as number),
        recipientAddress: subscription.product.receivingAddress,
        email: subscription.subscriber.emailAddress,
        productName: subscription.product.name,
        type: subscription.product.type,
      }),
      to: [subscription.subscriber.emailAddress],
      from: 'SuperSub <onboarding@resend.dev>',
      subject: 'SuperSub - Payment Reminder',
    }));

    logger.info('Sending email reminders');
    const payloadChunks = chunks(payloads, 50);
    await Promise.allSettled(payloadChunks.map(async (chunk) => await resend.batch.send(chunk)));
  } catch (error) {
    logger.error(error, { description: 'Error notifying users for upcoming subscription renewal' });
  }
};

const getEmailBodyTemplate = (options: {
  recipientAddress: string;
  productName: string;
  type: ProductType;
  amount: string;
  email: string;
}) => {
  if (options.type === 'SUBSCRIPTION') {
    return `
Hello ${options.email},

This is a friendly reminder that your subscription to ${options.productName} is due for renewal sometime tomorrow.

Subscription: ${options.productName}
Renewal Amount: ${options.amount}

To ensure uninterrupted access, please make sure you have sufficient funds in your wallet before the renewal date.

If you have any questions or need assistance, please reach out to our support team.

Thank you for your continued support!

Best regards,
SuperSub Team.
`;
  }

  return `
Hello ${options.email},

This is a friendly reminder that your recurring payment to ${options.recipientAddress} is scheduled for sometime tomorrow.

Payment Description: ${options.productName}
Recipient: ${options.recipientAddress}
Amount: ${options.amount}

Please ensure you have sufficient funds in your crypto wallet to avoid any failures in your recurring payment.

If you have any questions or need assistance, please reach out to our support team.

Thank you for your continued support!

Best regards,
SuperSub Team.
`;
};

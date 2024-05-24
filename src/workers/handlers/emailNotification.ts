import { ProductType } from '@prisma/client';
import { formatUnits } from 'viem';
import dayjs from 'dayjs';

import { resend } from '~/pkg/resend';
import { prisma } from '~/pkg/db';
import { chunks } from '~/utils';

export const notifyUsersForUpcomingSubscriptionRenewal = async () => {
  const now = dayjs();
  const nextDay = now.add(24, 'hour');

  const activeSubscriptions = await prisma.subscription.findMany({
    include: { product: { include: { token: true } }, subscriber: true, plan: true },
    where: { subscriptionExpiry: { gte: nextDay.toDate() }, isActive: true },
  });

  const subscriptionsForRenewal = activeSubscriptions.filter((subscription) => {
    const lastChargeDate = dayjs(subscription.lastChargeDate);
    const nextChargeDate = lastChargeDate.add(subscription.plan.chargeInterval, 'second');
    return nextChargeDate.isBefore(nextDay) && nextChargeDate.isAfter(now);
  });

  const payloads = subscriptionsForRenewal.map((subscription) => ({
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
  const payloadChunks = chunks(payloads, 50);
  await Promise.allSettled(payloadChunks.map(async (chunk) => await resend.batch.send(chunk)));
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

import { prisma } from '~/pkg/db';

export const renewSubscriptions = async () => {
  const activeSubscriptions = await prisma.subscription.findMany({});
};

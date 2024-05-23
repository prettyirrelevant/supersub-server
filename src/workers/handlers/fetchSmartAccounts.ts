import { type User } from '@privy-io/server-auth';
import { type Chain } from 'viem/chains';

import { getMultiOwnerModularAccountAddresses } from '~/pkg/evm';
import { getUniqueElements } from '~/utils';
import { privy } from '~/pkg/privy';
import { prisma } from '~/pkg/db';

export const fetchSmartAccounts = async (chain: Chain) => {
  const privyUsers = await privy.getUsers();
  const usersByWalletAddress = privyUsers.reduce(
    (mapping, user) => {
      if (user.wallet) {
        const { wallet, ...rest } = user;
        mapping[wallet.address as `0x${string}`] = rest;
      }
      return mapping;
    },
    {} as Record<`0x${string}`, Omit<User, 'wallet'>>,
  );

  const accountsInDb = await prisma.account.findMany({ select: { eoaAddress: true } });
  const addressesInDb = accountsInDb.map((account) => account.eoaAddress as `0x${string}`);

  const newWalletAddresses = getUniqueElements<`0x${string}`>(
    Object.keys(usersByWalletAddress) as `0x${string}`[],
    addressesInDb,
  );

  const modularAccountAddressesForNewWallets = await getMultiOwnerModularAccountAddresses(chain, newWalletAddresses);

  await prisma.account.createMany({
    data: Object.entries(modularAccountAddressesForNewWallets).map(([walletAddress, modularAccountAddress]) => ({
      emailAddress: usersByWalletAddress[walletAddress as `0x${string}`].email?.address as string,
      metadata: { privyDid: usersByWalletAddress[walletAddress as `0x${string}`].id },
      smartAccountAddress: modularAccountAddress,
      eoaAddress: walletAddress,
    })),
    skipDuplicates: true,
  });
};

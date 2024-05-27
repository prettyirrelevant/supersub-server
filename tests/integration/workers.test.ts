import { beforeEach, afterEach, describe, afterAll, expect, it, vi } from 'vitest';
import { PrismaClient, Prisma } from '@prisma/client';
import { PrivyClient } from '@privy-io/server-auth';
import { polygonAmoy } from 'viem/chains';
import { faker } from '@faker-js/faker';

import { indexSubscriptionPluginEvents } from '~/workers/handlers/indexSubscriptionPluginEvents';
import { fetchSmartAccounts } from '~/workers/handlers/fetchSmartAccounts';
import { enrichERC20Tokens } from '~/workers/handlers/enrichTokens';
import { getEvmHttpClient } from '~/pkg/evm';
import { prisma } from '~/pkg/db';

import { createFakeTokens } from '../utils';

describe('enrichERC20Tokens', () => {
  beforeEach(async () => {
    await createFakeTokens();
  });

  afterAll(async () => {
    await prisma.token.deleteMany();
    await prisma.$disconnect();
  });

  it('should update the decimals of tokens with valid results', async () => {
    const tokensBefore = await prisma.token.findMany();
    expect(tokensBefore).toHaveLength(4);

    await enrichERC20Tokens(polygonAmoy);

    const tokensAfter = await prisma.token.findMany({ select: { decimals: true, address: true } });
    expect(tokensAfter).toHaveLength(4);
    expect(tokensAfter).toContainEqual({ address: '0x41E94Eb019C0762f9Bfcf9Fb1E58725BfB0e7582', decimals: 6 });
    expect(tokensAfter).toContainEqual({ address: '0x360ad4f9a9A8EFe9A8DCB5f461c4Cc1047E1Dcf9', decimals: 18 });
    expect(tokensAfter).toContainEqual({ address: '0x0Fd9e8d3aF1aaee056EB9e802c3A762a667b1904', decimals: 18 });
    expect(tokensAfter).toContainEqual({ address: '0xcab0EF91Bee323d1A617c0a027eE753aFd6997E4', decimals: 18 });
  });
});

vi.mock('@privy-io/server-auth', async (importOriginal) => {
  const mod = await importOriginal<typeof import('@privy-io/server-auth')>();

  const PrivyClient = vi.fn();
  PrivyClient.prototype.getUsers = vi.fn();

  return { ...mod, PrivyClient };
});

describe('fetchSmartAccounts', () => {
  beforeEach(() => {
    const privy = new PrivyClient('privy-app-id', 'privy-app-secret');
    privy.getUsers.mockResolvedValueOnce(
      Promise.resolve([
        {
          wallet: { address: '0x19e4057A38a730be37c4DA690b103267AAE1d75d' },
          email: { address: 'user1@example.com' },
          id: '1',
        },
        {
          wallet: { address: '0x83fCFe8Ba2FEce9578F0BbaFeD4Ebf5E915045B9' },
          email: { address: 'user2@example.com' },
          id: '2',
        },
        {
          wallet: { address: '0xDaDC3e4Fa2CF41BC4ea0aD0e627935A5c2DB433d' },
          email: { address: 'user3@example.com' },
          id: '3',
        },
      ]),
    );
  });

  afterEach(async () => {
    vi.clearAllMocks();
    await prisma.account.deleteMany();
  });

  it('should create new accounts for new wallets', async () => {
    await fetchSmartAccounts(polygonAmoy);

    const createdAccounts = await prisma.account.findMany({
      select: {
        smartAccountAddress: true,
        emailAddress: true,
        eoaAddress: true,
        metadata: true,
      },
    });
    expect(createdAccounts).toHaveLength(3);
    expect(createdAccounts[0]).toMatchObject({
      smartAccountAddress: '0x564BB9C687BE0Ff8474aD67b9D2c6a1b402A86C7',
      eoaAddress: '0x19e4057A38a730be37c4DA690b103267AAE1d75d',
      emailAddress: 'user1@example.com',
      metadata: { privyDid: '1' },
    });
  });

  it('should not create duplicate accounts for existing wallets', async () => {
    await prisma.account.create({
      data: {
        smartAccountAddress: '0x1234567890abcdef0123456789abcdef',
        emailAddress: 'user1@example.com',
        eoaAddress: '0x1234567890abcdef',
        metadata: { privyDid: '1' },
      },
    });

    await fetchSmartAccounts(polygonAmoy);

    const createdAccounts = await prisma.account.findMany({
      select: {
        smartAccountAddress: true,
        emailAddress: true,
        eoaAddress: true,
        metadata: true,
      },
    });
    expect(createdAccounts).toHaveLength(3);
    expect(createdAccounts[1]).toMatchObject({
      smartAccountAddress: '0xeA20DB45a5D8FdF65249Eb5d22b0730aB7d2Ba9A',
      eoaAddress: '0x83fCFe8Ba2FEce9578F0BbaFeD4Ebf5E915045B9',
      emailAddress: 'user2@example.com',
      metadata: { privyDid: '2' },
    });
  });
});

vi.mock('~/pkg/db', () => {
  const prisma = new PrismaClient();
  prisma.product.create = vi.fn();

  return { prisma };
});

describe('indexSubscriptionPluginEvents', () => {
  beforeEach(async () => {
    prisma.product.create.mockImplementation(async (args: { data: Prisma.ProductCreateInput }) => {
      const { data } = args;
      const { prisma: originalPrisma } = await vi.importActual<typeof import('~/pkg/db')>('~/pkg/db');

      await prisma.account.create({
        data: {
          metadata: {
            privyDid: `did:privy:${faker.string.numeric(7)}`,
          },
          smartAccountAddress: data.creator.connect?.smartAccountAddress as string,
          eoaAddress: faker.finance.ethereumAddress(),
          emailAddress: faker.internet.email(),
        },
      });

      await originalPrisma.product.create({ data });
    });
  });

  afterEach(async () => {
    vi.clearAllMocks();
  });

  afterAll(async () => {
    await prisma.plan.deleteMany();
    await prisma.cache.deleteMany();
    await prisma.product.deleteMany();
    await prisma.account.deleteMany();
  });

  it('should index all events properly', async () => {
    await indexSubscriptionPluginEvents(polygonAmoy);
    const client = getEvmHttpClient(polygonAmoy);
    const latestBlock = await client.getBlockNumber();

    const products = await prisma.product.findMany({
      select: {
        destinationChain: true,
        onchainReference: true,
        receivingAddress: true,
        creatorAddress: true,
        tokenAddress: true,
        description: true,
        isActive: true,
        logoUrl: true,
        name: true,
        type: true,
      },
    });
    const plans = await prisma.plan.findMany({
      select: {
        productOnchainReference: true,
        onchainReference: true,
        chargeInterval: true,
        isActive: true,
        price: true,
      },
    });
    const lastQueriedBlockCache = await prisma.cache.findUnique({ where: { key: 'last-queried-block' } });

    expect(products[0]).toMatchSnapshot();
    expect(plans[0]).toMatchSnapshot();
    expect(Number(lastQueriedBlockCache?.value as string)).toBeCloseTo(Number(latestBlock));
  });
});

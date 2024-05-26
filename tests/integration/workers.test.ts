import { beforeEach, beforeAll, afterEach, describe, afterAll, expect, it, vi } from 'vitest';
import { PrivyClient } from '@privy-io/server-auth';
import { polygonAmoy } from 'viem/chains';

import { fetchSmartAccounts } from '~/workers/handlers/fetchSmartAccounts';
import { enrichERC20Tokens } from '~/workers/handlers/enrichTokens';
import { prisma } from '~/pkg/db';

describe('enrichERC20Tokens', () => {
  beforeAll(async () => {
    await prisma.token.createMany({
      data: [
        { address: '0x41E94Eb019C0762f9Bfcf9Fb1E58725BfB0e7582' }, // USDC
        { address: '0x360ad4f9a9A8EFe9A8DCB5f461c4Cc1047E1Dcf9' }, // WMATIC
        { address: '0x0Fd9e8d3aF1aaee056EB9e802c3A762a667b1904' }, // LINK
        { address: '0xcab0EF91Bee323d1A617c0a027eE753aFd6997E4' }, // CCIP BnM
      ],
    });
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
  let privy: unknown;

  beforeEach(() => {
    privy = new PrivyClient('app-id', 'app-secret');
  });

  afterEach(async () => {
    vi.clearAllMocks();
    await prisma.account.deleteMany();
  });

  it('should create new accounts for new wallets', async () => {
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

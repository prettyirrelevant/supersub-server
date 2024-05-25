import { beforeAll, describe, afterAll, expect, it } from 'vitest';
import { polygonAmoy } from 'viem/chains';

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

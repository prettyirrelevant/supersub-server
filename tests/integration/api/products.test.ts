import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest';
import { PrivyClient } from '@privy-io/server-auth';
import request from 'supertest';
import * as jose from 'jose';

import { application } from '~/app';
import { prisma } from '~/pkg/db';

import {
  createPrivyAccessToken,
  verifyPrivyAccessToken,
  createFakeProducts,
  createFakeAccounts,
  createFakeTokens,
} from '../../utils';

vi.mock('@privy-io/server-auth', async (importOriginal) => {
  const mod = await importOriginal<typeof import('@privy-io/server-auth')>();
  const PrivyClient = vi.fn();
  PrivyClient.prototype.getUser = vi.fn();
  PrivyClient.prototype.verifyAuthToken = vi.fn();
  return { ...mod, PrivyClient };
});

describe('Products', async () => {
  const { privateKey, publicKey } = await jose.generateKeyPair('ES256');

  beforeEach(async () => {
    const privy = new PrivyClient('privy-app-id', 'privy-app-secret');
    privy.verifyAuthToken.mockImplementation(
      async (token: string) => await verifyPrivyAccessToken({ verificationKey: publicKey, token }),
    );
  });

  afterEach(async () => {
    vi.clearAllMocks();
    await prisma.product.deleteMany();
    await prisma.token.deleteMany();
    await prisma.account.deleteMany();
  });

  it('GET /products should return all products created by the authenticated user', async () => {
    const accounts = await createFakeAccounts(2);
    await createFakeTokens();
    await createFakeProducts(5, accounts);

    const accessToken = await createPrivyAccessToken({ privyDid: accounts[0].metadata?.privyDid, privateKey });

    const response = await request(application)
      .get('/api/products')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect('Content-Type', /json/)
      .expect(200);

    expect(response.body).toHaveProperty('data');
    expect(response.body.data).toHaveProperty('products');
  });

  it('GET /products should include associated plans for each product', async () => {
    const accounts = await createFakeAccounts(1);
    await createFakeTokens();
    await createFakeProducts(3, accounts);

    const accessToken = await createPrivyAccessToken({ privyDid: accounts[0].metadata?.privyDid, privateKey });

    const response = await request(application)
      .get('/api/products')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect('Content-Type', /json/)
      .expect(200);

    expect(response.body.data.products.every((product) => product.plans)).toBe(true);
  });
});

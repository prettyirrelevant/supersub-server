import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest';
import { PrivyClient } from '@privy-io/server-auth';
import request from 'supertest';
import * as jose from 'jose';

import { application } from '~/app';
import { prisma } from '~/pkg/db';

import { createPrivyAccessToken, verifyPrivyAccessToken, createFakeAccounts } from '../../utils';

vi.mock('@privy-io/server-auth', async (importOriginal) => {
  const mod = await importOriginal<typeof import('@privy-io/server-auth')>();

  const PrivyClient = vi.fn();
  PrivyClient.prototype.getUser = vi.fn();
  PrivyClient.prototype.verifyAuthToken = vi.fn();

  return { ...mod, PrivyClient };
});

describe('Balances', async () => {
  const { privateKey, publicKey } = await jose.generateKeyPair('ES256');

  beforeEach(async () => {
    const privy = new PrivyClient('privy-app-id', 'privy-app-secret');
    privy.verifyAuthToken.mockImplementation(
      async (token: string) => await verifyPrivyAccessToken({ verificationKey: publicKey, token }),
    );
  });

  afterEach(async () => {
    vi.clearAllMocks();
    await prisma.apiKey.deleteMany();
    await prisma.account.deleteMany();
  });

  it('GET /balances/latest should return the latest balances', async () => {
    const accounts = await createFakeAccounts(2);

    const accessToken = await createPrivyAccessToken({ privyDid: accounts[0].metadata?.privyDid, privateKey });
    const response = await request(application)
      .get('/api/balances/latest')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect('Content-Type', /json/)
      .expect(200);

    console.log(response.body.data);
    expect(response.body.data).toHaveProperty('balances');
  });
});

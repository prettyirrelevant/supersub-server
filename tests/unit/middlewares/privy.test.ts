// import { beforeAll, afterAll, describe, expect, it, vi } from 'vitest';
// import { PrivyClient } from '@privy-io/server-auth';
// import * as jose from 'jose';
//
// import { privyAuthenticationMiddleware } from '~/middlewares/auth';
//
// vi.mock('@privy-io/server-auth', async (importOriginal) => {
//   const mod = await importOriginal<typeof import('@privy-io/server-auth')>();
//
//   const PrivyClient = vi.fn();
//   PrivyClient.prototype.verifyAuthToken = vi.fn();
//   PrivyClient.prototype.getUser = vi.fn();
//
//   return { ...mod, PrivyClient };
// });
//
// describe('privyAuthenticationMiddleware', () => {
//   let privateKey: jose.KeyLike, authToken: string;
//   let privy: unknown;
//
//   beforeAll(async () => {
//     const keyPair = await jose.generateKeyPair('ES256');
//     privateKey = keyPair.privateKey;
//
//     const session = 'mock-session-id';
//     const subject = 'mock-user-id';
//     const issuer = 'privy.io';
//     const audience = '';
//     const expiration = '1h';
//
//     authToken = await new jose.SignJWT({ sid: session })
//       .setProtectedHeader({ alg: 'ES256', typ: 'JWT' })
//       .setIssuer(issuer)
//       .setIssuedAt()
//       .setAudience(audience)
//       .setSubject(subject)
//       .setExpirationTime(expiration)
//       .sign(privateKey);
//
//     privy = new PrivyClient('app-id', 'app-secret');
//   });
//
//   afterAll(() => {
//     vi.resetAllMocks();
//   });
//
//   it('should populate req.auth with correct data when account already exists', async () => {
//     const mockVerifiedClaims = {
//       expiration: 3456,
//       issuedAt: 12345,
//       sessionId: '',
//       issuer: '',
//       userId: '',
//       appId: '',
//     };
//
//     const mockAccount = {
//       metadata: { privyDid: '' },
//       smartAccountAddress: '',
//       createdAt: new Date(),
//       updatedAt: new Date(),
//       emailAddress: '',
//       eoaAddress: '',
//       id: 1,
//     };
//
//     privy.verifyAuthToken.mockResolvedValueOnce(mockVerifiedClaims);
//
//     // prisma.account.findFirst.mockResolvedValueOnce(mockAccount);
//
//     const req = {
//       header: vi.fn().mockReturnValue(`Bearer ${authToken}`),
//     } as any;
//
//     const res = {
//       status: vi.fn().mockReturnThis(),
//       json: vi.fn(),
//     } as any;
//
//     const next = vi.fn();
//
//     await privyAuthenticationMiddleware(req, res, next);
//
//     expect(next).toHaveBeenCalled();
//     expect(req.auth).toEqual({
//       address: mockAccount.smartAccountAddress,
//       method: 'access-token',
//       apiKey: null,
//     });
//   });
// });

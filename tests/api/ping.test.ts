import { expect, test } from 'vitest';
import request from 'supertest';

import { application } from '../../src';

describe('Ping', () => {
  test('GET /', async () => {
    const response = await request(application).get('/').expect('Content-Type', /json/).expect(200);
    expect(response.body).toStrictEqual({ data: { ping: 'pong' } });
  });

  test('POST /', async () => {
    const response = await request(application).post('/').expect('Content-Type', /json/).expect(404);
    expect(response.body).toStrictEqual({
      error: {
        message: 'The page you requested cannot be found. Perhaps you mistyped the URL or the page has been moved.',
        code: 'Not Found',
      },
    });
  });
});

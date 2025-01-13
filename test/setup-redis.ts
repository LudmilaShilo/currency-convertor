import { Redis } from 'ioredis';
import { cacheConfig } from '../src/config/cache.config';

const redis = new Redis({
  host: cacheConfig.host,
  port: cacheConfig.port,
});

beforeAll(async () => {
  await redis.flushdb();
});

afterAll(async () => {
  await redis.quit();
});

jest.setTimeout(30000);

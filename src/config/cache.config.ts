import { CacheConfig } from './interfaces/cache-config.interface';

export const cacheConfig: CacheConfig = {
  ttl: 3600, // 1 hour
  host: 'localhost',
  port: 6379,
};

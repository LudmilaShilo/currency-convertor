import { CacheConfig } from './interfaces/cache-config.interface';
import { REDIS, TIME } from '../common/constants';

export const cacheConfig: CacheConfig = {
  ttl: TIME.ONE_HOUR_SEC,
  host: REDIS.DEFAULT_HOST,
  port: REDIS.DEFAULT_PORT,
};

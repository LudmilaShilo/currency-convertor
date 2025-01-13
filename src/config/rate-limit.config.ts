import { RateLimitConfig } from './interfaces/rate-limit.interface';

export const rateLimitConfig: RateLimitConfig = {
  ttl: 60, // 1 minute in seconds
  limit: 10, // requests per minute
};

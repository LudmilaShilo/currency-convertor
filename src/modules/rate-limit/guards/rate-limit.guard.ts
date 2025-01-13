import {
  Injectable,
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Redis } from 'ioredis';
import { InjectRedis } from '@nestjs-modules/ioredis';
import { rateLimitConfig } from '../../../config/rate-limit.config';
import { ErrorMessages } from '../../../common/constants/error-messages';

@Injectable()
export class RateLimitGuard implements CanActivate {
  private readonly logger = new Logger(RateLimitGuard.name);

  constructor(@InjectRedis() private readonly redis: Redis) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const ip = request.ip;
    const key = `rate_limit:${ip}`;

    const multi = this.redis.multi();
    multi.incr(key);
    multi.ttl(key);

    try {
      const [count, ttl] = await multi.exec();
      const requestCount = count[1] as number;

      if (ttl[1] === -1) {
        await this.redis.expire(key, rateLimitConfig.ttl);
      }

      if (requestCount > rateLimitConfig.limit) {
        this.logger.warn(`Rate limit exceeded for IP: ${ip}`);
        throw new HttpException(
          ErrorMessages.RATE_LIMIT_EXCEEDED,
          HttpStatus.TOO_MANY_REQUESTS,
        );
      }

      const response = context.switchToHttp().getResponse();
      response.header('X-RateLimit-Limit', rateLimitConfig.limit);
      response.header(
        'X-RateLimit-Remaining',
        rateLimitConfig.limit - requestCount,
      );
      response.header('X-RateLimit-Reset', ttl[1]);

      return true;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      this.logger.error('Rate limit check failed', error);
      return true;
    }
  }
}

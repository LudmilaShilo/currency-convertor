import { Injectable, Logger } from '@nestjs/common';
import { Redis } from 'ioredis';
import { InjectRedis } from '@nestjs-modules/ioredis';
import { Cache } from './interfaces/cash.interface';

@Injectable()
export class CacheService implements Cache {
  private readonly logger = new Logger(CacheService.name);

  constructor(@InjectRedis() private readonly redis: Redis) {}

  async get<T>(key: string): Promise<T | null> {
    try {
      const value = await this.redis.get(key);
      if (!value) return null;

      return JSON.parse(value) as T;
    } catch (error) {
      this.logger.error(`Failed to parse cached data for key ${key}`, error);
      return null;
    }
  }

  async set(key: string, value: unknown, ttl?: number): Promise<void> {
    try {
      const stringValue = JSON.stringify(value);
      if (ttl) {
        await this.redis.set(key, stringValue, 'EX', ttl);
      } else {
        await this.redis.set(key, stringValue);
      }
    } catch (error) {
      this.logger.error(`Failed to cache data for key ${key}`, error);
    }
  }

  async del(key: string): Promise<void> {
    await this.redis.del(key);
  }
}

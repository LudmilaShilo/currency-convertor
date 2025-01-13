import { Module } from '@nestjs/common';
import { CurrencyModule } from './modules/currency/currency.module';
import { ExchangeFetcherModule } from './modules/exchange-fetcher/exchange-fetcher.module';
import { CacheModule } from './modules/cache/cache.module';
import { RateLimitModule } from './modules/rate-limit/rate-limit.module';

@Module({
  imports: [
    CurrencyModule,
    ExchangeFetcherModule,
    CacheModule,
    RateLimitModule,
  ],
})
export class AppModule {}

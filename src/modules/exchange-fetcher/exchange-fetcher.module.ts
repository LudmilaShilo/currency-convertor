import { Module, OnModuleInit } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ScheduleModule } from '@nestjs/schedule';
import { ExchangeFetcherService } from './exchange-fetcher.service';
import { ExchangeFetcherProvider } from './exchange-fetcher.provider';
import { RateLimiterService } from './services/rate-limiter.service';
import { EXCHANGE_RATE_PROVIDER } from './constants/tokens';
import { CacheModule } from '../cache/cache.module';

@Module({
  imports: [HttpModule, ScheduleModule.forRoot(), CacheModule],
  providers: [
    ExchangeFetcherService,
    RateLimiterService,
    {
      provide: EXCHANGE_RATE_PROVIDER,
      useClass: ExchangeFetcherProvider,
    },
  ],
  exports: [ExchangeFetcherService],
})
export class ExchangeFetcherModule implements OnModuleInit {
  constructor(
    private readonly exchangeFetcherService: ExchangeFetcherService,
  ) {}

  async onModuleInit() {
    await this.exchangeFetcherService.validateAvailableCurrencies();
  }
}

import { Module } from '@nestjs/common';
import { CurrencyController } from './currency.controller';
import { CurrencyService } from './currency.service';
import { ExchangeFetcherModule } from '../exchange-fetcher/exchange-fetcher.module';
import { CacheModule } from '../cache/cache.module';

@Module({
  imports: [ExchangeFetcherModule, CacheModule],
  controllers: [CurrencyController],
  providers: [CurrencyService],
})
export class CurrencyModule {}

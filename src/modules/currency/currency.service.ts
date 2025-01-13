import { Injectable } from '@nestjs/common';
import {
  ConvertCurrencyDto,
  ConversionResult,
} from './dto/convert-currency.dto';
import { ExchangeFetcherService } from '../exchange-fetcher/exchange-fetcher.service';
import { CacheService } from '../cache/cache.service';
import { cacheConfig } from '../../config/cache.config';
import { apiConfig } from '../../config/api.config';

@Injectable()
export class CurrencyService {
  constructor(
    private readonly exchangeFetcherService: ExchangeFetcherService,
    private readonly cacheService: CacheService,
  ) {}

  // Some APIs of banks and exchanges return exchange rates as a list of rates for all currencies available in their service.
  // Cryptocurrency exchange APIs, where there are thousands of currency pairs, return rates for a specific currency pair.
  // As a generalized abstract approach, I chose to request the rate for a specific currency pair.
  // This allows using this service for any external API that returns rates both for a specific currency pair and for all currencies.
  async convertCurrency(dto: ConvertCurrencyDto): Promise<ConversionResult> {
    const { sourceCurrency, targetCurrency, amount } = dto;
    let rate: number;

    if (apiConfig.cacheStrategy === 'single') {
      const cacheKey = `exchange_rate:${sourceCurrency}:${targetCurrency}`;
      rate = await this.cacheService.get<number>(cacheKey);

      if (!rate) {
        const exchangeRate =
          await this.exchangeFetcherService.fetchExchangeRate(
            sourceCurrency,
            targetCurrency,
          );
        rate = exchangeRate.rate;
        await this.cacheService.set(cacheKey, rate, cacheConfig.ttl);
      }
    } else {
      const exchangeRate = await this.exchangeFetcherService.fetchExchangeRate(
        sourceCurrency,
        targetCurrency,
      );
      rate = exchangeRate.rate;
    }

    return {
      sourceCurrency,
      targetCurrency,
      amount,
      convertedAmount: Number((amount * rate).toFixed(2)),
      rate,
    };
  }
}

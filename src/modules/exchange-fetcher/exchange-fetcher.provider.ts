import { Injectable, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { catchError, retry, timeout } from 'rxjs/operators';
import { MonobankRate } from './interfaces/monobank-rate.interface';
import { RateLimiterService } from './services/rate-limiter.service';
import { CacheService } from '../cache/cache.service';
import { apiConfig } from '../../config/api.config';
import { cacheConfig } from '../../config/cache.config';
import {
  ExchangeRateProvider,
  CurrencyPair,
} from './interfaces/exchange-rate.provider';

@Injectable()
export class ExchangeFetcherProvider implements ExchangeRateProvider {
  private readonly logger = new Logger(ExchangeFetcherProvider.name);
  private readonly config = apiConfig;
  private readonly CACHE_KEY = 'exchange_rates:all';

  constructor(
    private readonly httpService: HttpService,
    private readonly rateLimiter: RateLimiterService,
    private readonly cacheService: CacheService,
  ) {}

  async fetchRate(
    sourceCurrencyCode: number,
    targetCurrencyCode: number,
  ): Promise<number> {
    if (this.config.cacheStrategy === 'bulk') {
      const rates = await this.getCachedRates();
      const rate = rates.find(
        (r) =>
          r.currencyCodeA === sourceCurrencyCode &&
          r.currencyCodeB === targetCurrencyCode,
      );

      if (!rate) {
        throw new HttpException(
          'Exchange rate not found',
          HttpStatus.SERVICE_UNAVAILABLE,
        );
      }

      return this.calculateRate(rate);
    }

    const rates = await this.fetchRates(false);
    const rate = rates.find(
      (r) =>
        r.currencyCodeA === sourceCurrencyCode &&
        r.currencyCodeB === targetCurrencyCode,
    );

    if (!rate) {
      throw new HttpException(
        'Exchange rate not found',
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }

    return this.calculateRate(rate);
  }

  async fetchAllPairs(): Promise<CurrencyPair[]> {
    const rates =
      this.config.cacheStrategy === 'bulk'
        ? await this.getCachedRates()
        : await this.fetchRates(true);

    return rates.map((rate) => ({
      currencyCodeA: rate.currencyCodeA,
      currencyCodeB: rate.currencyCodeB,
    }));
  }

  private async getCachedRates(): Promise<MonobankRate[]> {
    let rates = await this.cacheService.get<MonobankRate[]>(this.CACHE_KEY);

    if (!rates) {
      rates = await this.fetchRates(false);
      await this.cacheService.set(this.CACHE_KEY, rates, cacheConfig.ttl);
    }

    return rates;
  }

  private async fetchRates(isValidation: boolean): Promise<MonobankRate[]> {
    const configTimeout = isValidation
      ? this.config.timeout.validation
      : this.config.timeout.client;
    const context = isValidation ? 'Validation' : 'Client request';

    try {
      await this.rateLimiter.waitForNextRequest();

      const { data } = await firstValueFrom(
        this.httpService.get<MonobankRate[]>(this.config.url).pipe(
          timeout(configTimeout),
          retry({
            count: this.config.maxRetries,
            delay: (error, retryCount) => {
              const delay = 1000 * (1 << retryCount);
              this.logger.warn(
                `${context}: Retrying request (${retryCount}/${this.config.maxRetries}) after ${delay}ms`,
                error.message,
              );
              return new Promise((resolve) => setTimeout(resolve, delay));
            },
          }),
          catchError((error) => {
            this.logger.error(`${context}: Failed to fetch rates`, error);
            if (!isValidation) {
              throw new HttpException(
                'Exchange rate service is temporarily unavailable',
                HttpStatus.SERVICE_UNAVAILABLE,
              );
            }
            return [];
          }),
        ),
      );

      return data;
    } catch (error) {
      this.logger.error(`${context}: Error fetching rates`, error);
      if (!isValidation) {
        throw new HttpException(
          'Exchange rate service is temporarily unavailable',
          HttpStatus.SERVICE_UNAVAILABLE,
        );
      }
      return [];
    }
  }

  private calculateRate(rate: MonobankRate): number {
    if (rate.rateCross) {
      return rate.rateCross;
    }

    if (rate.rateBuy && rate.rateSell) {
      return (rate.rateBuy + rate.rateSell) / 2;
    }

    return rate.rateBuy || rate.rateSell || 0;
  }
}

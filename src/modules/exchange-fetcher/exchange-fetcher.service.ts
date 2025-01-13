import {
  Injectable,
  HttpException,
  HttpStatus,
  Logger,
  Inject,
} from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { ExchangeRate } from './interfaces/exchange-rate.interface';
import { CURRENCY_CODE_NUMBERS } from './constants/currency-codes';
import { ExchangeRateProvider } from './interfaces/exchange-rate.provider';
import { EXCHANGE_RATE_PROVIDER } from './constants/tokens';

@Injectable()
export class ExchangeFetcherService {
  private readonly logger = new Logger(ExchangeFetcherService.name);

  constructor(
    @Inject(EXCHANGE_RATE_PROVIDER)
    private readonly provider: ExchangeRateProvider,
  ) {}

  @Cron('0 1 * * *')
  async scheduledValidation() {
    this.logger.log('Starting scheduled currency validation');
    await this.validateAvailableCurrencies();
    this.logger.log('Finished scheduled currency validation');
  }

  async validateAvailableCurrencies(): Promise<void> {
    const pairs = await this.provider.fetchAllPairs();
    if (!pairs.length) {
      this.logger.warn('Validation skipped due to API unavailability');
      return;
    }

    const uniqueCurrencyCodes = new Set<number>();
    pairs.forEach((pair) => {
      uniqueCurrencyCodes.add(pair.currencyCodeA);
      uniqueCurrencyCodes.add(pair.currencyCodeB);
    });

    // Check for currencies that are not in our list
    const missingCurrencies = Array.from(uniqueCurrencyCodes)
      .filter((code) => !this.getCurrencyByCode(code))
      .map((code) => ({
        code,
        pairs: pairs.filter(
          (p) => p.currencyCodeA === code || p.currencyCodeB === code,
        ),
      }));

    if (missingCurrencies.length > 0) {
      this.logger.warn(
        'Found currency codes without mapping:',
        missingCurrencies
          .map(
            ({ code, pairs }) =>
              `Code ${code}: ${pairs.map((p) => `${p.currencyCodeA}/${p.currencyCodeB}`).join(', ')}`,
          )
          .join('\n'),
      );
    }

    // Check for currencies that are no longer quoted
    const ourCurrencyCodes = new Set(Object.values(CURRENCY_CODE_NUMBERS));
    const discontinuedCurrencies = Array.from(ourCurrencyCodes)
      .filter((code) => !uniqueCurrencyCodes.has(code))
      .map((code) => this.getCurrencyByCode(code));

    if (discontinuedCurrencies.length > 0) {
      this.logger.warn(
        'Found currencies that are no longer quoted:',
        discontinuedCurrencies.join(', '),
      );
    }
  }

  async fetchExchangeRate(
    sourceCurrency: string,
    targetCurrency: string,
  ): Promise<ExchangeRate> {
    const sourceCurrencyCode = this.getCurrencyCodeNumber(sourceCurrency);
    const targetCurrencyCode = this.getCurrencyCodeNumber(targetCurrency);

    if (!sourceCurrencyCode || !targetCurrencyCode) {
      throw new HttpException(
        'Unsupported currency pair',
        HttpStatus.BAD_REQUEST,
      );
    }

    const rate = await this.provider.fetchRate(
      sourceCurrencyCode,
      targetCurrencyCode,
    );

    return {
      sourceCurrency,
      targetCurrency,
      rate,
    };
  }

  private getCurrencyCodeNumber(currency: string): number {
    return CURRENCY_CODE_NUMBERS[currency] || 0;
  }

  private getCurrencyByCode(code: number): string | undefined {
    return Object.entries(CURRENCY_CODE_NUMBERS).find(
      ([, value]) => value === code,
    )?.[0];
  }
}

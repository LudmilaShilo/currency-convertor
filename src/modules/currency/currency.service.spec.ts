import { Test, TestingModule } from '@nestjs/testing';
import { HttpException } from '@nestjs/common';
import { CurrencyService } from './currency.service';
import { ExchangeFetcherService } from '../exchange-fetcher/exchange-fetcher.service';
import { CacheService } from '../cache/cache.service';
import { apiConfig } from '../../config/api.config';

describe('CurrencyService', () => {
  let service: CurrencyService;
  let exchangeFetcherService: jest.Mocked<ExchangeFetcherService>;
  let cacheService: jest.Mocked<CacheService>;

  beforeEach(async () => {
    const mockExchangeFetcherService = {
      fetchExchangeRate: jest.fn(),
    };

    const mockCacheService = {
      get: jest.fn(),
      set: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CurrencyService,
        {
          provide: ExchangeFetcherService,
          useValue: mockExchangeFetcherService,
        },
        {
          provide: CacheService,
          useValue: mockCacheService,
        },
      ],
    }).compile();

    service = module.get<CurrencyService>(CurrencyService);
    exchangeFetcherService = module.get(ExchangeFetcherService);
    cacheService = module.get(CacheService);
  });

  describe('convertCurrency', () => {
    const dto = {
      sourceCurrency: 'USD',
      targetCurrency: 'EUR',
      amount: 100,
    };

    it('should return conversion result with single cache strategy', async () => {
      apiConfig.cacheStrategy = 'single';
      const rate = 0.85;
      cacheService.get.mockResolvedValueOnce(null);
      exchangeFetcherService.fetchExchangeRate.mockResolvedValueOnce({
        sourceCurrency: 'USD',
        targetCurrency: 'EUR',
        rate,
      });

      const result = await service.convertCurrency(dto);

      expect(result).toEqual({
        sourceCurrency: 'USD',
        targetCurrency: 'EUR',
        amount: 100,
        convertedAmount: 85,
        rate: 0.85,
      });
      expect(cacheService.set).toHaveBeenCalled();
    });

    it('should use cached rate when available', async () => {
      apiConfig.cacheStrategy = 'single';
      const rate = 0.85;
      cacheService.get.mockResolvedValueOnce(rate);

      const result = await service.convertCurrency(dto);

      expect(result.rate).toBe(rate);
      expect(exchangeFetcherService.fetchExchangeRate).not.toHaveBeenCalled();
    });

    it('should not use cache with bulk strategy', async () => {
      apiConfig.cacheStrategy = 'bulk';
      const rate = 0.85;
      exchangeFetcherService.fetchExchangeRate.mockResolvedValueOnce({
        sourceCurrency: 'USD',
        targetCurrency: 'EUR',
        rate,
      });

      const result = await service.convertCurrency(dto);

      expect(result.rate).toBe(rate);
      expect(cacheService.get).not.toHaveBeenCalled();
    });

    it('should throw error for unsupported currency pair', async () => {
      exchangeFetcherService.fetchExchangeRate.mockRejectedValueOnce(
        new HttpException('Unsupported currency pair', 400),
      );

      await expect(service.convertCurrency(dto)).rejects.toThrow(
        'Unsupported currency pair',
      );
    });

    it('should handle API errors gracefully', async () => {
      exchangeFetcherService.fetchExchangeRate.mockRejectedValueOnce(
        new HttpException('Service unavailable', 503),
      );

      await expect(service.convertCurrency(dto)).rejects.toThrow(
        'Service unavailable',
      );
    });
  });
});

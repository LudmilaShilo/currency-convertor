import { Test, TestingModule } from '@nestjs/testing';
import { HttpService } from '@nestjs/axios';
import { of } from 'rxjs';
import { AxiosResponse } from 'axios';
import { ExchangeFetcherProvider } from './exchange-fetcher.provider';
import { RateLimiterService } from './services/rate-limiter.service';
import { CacheService } from '../cache/cache.service';
import { MonobankRate } from './interfaces/monobank-rate.interface';

jest.setTimeout(10000);

describe('ExchangeFetcherProvider', () => {
  let provider: ExchangeFetcherProvider;
  let httpService: jest.Mocked<HttpService>;
  let cacheService: jest.Mocked<CacheService>;

  const mockRate: MonobankRate = {
    currencyCodeA: 840, // USD
    currencyCodeB: 980, // UAH
    date: Date.now(),
    rateBuy: 41,
    rateSell: 42,
  };

  const mockAxiosResponse: AxiosResponse = {
    data: [mockRate],
    status: 200,
    statusText: 'OK',
    headers: {},
    config: { headers: {} } as any,
  };

  beforeEach(async () => {
    const mockHttpService = {
      get: jest.fn(),
    };

    const mockRateLimiter = {
      waitForNextRequest: jest.fn(),
    };

    const mockCacheService = {
      get: jest.fn(),
      set: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ExchangeFetcherProvider,
        {
          provide: HttpService,
          useValue: mockHttpService,
        },
        {
          provide: RateLimiterService,
          useValue: mockRateLimiter,
        },
        {
          provide: CacheService,
          useValue: mockCacheService,
        },
      ],
    }).compile();

    provider = module.get<ExchangeFetcherProvider>(ExchangeFetcherProvider);
    httpService = module.get(HttpService);
    cacheService = module.get(CacheService);
  });

  describe('fetchRate', () => {
    it('should return rate from cache when using bulk strategy', async () => {
      cacheService.get.mockResolvedValueOnce([mockRate]);

      const rate = await provider.fetchRate(840, 980);

      expect(rate).toBe(41.5);
      expect(cacheService.get).toHaveBeenCalled();
    });

    it('should fetch rate from API when not in cache', async () => {
      httpService.get.mockReturnValueOnce(of(mockAxiosResponse));

      const rate = await provider.fetchRate(840, 980);

      expect(rate).toBe(41.5);
      expect(httpService.get).toHaveBeenCalled();
    });
  });

  describe('fetchAllPairs', () => {
    it('should return all currency pairs', async () => {
      httpService.get.mockReturnValueOnce(of(mockAxiosResponse));

      const pairs = await provider.fetchAllPairs();

      expect(pairs).toEqual([
        {
          currencyCodeA: 840,
          currencyCodeB: 980,
        },
      ]);
    });

    it('should handle empty response', async () => {
      const emptyResponse = { ...mockAxiosResponse, data: [] };
      httpService.get.mockReturnValueOnce(of(emptyResponse));

      const pairs = await provider.fetchAllPairs();

      expect(pairs).toEqual([]);
    });
  });
});

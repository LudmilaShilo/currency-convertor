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
    currencyCodeB: 978, // EUR
    date: Date.now(),
    rateBuy: 0.85,
    rateSell: 0.86,
  };

  const mockCrossRate: MonobankRate = {
    currencyCodeA: 978, // EUR
    currencyCodeB: 826, // GBP
    date: Date.now(),
    rateCross: 0.88,
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

      const rate = await provider.fetchRate(840, 978);

      expect(rate).toBe(0.855); // (0.85 + 0.86) / 2
      expect(cacheService.get).toHaveBeenCalled();
    });

    it('should fetch rate from API when not in cache', async () => {
      httpService.get.mockReturnValueOnce(of(mockAxiosResponse));

      const rate = await provider.fetchRate(840, 978);

      expect(rate).toBe(0.855);
      expect(httpService.get).toHaveBeenCalled();
    });

    it('should calculate cross rate correctly', async () => {
      const crossRateResponse = { ...mockAxiosResponse, data: [mockCrossRate] };
      httpService.get.mockReturnValueOnce(of(crossRateResponse));

      const rate = await provider.fetchRate(978, 826);

      expect(rate).toBe(0.88);
    });
  });

  describe('fetchAllPairs', () => {
    it('should return all currency pairs', async () => {
      httpService.get.mockReturnValueOnce(of(mockAxiosResponse));

      const pairs = await provider.fetchAllPairs();

      expect(pairs).toEqual([
        {
          currencyCodeA: 840,
          currencyCodeB: 978,
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

import { ApiConfig } from './interfaces/api-config.interface';

export const apiConfig: ApiConfig = {
  url: 'https://api.monobank.ua/bank/currency',
  timeout: {
    validation: 180000, // 3 minutes
    client: 5000, // 5 seconds
  },
  maxRetries: 3,
  rateLimit: 60000, // 1 minute
  cacheStrategy: 'bulk', // for Monobank we use bulk caching
};

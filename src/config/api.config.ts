import { ApiConfig } from './interfaces/api-config.interface';
import { API_TIMEOUTS } from '../common/constants';

export const apiConfig: ApiConfig = {
  url: 'https://api.monobank.ua/bank/currency',
  timeout: {
    validation: API_TIMEOUTS.VALIDATION_MS,
    client: API_TIMEOUTS.CLIENT_MS,
  },
  maxRetries: 3,
  rateLimit: API_TIMEOUTS.RATE_LIMIT_MS,
  cacheStrategy: 'bulk', // for Monobank we use bulk caching
};

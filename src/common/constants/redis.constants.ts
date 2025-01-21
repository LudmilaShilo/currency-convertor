export const REDIS = {
  DEFAULT_PORT: 6379,
  DEFAULT_HOST: 'localhost',
  CACHE_PREFIX: 'exchange_rates',
  ALL_RATES_KEY: 'exchange_rates:all',
} as const;

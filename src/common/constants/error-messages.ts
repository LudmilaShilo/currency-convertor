export const ErrorMessages = {
  INVALID_PARAMETERS: 'Invalid request parameters',
  SERVICE_UNAVAILABLE: 'Service temporarily unavailable',
  RATE_LIMIT_EXCEEDED: 'Too many requests. Please try again later',
  UNSUPPORTED_CURRENCY: 'Unsupported currency pair',
  INVALID_SOURCE_CURRENCY:
    'Source currency must be one of: USD, EUR, UAH, GBP, PLN, CHF, JPY, CNY, CZK, DKK',
  INVALID_TARGET_CURRENCY:
    'Target currency must be one of: USD, EUR, UAH, GBP, PLN, CHF, JPY, CNY, CZK, DKK',
} as const;

export const TIME = {
  ONE_SECOND_MS: 1000,
  ONE_MINUTE_MS: 60 * 1000,
  THREE_MINUTES_MS: 180 * 1000,
  ONE_HOUR_SEC: 3600,
} as const;

export const API_TIMEOUTS = {
  VALIDATION_MS: TIME.THREE_MINUTES_MS, // 3 minutes
  CLIENT_MS: 5 * TIME.ONE_SECOND_MS, // 5 seconds
  RATE_LIMIT_MS: TIME.ONE_MINUTE_MS, // 1 minute
} as const;

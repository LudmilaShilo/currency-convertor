export interface ApiConfig {
  monobank: {
    url: string;
    timeout: {
      validation: number;
      client: number;
    };
    maxRetries: number;
    rateLimit: number;
  };
}

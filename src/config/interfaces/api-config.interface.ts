export interface ApiConfig {
  url: string;
  timeout: {
    validation: number;
    client: number;
  };
  maxRetries: number;
  rateLimit: number;
  cacheStrategy: 'single' | 'bulk';
}

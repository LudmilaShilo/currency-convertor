export interface CurrencyPair {
  currencyCodeA: number;
  currencyCodeB: number;
}

export interface ExchangeRateProvider {
  fetchRate(
    sourceCurrencyCode: number,
    targetCurrencyCode: number,
  ): Promise<number>;
  fetchAllPairs(): Promise<CurrencyPair[]>;
}

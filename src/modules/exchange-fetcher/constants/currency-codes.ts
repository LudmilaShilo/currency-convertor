import { SupportedCurrencies } from '../../currency/enums/supported-currencies.enum';

export const CURRENCY_CODE_NUMBERS: Record<SupportedCurrencies, number> = {
  [SupportedCurrencies.USD]: 840,
  [SupportedCurrencies.EUR]: 978,
  [SupportedCurrencies.UAH]: 980,
  [SupportedCurrencies.GBP]: 826,
  [SupportedCurrencies.PLN]: 985,
  [SupportedCurrencies.CHF]: 756,
  [SupportedCurrencies.JPY]: 392,
  [SupportedCurrencies.CNY]: 156,
  [SupportedCurrencies.CZK]: 203,
  [SupportedCurrencies.DKK]: 208,
};

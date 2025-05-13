import * as countries from 'i18n-iso-countries';
import * as currencyCodes from 'currency-codes';

// eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-require-imports -- This require import is fine here
countries.registerLocale(require('i18n-iso-countries/langs/en.json'));

export const CURRENCY_CODES = currencyCodes.codes();
export const COUNTRY_CODES = Object.keys(countries.getAlpha2Codes());

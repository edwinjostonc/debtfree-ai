/**
 * Currency service using frankfurter.app (free, no API key, ECB data).
 * Rates cached in memory for 1 hour per process.
 */

export const SUPPORTED_CURRENCIES = [
  { code: "USD", name: "US Dollar", symbol: "$" },
  { code: "EUR", name: "Euro", symbol: "€" },
  { code: "GBP", name: "British Pound", symbol: "£" },
  { code: "INR", name: "Indian Rupee", symbol: "₹" },
  { code: "CAD", name: "Canadian Dollar", symbol: "CA$" },
  { code: "AUD", name: "Australian Dollar", symbol: "A$" },
  { code: "JPY", name: "Japanese Yen", symbol: "¥" },
  { code: "CHF", name: "Swiss Franc", symbol: "CHF" },
  { code: "CNY", name: "Chinese Yuan", symbol: "¥" },
  { code: "SGD", name: "Singapore Dollar", symbol: "S$" },
  { code: "HKD", name: "Hong Kong Dollar", symbol: "HK$" },
  { code: "NZD", name: "New Zealand Dollar", symbol: "NZ$" },
  { code: "SEK", name: "Swedish Krona", symbol: "kr" },
  { code: "NOK", name: "Norwegian Krone", symbol: "kr" },
  { code: "DKK", name: "Danish Krone", symbol: "kr" },
  { code: "MXN", name: "Mexican Peso", symbol: "MX$" },
  { code: "BRL", name: "Brazilian Real", symbol: "R$" },
  { code: "ZAR", name: "South African Rand", symbol: "R" },
  { code: "AED", name: "UAE Dirham", symbol: "د.إ" },
  { code: "SAR", name: "Saudi Riyal", symbol: "﷼" },
  { code: "MYR", name: "Malaysian Ringgit", symbol: "RM" },
  { code: "THB", name: "Thai Baht", symbol: "฿" },
  { code: "IDR", name: "Indonesian Rupiah", symbol: "Rp" },
  { code: "PHP", name: "Philippine Peso", symbol: "₱" },
  { code: "PKR", name: "Pakistani Rupee", symbol: "₨" },
  { code: "BDT", name: "Bangladeshi Taka", symbol: "৳" },
  { code: "NGN", name: "Nigerian Naira", symbol: "₦" },
  { code: "KES", name: "Kenyan Shilling", symbol: "KSh" },
  { code: "GHS", name: "Ghanaian Cedi", symbol: "₵" },
  { code: "EGP", name: "Egyptian Pound", symbol: "£" },
  { code: "TRY", name: "Turkish Lira", symbol: "₺" },
  { code: "PLN", name: "Polish Zloty", symbol: "zł" },
  { code: "CZK", name: "Czech Koruna", symbol: "Kč" },
  { code: "HUF", name: "Hungarian Forint", symbol: "Ft" },
  { code: "RON", name: "Romanian Leu", symbol: "lei" },
  { code: "KRW", name: "South Korean Won", symbol: "₩" },
  { code: "TWD", name: "Taiwan Dollar", symbol: "NT$" },
  { code: "VND", name: "Vietnamese Dong", symbol: "₫" },
  { code: "CLP", name: "Chilean Peso", symbol: "$" },
  { code: "COP", name: "Colombian Peso", symbol: "$" },
  { code: "PEN", name: "Peruvian Sol", symbol: "S/" },
  { code: "ARS", name: "Argentine Peso", symbol: "$" },
] as const;

export type CurrencyCode = (typeof SUPPORTED_CURRENCIES)[number]["code"];

// In-memory rate cache: base → { rates, fetchedAt }
const rateCache = new Map<string, { rates: Record<string, number>; fetchedAt: number }>();
const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour

// Fallback static rates (relative to USD) for offline/error fallback
const STATIC_FALLBACK: Record<string, number> = {
  USD: 1, EUR: 0.92, GBP: 0.79, INR: 83.5, CAD: 1.36, AUD: 1.53,
  JPY: 149.5, CHF: 0.90, CNY: 7.24, SGD: 1.34, HKD: 7.82, NZD: 1.65,
  SEK: 10.4, NOK: 10.6, DKK: 6.89, MXN: 17.2, BRL: 4.97, ZAR: 18.6,
  AED: 3.67, SAR: 3.75, MYR: 4.72, THB: 35.1, IDR: 15800, PHP: 56.5,
  PKR: 278, BDT: 110, NGN: 1580, KES: 129, GHS: 12.5, EGP: 30.9,
  TRY: 32.5, PLN: 3.97, CZK: 22.8, HUF: 356, RON: 4.59, KRW: 1325,
  TWD: 31.8, VND: 24400, CLP: 950, COP: 3950, PEN: 3.72, ARS: 855,
};

async function fetchRates(base: string): Promise<Record<string, number>> {
  const cached = rateCache.get(base);
  if (cached && Date.now() - cached.fetchedAt < CACHE_TTL_MS) {
    return cached.rates;
  }

  try {
    const res = await fetch(
      `https://api.frankfurter.app/latest?from=${base}`,
      { next: { revalidate: 3600 } }
    );
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    const rates: Record<string, number> = { [base]: 1, ...data.rates };
    rateCache.set(base, { rates, fetchedAt: Date.now() });
    return rates;
  } catch {
    // Return static fallback converted to requested base
    const baseToUSD = STATIC_FALLBACK[base] ?? 1;
    const rates: Record<string, number> = {};
    for (const [code, usdRate] of Object.entries(STATIC_FALLBACK)) {
      rates[code] = usdRate / baseToUSD;
    }
    return rates;
  }
}

/** Convert `amount` from `fromCurrency` to `toCurrency` */
export async function convertAmount(
  amount: number,
  from: string,
  to: string
): Promise<number> {
  if (from === to) return amount;
  const rates = await fetchRates(from);
  const rate = rates[to];
  if (!rate) return amount; // unknown currency — return as-is
  return amount * rate;
}

/** Fetch all rates from a given base. Returns Record<currencyCode, rate>. */
export async function getRates(base: string): Promise<Record<string, number>> {
  return fetchRates(base);
}

/** Format a number as currency string */
export function formatMoney(amount: number, currencyCode: string): string {
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currencyCode,
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch {
    const info = SUPPORTED_CURRENCIES.find((c) => c.code === currencyCode);
    return `${info?.symbol ?? currencyCode}${amount.toLocaleString()}`;
  }
}

export function getCurrencyInfo(code: string) {
  return SUPPORTED_CURRENCIES.find((c) => c.code === code) ?? { code, name: code, symbol: code };
}

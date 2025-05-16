export type OptionType = 'Call' | 'Put';

export interface Option {
  ticker: string;
  type: OptionType;
  spotPrice: number;      // S: Current stock price
  strikePrice: number;    // K: Strike price
  timeToExpiry: number;   // T: Time to expiration in years
  volatility: number;     // σ: Volatility
  riskFreeRate: number;   // r: Risk-free interest rate
  quantity: number;       // Number of contracts
}

export interface OptionGreeks {
  delta: number;
  gamma: number;
  theta: number;
  vega: number;
  rho: number;
}

export interface OptionMetrics extends Option {
  price: number;
  greeks: OptionGreeks;
  totalValue: number;     // price * quantity
}

export interface Portfolio {
  options: OptionMetrics[];
  totalValue: number;
  aggregateGreeks: OptionGreeks;
} 
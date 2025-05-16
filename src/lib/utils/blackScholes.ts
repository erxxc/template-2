import { Option, OptionGreeks } from '@/types/option';

// Standard normal cumulative distribution function
function normalCDF(x: number): number {
  const t = 1 / (1 + 0.2316419 * Math.abs(x));
  const d = 0.3989423 * Math.exp(-x * x / 2);
  const p = d * t * (0.3193815 + t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274))));
  return x > 0 ? 1 - p : p;
}

// Standard normal probability density function
function normalPDF(x: number): number {
  return Math.exp(-0.5 * x * x) / Math.sqrt(2 * Math.PI);
}

// Calculate d1 and d2 parameters
function calculateD1D2(S: number, K: number, T: number, r: number, sigma: number): [number, number] {
  const d1 = (Math.log(S / K) + (r + sigma * sigma / 2) * T) / (sigma * Math.sqrt(T));
  const d2 = d1 - sigma * Math.sqrt(T);
  return [d1, d2];
}

// Calculate option price using Black-Scholes formula
export function calculateOptionPrice(option: Option): number {
  const { spotPrice: S, strikePrice: K, timeToExpiry: T, riskFreeRate: r, volatility: sigma, type } = option;
  
  const [d1, d2] = calculateD1D2(S, K, T, r, sigma);
  const discountFactor = Math.exp(-r * T);
  
  if (type === 'Call') {
    return S * normalCDF(d1) - K * discountFactor * normalCDF(d2);
  } else {
    return K * discountFactor * normalCDF(-d2) - S * normalCDF(-d1);
  }
}

// Calculate option Greeks
export function calculateGreeks(option: Option): OptionGreeks {
  const { spotPrice: S, strikePrice: K, timeToExpiry: T, riskFreeRate: r, volatility: sigma, type } = option;
  
  const [d1, d2] = calculateD1D2(S, K, T, r, sigma);
  const discountFactor = Math.exp(-r * T);
  const sign = type === 'Call' ? 1 : -1;
  
  // Delta
  const delta = sign * normalCDF(sign * d1);
  
  // Gamma (same for calls and puts)
  const gamma = normalPDF(d1) / (S * sigma * Math.sqrt(T));
  
  // Theta
  const theta = -S * sigma * normalPDF(d1) / (2 * Math.sqrt(T)) -
    sign * r * K * discountFactor * normalCDF(sign * d2);
  
  // Vega (same for calls and puts)
  const vega = S * Math.sqrt(T) * normalPDF(d1);
  
  // Rho
  const rho = sign * K * T * discountFactor * normalCDF(sign * d2);
  
  return {
    delta,
    gamma,
    theta,
    vega,
    rho
  };
}

// Calculate full option metrics
export function calculateOptionMetrics(option: Option) {
  const price = calculateOptionPrice(option);
  const greeks = calculateGreeks(option);
  const totalValue = price * option.quantity;
  
  return {
    ...option,
    price,
    greeks,
    totalValue
  };
}

// Aggregate portfolio metrics
export function calculatePortfolioMetrics(options: Option[]) {
  const optionMetrics = options.map(calculateOptionMetrics);
  
  const totalValue = optionMetrics.reduce((sum, opt) => sum + opt.totalValue, 0);
  
  const aggregateGreeks: OptionGreeks = {
    delta: 0,
    gamma: 0,
    theta: 0,
    vega: 0,
    rho: 0
  };
  
  optionMetrics.forEach(opt => {
    Object.keys(aggregateGreeks).forEach(greek => {
      aggregateGreeks[greek as keyof OptionGreeks] += 
        opt.greeks[greek as keyof OptionGreeks] * opt.quantity;
    });
  });
  
  return {
    options: optionMetrics,
    totalValue,
    aggregateGreeks
  };
} 
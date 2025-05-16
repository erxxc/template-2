import jStat from 'jstat';

export interface BlackScholesInputs {
  stockPrice: number;
  strikePrice: number;
  timeToMaturity: number;
  volatility: number;
  riskFreeRate: number;
  isCall: boolean;
}

export interface BlackScholesOutputs {
  optionPrice: number;
  d1: number;
  d2: number;
  delta: number;
  gamma: number;
  theta: number;
  vega: number;
  rho: number;
}

export function calculateBlackScholes(inputs: BlackScholesInputs): BlackScholesOutputs {
  const { stockPrice: S, strikePrice: K, timeToMaturity: T, volatility: v, riskFreeRate: r, isCall } = inputs;

  // Calculate d1 and d2
  const d1 = (Math.log(S / K) + (r + v * v / 2) * T) / (v * Math.sqrt(T));
  const d2 = d1 - v * Math.sqrt(T);

  // Standard normal CDF and PDF
  const Nd1 = jStat.normal.cdf(isCall ? d1 : -d1, 0, 1);
  const Nd2 = jStat.normal.cdf(isCall ? d2 : -d2, 0, 1);
  const Npd1 = jStat.normal.pdf(d1, 0, 1);

  // Calculate option price
  const optionPrice = isCall
    ? S * Nd1 - K * Math.exp(-r * T) * Nd2
    : K * Math.exp(-r * T) * (1 - Nd2) - S * (1 - Nd1);

  // Calculate Greeks
  const delta = isCall ? Nd1 : Nd1 - 1;
  const gamma = Npd1 / (S * v * Math.sqrt(T));
  const theta = -(S * v * Npd1) / (2 * Math.sqrt(T)) - 
                (isCall ? 1 : -1) * r * K * Math.exp(-r * T) * Nd2;
  const vega = S * Math.sqrt(T) * Npd1;
  const rho = (isCall ? 1 : -1) * K * T * Math.exp(-r * T) * Nd2;

  return {
    optionPrice,
    d1,
    d2,
    delta,
    gamma,
    theta,
    vega,
    rho
  };
}

// Input validation functions
export const validateInputs = {
  stockPrice: (value: number) => value > 0,
  strikePrice: (value: number) => value > 0,
  timeToMaturity: (value: number) => value > 0 && value <= 10,
  volatility: (value: number) => value > 0 && value <= 2,
  riskFreeRate: (value: number) => value >= -0.1 && value <= 0.5
};

// Default values
export const defaultInputs: BlackScholesInputs = {
  stockPrice: 100,
  strikePrice: 100,
  timeToMaturity: 1,
  volatility: 0.2,
  riskFreeRate: 0.05,
  isCall: true
}; 
import { useState } from 'react';
import { Option, Portfolio } from '@/types/option';
import { calculatePortfolioMetrics } from '@/lib/utils/blackScholes';

interface StressParams {
  spotPriceChange: number;
  volatilityChange: number;
  rateChange: number;
}

interface StressTestProps {
  portfolio: Portfolio;
  onStressTestComplete?: (results: {
    spotPriceChange: number;
    volatilityChange: number;
    rateChange: number;
    stressedPortfolio: Portfolio;
  }) => void;
}

export default function StressTest({ portfolio, onStressTestComplete }: StressTestProps) {
  const [stressParams, setStressParams] = useState<StressParams>({
    spotPriceChange: 0,
    volatilityChange: 0,
    rateChange: 0
  });

  const [stressedPortfolio, setStressedPortfolio] = useState<Portfolio | null>(null);

  const handleParamChange = (param: keyof StressParams, value: string) => {
    const numValue = parseFloat(value) || 0;
    setStressParams(prev => ({
      ...prev,
      [param]: numValue
    }));
  };

  const runStressTest = () => {
    const stressedOptions: Option[] = portfolio.options.map(option => ({
      ...option,
      spotPrice: option.spotPrice * (1 + stressParams.spotPriceChange / 100),
      volatility: option.volatility * (1 + stressParams.volatilityChange / 100),
      riskFreeRate: option.riskFreeRate + stressParams.rateChange / 100
    }));

    const newPortfolio = calculatePortfolioMetrics(stressedOptions);
    setStressedPortfolio(newPortfolio);

    if (onStressTestComplete) {
      onStressTestComplete({
        ...stressParams,
        stressedPortfolio: newPortfolio
      });
    }
  };

  const formatChange = (current: number, original: number): string => {
    const change = ((current - original) / Math.abs(original)) * 100;
    const sign = change > 0 ? '+' : '';
    return `${sign}${change.toFixed(2)}%`;
  };

  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(value);
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-2xl font-semibold mb-6">Stress Test Analysis</h2>
      
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        <div className="xl:col-span-3 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Spot Price Change (%)
              </label>
              <input
                type="number"
                value={stressParams.spotPriceChange}
                onChange={(e) => handleParamChange('spotPriceChange', e.target.value)}
                className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                step="1"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Volatility Change (%)
              </label>
              <input
                type="number"
                value={stressParams.volatilityChange}
                onChange={(e) => handleParamChange('volatilityChange', e.target.value)}
                className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                step="1"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Interest Rate Change (%)
              </label>
              <input
                type="number"
                value={stressParams.rateChange}
                onChange={(e) => handleParamChange('rateChange', e.target.value)}
                className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                step="0.25"
              />
            </div>
          </div>

          <button
            onClick={runStressTest}
            className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Run Stress Test
          </button>
        </div>

        {stressedPortfolio && (
          <div className="xl:col-span-1">
            <h3 className="text-lg font-medium mb-4">Results Summary</h3>
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <h4 className="text-sm font-medium text-gray-500">Portfolio Value</h4>
                <p className="text-lg font-semibold mt-1">{formatCurrency(stressedPortfolio.totalValue)}</p>
                <p className="text-sm text-gray-500 mt-1">
                  Change: {formatChange(stressedPortfolio.totalValue, portfolio.totalValue)}
                </p>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <h4 className="text-sm font-medium text-gray-500">Delta</h4>
                <p className="text-lg font-semibold mt-1">{stressedPortfolio.aggregateGreeks.delta.toFixed(4)}</p>
                <p className="text-sm text-gray-500 mt-1">
                  Change: {formatChange(stressedPortfolio.aggregateGreeks.delta, portfolio.aggregateGreeks.delta)}
                </p>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <h4 className="text-sm font-medium text-gray-500">Gamma</h4>
                <p className="text-lg font-semibold mt-1">{stressedPortfolio.aggregateGreeks.gamma.toFixed(4)}</p>
                <p className="text-sm text-gray-500 mt-1">
                  Change: {formatChange(stressedPortfolio.aggregateGreeks.gamma, portfolio.aggregateGreeks.gamma)}
                </p>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <h4 className="text-sm font-medium text-gray-500">Vega</h4>
                <p className="text-lg font-semibold mt-1">{stressedPortfolio.aggregateGreeks.vega.toFixed(4)}</p>
                <p className="text-sm text-gray-500 mt-1">
                  Change: {formatChange(stressedPortfolio.aggregateGreeks.vega, portfolio.aggregateGreeks.vega)}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 
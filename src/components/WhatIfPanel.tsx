import { useState, useEffect } from 'react';
import { Portfolio, Option } from '@/types/option';
import { calculatePortfolioMetrics } from '@/lib/utils/blackScholes';

interface WhatIfPanelProps {
  portfolio: Portfolio;
  onPortfolioChange: (newPortfolio: Portfolio) => void;
}

interface TuningParams {
  volatilityMultiplier: number;
  timeDecayDays: number;
  rateShift: number;
}

export default function WhatIfPanel({ portfolio, onPortfolioChange }: WhatIfPanelProps) {
  const [params, setParams] = useState<TuningParams>({
    volatilityMultiplier: 1,
    timeDecayDays: 0,
    rateShift: 0
  });

  const [debounceTimeout, setDebounceTimeout] = useState<NodeJS.Timeout | null>(null);

  // Debounced portfolio recalculation
  useEffect(() => {
    if (debounceTimeout) {
      clearTimeout(debounceTimeout);
    }

    const timeout = setTimeout(() => {
      const adjustedOptions: Option[] = portfolio.options.map(option => ({
        ...option,
        volatility: option.volatility * params.volatilityMultiplier,
        timeToExpiry: Math.max(0, option.timeToExpiry - params.timeDecayDays / 365),
        riskFreeRate: option.riskFreeRate + params.rateShift / 100
      }));

      const newPortfolio = calculatePortfolioMetrics(adjustedOptions);
      onPortfolioChange(newPortfolio);
    }, 100);

    setDebounceTimeout(timeout);

    return () => {
      if (timeout) clearTimeout(timeout);
    };
  }, [params, portfolio, onPortfolioChange]);

  const handleParamChange = (param: keyof TuningParams, value: number) => {
    setParams(prev => ({
      ...prev,
      [param]: value
    }));
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-xl font-semibold mb-6">What-If Analysis</h2>
      
      <div className="space-y-6">
        {/* Volatility Multiplier */}
        <div>
          <div className="flex justify-between mb-2">
            <label className="text-sm font-medium text-gray-700">
              Volatility Multiplier
            </label>
            <span className="text-sm text-gray-500">
              {(params.volatilityMultiplier * 100).toFixed(0)}%
            </span>
          </div>
          <input
            type="range"
            min="0.5"
            max="2"
            step="0.1"
            value={params.volatilityMultiplier}
            onChange={(e) => handleParamChange('volatilityMultiplier', parseFloat(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>50%</span>
            <span>200%</span>
          </div>
        </div>

        {/* Time Decay */}
        <div>
          <div className="flex justify-between mb-2">
            <label className="text-sm font-medium text-gray-700">
              Time Decay (Days)
            </label>
            <span className="text-sm text-gray-500">
              {params.timeDecayDays} days
            </span>
          </div>
          <input
            type="range"
            min="0"
            max="30"
            step="1"
            value={params.timeDecayDays}
            onChange={(e) => handleParamChange('timeDecayDays', parseFloat(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>0</span>
            <span>30</span>
          </div>
        </div>

        {/* Interest Rate Shift */}
        <div>
          <div className="flex justify-between mb-2">
            <label className="text-sm font-medium text-gray-700">
              Interest Rate Shift (bps)
            </label>
            <span className="text-sm text-gray-500">
              {params.rateShift > 0 ? '+' : ''}{params.rateShift} bps
            </span>
          </div>
          <input
            type="range"
            min="-50"
            max="50"
            step="5"
            value={params.rateShift}
            onChange={(e) => handleParamChange('rateShift', parseFloat(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>-50 bps</span>
            <span>+50 bps</span>
          </div>
        </div>

        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <h3 className="text-sm font-medium text-blue-800 mb-2">Real-time Adjustments</h3>
          <p className="text-sm text-blue-600">
            Move the sliders to see how changes in volatility, time decay, and interest rates affect your portfolio metrics.
            All calculations update automatically.
          </p>
        </div>
      </div>
    </div>
  );
} 
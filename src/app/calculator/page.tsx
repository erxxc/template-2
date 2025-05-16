'use client';

import { useState } from 'react';
import { BlackScholesInputs, BlackScholesResults, calculateBlackScholes, validateInputs } from '@/lib/utils/black-scholes';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function Calculator() {
  const [inputs, setInputs] = useState<BlackScholesInputs>({
    stockPrice: 100,
    strikePrice: 100,
    timeToMaturity: 1,
    volatility: 0.2,
    riskFreeRate: 0.05,
    optionType: 'call'
  });

  const [results, setResults] = useState<BlackScholesResults | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setInputs(prev => ({
      ...prev,
      [name]: name === 'optionType' ? value : parseFloat(value)
    }));
  };

  const handleCalculate = () => {
    const validationError = validateInputs(inputs);
    if (validationError) {
      setError(validationError);
      setResults(null);
      return;
    }

    setError(null);
    const results = calculateBlackScholes(inputs);
    setResults(results);
  };

  // Generate sensitivity analysis data
  const generateSensitivityData = () => {
    if (!results) return [];
    
    const volatilityPoints = Array.from({ length: 11 }, (_, i) => {
      const vol = inputs.volatility * (0.5 + i * 0.1);
      const result = calculateBlackScholes({
        ...inputs,
        volatility: vol
      });
      return {
        volatility: (vol * 100).toFixed(1) + '%',
        price: result.optionPrice
      };
    });

    return volatilityPoints;
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-center">Option Calculator</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Input Form */}
          <div className="bg-gray-800 p-6 rounded-lg">
            <h2 className="text-2xl font-semibold mb-6">Input Parameters</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Stock Price ($)</label>
                <input
                  type="number"
                  name="stockPrice"
                  value={inputs.stockPrice}
                  onChange={handleInputChange}
                  className="w-full bg-gray-700 rounded px-3 py-2 text-white"
                  step="0.01"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Strike Price ($)</label>
                <input
                  type="number"
                  name="strikePrice"
                  value={inputs.strikePrice}
                  onChange={handleInputChange}
                  className="w-full bg-gray-700 rounded px-3 py-2 text-white"
                  step="0.01"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Time to Maturity (years)</label>
                <input
                  type="number"
                  name="timeToMaturity"
                  value={inputs.timeToMaturity}
                  onChange={handleInputChange}
                  className="w-full bg-gray-700 rounded px-3 py-2 text-white"
                  step="0.1"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Volatility (%)</label>
                <input
                  type="number"
                  name="volatility"
                  value={inputs.volatility * 100}
                  onChange={(e) => handleInputChange({
                    ...e,
                    target: {
                      ...e.target,
                      name: 'volatility',
                      value: (parseFloat(e.target.value) / 100).toString()
                    }
                  })}
                  className="w-full bg-gray-700 rounded px-3 py-2 text-white"
                  step="1"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Risk-Free Rate (%)</label>
                <input
                  type="number"
                  name="riskFreeRate"
                  value={inputs.riskFreeRate * 100}
                  onChange={(e) => handleInputChange({
                    ...e,
                    target: {
                      ...e.target,
                      name: 'riskFreeRate',
                      value: (parseFloat(e.target.value) / 100).toString()
                    }
                  })}
                  className="w-full bg-gray-700 rounded px-3 py-2 text-white"
                  step="0.1"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Option Type</label>
                <select
                  name="optionType"
                  value={inputs.optionType}
                  onChange={handleInputChange}
                  className="w-full bg-gray-700 rounded px-3 py-2 text-white"
                >
                  <option value="call">Call</option>
                  <option value="put">Put</option>
                </select>
              </div>

              <button
                onClick={handleCalculate}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition-colors"
              >
                Calculate
              </button>

              {error && (
                <div className="text-red-400 mt-4">
                  {error}
                </div>
              )}
            </div>
          </div>

          {/* Results */}
          <div className="bg-gray-800 p-6 rounded-lg">
            <h2 className="text-2xl font-semibold mb-6">Results</h2>
            
            {results && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-700 p-4 rounded">
                    <div className="text-sm text-gray-400">Option Price</div>
                    <div className="text-2xl font-bold">${results.optionPrice.toFixed(2)}</div>
                  </div>
                  <div className="bg-gray-700 p-4 rounded">
                    <div className="text-sm text-gray-400">d1</div>
                    <div className="text-2xl font-bold">{results.d1.toFixed(4)}</div>
                  </div>
                  <div className="bg-gray-700 p-4 rounded">
                    <div className="text-sm text-gray-400">d2</div>
                    <div className="text-2xl font-bold">{results.d2.toFixed(4)}</div>
                  </div>
                </div>

                <div className="mt-8">
                  <h3 className="text-xl font-semibold mb-4">Volatility Sensitivity</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={generateSensitivityData()}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="volatility" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line 
                        type="monotone" 
                        dataKey="price" 
                        stroke="#60A5FA" 
                        name="Option Price" 
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {!results && !error && (
              <div className="text-gray-400 text-center">
                Enter parameters and click Calculate to see results
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
} 
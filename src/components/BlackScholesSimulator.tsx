'use client';

import { useState, useEffect } from 'react';
import { BlackScholesInputs, BlackScholesOutputs, calculateBlackScholes, defaultInputs, validateInputs } from '@/lib/utils/black-scholes';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { Line } from 'react-chartjs-2';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

// Custom Toggle component
function Toggle({ checked, onChange }: { checked: boolean; onChange: (checked: boolean) => void }) {
  return (
    <button
      type="button"
      className={`${
        checked ? 'bg-blue-600' : 'bg-gray-200'
      } relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2`}
      onClick={() => onChange(!checked)}
    >
      <span className="sr-only">Toggle option type</span>
      <span
        className={`${
          checked ? 'translate-x-6' : 'translate-x-1'
        } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
      />
    </button>
  );
}

export default function BlackScholesSimulator() {
  const [inputs, setInputs] = useState<BlackScholesInputs>(defaultInputs);
  const [outputs, setOutputs] = useState<BlackScholesOutputs | null>(null);
  const [selectedChart, setSelectedChart] = useState<'price' | 'greeks'>('price');

  useEffect(() => {
    const results = calculateBlackScholes(inputs);
    setOutputs(results);
  }, [inputs]);

  const handleInputChange = (name: keyof BlackScholesInputs, value: number | boolean) => {
    if (typeof value === 'number' && !validateInputs[name as keyof typeof validateInputs]?.(value)) {
      return;
    }
    setInputs(prev => ({ ...prev, [name]: value }));
  };

  const formatNumber = (num: number) => num.toFixed(4);

  // Generate chart data
  const generateChartData = () => {
    const stockPrices = Array.from({ length: 100 }, (_, i) => 
      inputs.stockPrice * 0.5 + (inputs.stockPrice * i / 50)
    );

    if (selectedChart === 'price') {
      const prices = stockPrices.map(s => 
        calculateBlackScholes({ ...inputs, stockPrice: s }).optionPrice
      );

      return {
        labels: stockPrices.map(price => price.toFixed(2)),
        datasets: [{
          label: inputs.isCall ? 'Call Option' : 'Put Option',
          data: prices,
          borderColor: 'rgb(59, 130, 246)',
          backgroundColor: 'rgba(59, 130, 246, 0.5)',
          tension: 0.1
        }]
      };
    } else {
      const greeksData = stockPrices.map(s => calculateBlackScholes({ ...inputs, stockPrice: s }));
      const greekColors = {
        delta: 'rgb(59, 130, 246)', // blue
        gamma: 'rgb(34, 197, 94)', // green
        theta: 'rgb(239, 68, 68)', // red
        vega: 'rgb(168, 85, 247)', // purple
        rho: 'rgb(234, 179, 8)' // yellow
      };

      return {
        labels: stockPrices.map(price => price.toFixed(2)),
        datasets: ['delta', 'gamma', 'theta', 'vega', 'rho'].map(greek => ({
          label: greek.charAt(0).toUpperCase() + greek.slice(1),
          data: greeksData.map(data => data[greek as keyof typeof greeksData]),
          borderColor: greekColors[greek as keyof typeof greekColors],
          backgroundColor: greekColors[greek as keyof typeof greekColors].replace('rgb', 'rgba').replace(')', ', 0.5)'),
          tension: 0.1
        }))
      };
    }
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      title: {
        display: true,
        text: selectedChart === 'price' ? 'Option Price vs Stock Price' : 'Greeks vs Stock Price'
      },
      legend: {
        position: 'top' as const
      }
    },
    scales: {
      x: {
        title: {
          display: true,
          text: 'Stock Price'
        }
      },
      y: {
        title: {
          display: true,
          text: selectedChart === 'price' ? 'Option Price' : 'Value'
        }
      }
    }
  };

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="grid md:grid-cols-2 gap-6">
        {/* Input Controls */}
        <div className="bg-white rounded-lg shadow p-6 space-y-4">
          <h2 className="text-2xl font-bold mb-4">Input Parameters</h2>
          
          <div className="space-y-4">
            {Object.entries(inputs).map(([key, value]) => (
              key !== 'isCall' && (
                <div key={key} className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                  </label>
                  <input
                    type="range"
                    min={key === 'volatility' ? 0.01 : key === 'riskFreeRate' ? -0.1 : 1}
                    max={
                      key === 'volatility' ? 2 :
                      key === 'riskFreeRate' ? 0.5 :
                      key === 'timeToMaturity' ? 10 :
                      key.includes('Price') ? inputs.stockPrice * 2 : 1
                    }
                    step={
                      key === 'volatility' || key === 'riskFreeRate' ? 0.01 :
                      key === 'timeToMaturity' ? 0.1 :
                      key.includes('Price') ? 1 : 0.1
                    }
                    value={value as number}
                    onChange={(e) => handleInputChange(key as keyof BlackScholesInputs, parseFloat(e.target.value))}
                    className="w-full"
                  />
                  <div className="flex justify-between text-sm text-gray-500">
                    <span>{formatNumber(value as number)}</span>
                  </div>
                </div>
              )
            ))}
            
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Option Type</span>
              <Toggle
                checked={inputs.isCall}
                onChange={(checked) => handleInputChange('isCall', checked)}
              />
              <span className="text-sm text-gray-500">{inputs.isCall ? 'Call' : 'Put'}</span>
            </div>
          </div>
        </div>

        {/* Output Display */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-2xl font-bold mb-4">Results</h2>
          {outputs && (
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <span className="font-medium">Option Price: </span>
                <span className="text-lg">${formatNumber(outputs.optionPrice)}</span>
              </div>
              <div>
                <span className="font-medium">d₁: </span>
                <span>{formatNumber(outputs.d1)}</span>
              </div>
              <div>
                <span className="font-medium">d₂: </span>
                <span>{formatNumber(outputs.d2)}</span>
              </div>
              <div>
                <span className="font-medium">Delta: </span>
                <span>{formatNumber(outputs.delta)}</span>
              </div>
              <div>
                <span className="font-medium">Gamma: </span>
                <span>{formatNumber(outputs.gamma)}</span>
              </div>
              <div>
                <span className="font-medium">Theta: </span>
                <span>{formatNumber(outputs.theta)}</span>
              </div>
              <div>
                <span className="font-medium">Vega: </span>
                <span>{formatNumber(outputs.vega)}</span>
              </div>
              <div>
                <span className="font-medium">Rho: </span>
                <span>{formatNumber(outputs.rho)}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Charts */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Visualization</h2>
          <div className="space-x-2">
            <button
              onClick={() => setSelectedChart('price')}
              className={`px-4 py-2 rounded ${
                selectedChart === 'price' ? 'bg-blue-600 text-white' : 'bg-gray-200'
              }`}
            >
              Price
            </button>
            <button
              onClick={() => setSelectedChart('greeks')}
              className={`px-4 py-2 rounded ${
                selectedChart === 'greeks' ? 'bg-blue-600 text-white' : 'bg-gray-200'
              }`}
            >
              Greeks
            </button>
          </div>
        </div>
        
        <div className="h-[400px]">
          <Line data={generateChartData()} options={chartOptions} />
        </div>
      </div>
    </div>
  );
} 
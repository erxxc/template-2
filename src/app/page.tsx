'use client';

import { useState } from 'react';
import { Option, Portfolio, OptionGreeks } from '@/types/option';
import { calculatePortfolioMetrics } from '@/lib/utils/blackScholes';
import FileUpload from '@/components/FileUpload';
import PortfolioTable from '@/components/PortfolioTable';
import StressTest from '@/components/StressTest';
import VisualizationPanel from '@/components/VisualizationPanel';
import ExportPDFButton from '@/components/ExportPDFButton';
import GreeksSurfaceViewer from '@/components/GreeksSurfaceViewer';
import WhatIfPanel from '@/components/WhatIfPanel';

export default function Home() {
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null);
  const [whatIfPortfolio, setWhatIfPortfolio] = useState<Portfolio | null>(null);
  const [selectedGreek, setSelectedGreek] = useState<keyof OptionGreeks>('delta');
  const [stressTestResults, setStressTestResults] = useState<{
    spotPriceChange: number;
    volatilityChange: number;
    rateChange: number;
    stressedPortfolio: Portfolio;
  } | null>(null);

  const handlePortfolioLoad = (options: Option[]) => {
    const newPortfolio = calculatePortfolioMetrics(options);
    setPortfolio(newPortfolio);
    setWhatIfPortfolio(null);
    setStressTestResults(null);
  };

  const handleStressTestComplete = (results: {
    spotPriceChange: number;
    volatilityChange: number;
    rateChange: number;
    stressedPortfolio: Portfolio;
  }) => {
    setStressTestResults(results);
  };

  const handleWhatIfChange = (newPortfolio: Portfolio) => {
    setWhatIfPortfolio(newPortfolio);
  };

  const greekOptions: { value: keyof OptionGreeks; label: string }[] = [
    { value: 'delta', label: 'Delta' },
    { value: 'gamma', label: 'Gamma' },
    { value: 'theta', label: 'Theta' },
    { value: 'vega', label: 'Vega' },
    { value: 'rho', label: 'Rho' }
  ];

  return (
    <main className="min-h-screen bg-gray-50 py-6">
      <div className="max-w-[2000px] mx-auto px-4 sm:px-6 lg:px-8 2xl:px-12">
        <div className="text-center mb-6">
          <h1 className="text-4xl font-bold text-gray-900 mb-3">
            Portfolio Option Risk Visualizer
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Upload your options portfolio and analyze risk metrics using the Black-Scholes model
          </p>
        </div>

        {!portfolio ? (
          <FileUpload onPortfolioLoad={handlePortfolioLoad} />
        ) : (
          <div className="space-y-6">
            <div className="flex justify-end gap-4">
              <ExportPDFButton 
                portfolio={whatIfPortfolio || portfolio}
                stressTestResults={stressTestResults || undefined}
              />
              <button
                onClick={() => setPortfolio(null)}
                className="px-6 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              >
                Upload New Portfolio
              </button>
            </div>

            <div className="grid grid-cols-1 2xl:grid-cols-3 gap-6">
              <div className="2xl:col-span-2">
                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-semibold">Portfolio Analysis</h2>
                    <select
                      value={selectedGreek}
                      onChange={(e) => setSelectedGreek(e.target.value as keyof OptionGreeks)}
                      className="px-3 py-2 border rounded-lg text-sm"
                    >
                      {greekOptions.map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label} Surface
                        </option>
                      ))}
                    </select>
                  </div>
                  <PortfolioTable portfolio={whatIfPortfolio || portfolio} />
                </div>
              </div>

              <div className="2xl:col-span-1">
                <WhatIfPanel 
                  portfolio={portfolio}
                  onPortfolioChange={handleWhatIfChange}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 2xl:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg shadow p-6">
                <VisualizationPanel portfolio={whatIfPortfolio || portfolio} />
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <GreeksSurfaceViewer 
                  portfolio={whatIfPortfolio || portfolio}
                  selectedGreek={selectedGreek}
                />
              </div>
            </div>

            <StressTest 
              portfolio={whatIfPortfolio || portfolio}
              onStressTestComplete={handleStressTestComplete}
            />
          </div>
        )}
      </div>
    </main>
  );
}

import { useMemo } from 'react';
import dynamic from 'next/dynamic';
import { Portfolio, Option, OptionMetrics } from '@/types/option';
import { calculateOptionMetrics } from '@/lib/utils/blackScholes';

const Plot = dynamic(() => import('react-plotly.js'), { ssr: false });

interface PnLAttributionProps {
  portfolio: Portfolio;
  previousPortfolio?: Portfolio;
  timeElapsed?: number; // in days
}

interface PnLComponents {
  delta: number;
  gamma: number;
  theta: number;
  vega: number;
  rho: number;
  unexplained: number;
  total: number;
}

export default function PnLAttribution({ portfolio, previousPortfolio, timeElapsed = 1 }: PnLAttributionProps) {
  const pnlAttribution = useMemo(() => {
    if (!previousPortfolio) return null;

    const attribution: PnLComponents = {
      delta: 0,
      gamma: 0,
      theta: 0,
      vega: 0,
      rho: 0,
      unexplained: 0,
      total: 0
    };

    // Calculate total P&L
    attribution.total = portfolio.totalValue - previousPortfolio.totalValue;

    // Calculate P&L components for each option
    portfolio.options.forEach((currentOption, index) => {
      const prevOption = previousPortfolio.options[index];
      if (!prevOption) return;

      // Price changes
      const spotChange = currentOption.spotPrice - prevOption.spotPrice;
      const volChange = currentOption.volatility - prevOption.volatility;
      const rateChange = currentOption.riskFreeRate - prevOption.riskFreeRate;

      // First-order effects
      attribution.delta += prevOption.greeks.delta * spotChange * currentOption.quantity;
      attribution.theta += prevOption.greeks.theta * (timeElapsed / 365) * currentOption.quantity;
      attribution.vega += prevOption.greeks.vega * volChange * currentOption.quantity;
      attribution.rho += prevOption.greeks.rho * rateChange * currentOption.quantity;

      // Second-order effect
      attribution.gamma += 0.5 * prevOption.greeks.gamma * spotChange * spotChange * currentOption.quantity;
    });

    // Calculate unexplained P&L
    attribution.unexplained = attribution.total - (
      attribution.delta +
      attribution.gamma +
      attribution.theta +
      attribution.vega +
      attribution.rho
    );

    return attribution;
  }, [portfolio, previousPortfolio, timeElapsed]);

  if (!pnlAttribution) {
    return (
      <div className="p-6 text-center text-gray-500">
        No previous portfolio data available for P&L attribution
      </div>
    );
  }

  // Prepare data for waterfall chart
  const components = [
    { name: 'Delta', value: pnlAttribution.delta },
    { name: 'Gamma', value: pnlAttribution.gamma },
    { name: 'Theta', value: pnlAttribution.theta },
    { name: 'Vega', value: pnlAttribution.vega },
    { name: 'Rho', value: pnlAttribution.rho },
    { name: 'Unexplained', value: pnlAttribution.unexplained },
    { name: 'Total', value: pnlAttribution.total }
  ];

  const formatCurrency = (value: number) => 
    new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {components.map(({ name, value }) => (
          <div
            key={name}
            className="bg-white p-4 rounded-lg border border-gray-200"
          >
            <h3 className="text-sm font-medium text-gray-500">{name} P&L</h3>
            <p className={`text-lg font-semibold mt-1 ${value >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatCurrency(value)}
            </p>
          </div>
        ))}
      </div>

      <div className="h-[400px]">
        <Plot
          data={[
            {
              type: 'waterfall',
              name: 'P&L Attribution',
              orientation: 'v',
              measure: components.map((_, i) => i === components.length - 1 ? 'total' : 'relative'),
              x: components.map(c => c.name),
              y: components.map(c => c.value),
              connector: {
                line: {
                  color: 'rgb(63, 63, 63)'
                }
              },
              decreasing: {
                marker: { color: 'rgb(239, 68, 68)' }
              },
              increasing: {
                marker: { color: 'rgb(34, 197, 94)' }
              },
              totals: {
                marker: { color: 'rgb(59, 130, 246)' }
              }
            }
          ]}
          layout={{
            title: 'P&L Attribution Analysis',
            showlegend: false,
            xaxis: {
              title: 'Components',
              type: 'category'
            },
            yaxis: {
              title: 'P&L ($)',
              tickformat: '$.2f'
            },
            margin: { t: 30 },
            autosize: true
          }}
          useResizeHandler={true}
          style={{ width: '100%', height: '100%' }}
        />
      </div>

      <div className="bg-blue-50 p-4 rounded-lg">
        <h3 className="text-sm font-medium text-blue-800 mb-2">Understanding P&L Attribution</h3>
        <ul className="text-sm text-blue-600 space-y-1">
          <li>• Delta: P&L from directional price movements</li>
          <li>• Gamma: P&L from convexity/acceleration of price changes</li>
          <li>• Theta: P&L from time decay</li>
          <li>• Vega: P&L from volatility changes</li>
          <li>• Rho: P&L from interest rate changes</li>
          <li>• Unexplained: Residual P&L not captured by first-order Greeks</li>
        </ul>
      </div>
    </div>
  );
} 
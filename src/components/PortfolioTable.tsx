import { OptionMetrics, Portfolio } from '@/types/option';

interface PortfolioTableProps {
  portfolio: Portfolio;
}

function formatNumber(value: number, decimals: number = 4): string {
  return value.toFixed(decimals);
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(value);
}

function formatPercentage(value: number): string {
  return `${(value * 100).toFixed(2)}%`;
}

export default function PortfolioTable({ portfolio }: PortfolioTableProps) {
  const { options, totalValue, aggregateGreeks } = portfolio;

  return (
    <div>
      <div className="mb-6 grid grid-cols-2 xl:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
          <h3 className="text-sm font-medium text-gray-500">Portfolio Value</h3>
          <p className="text-2xl font-semibold mt-1">{formatCurrency(totalValue)}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
          <h3 className="text-sm font-medium text-gray-500">Net Delta</h3>
          <p className="text-2xl font-semibold mt-1">{formatNumber(aggregateGreeks.delta)}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
          <h3 className="text-sm font-medium text-gray-500">Net Gamma</h3>
          <p className="text-2xl font-semibold mt-1">{formatNumber(aggregateGreeks.gamma)}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
          <h3 className="text-sm font-medium text-gray-500">Net Vega</h3>
          <p className="text-2xl font-semibold mt-1">{formatNumber(aggregateGreeks.vega)}</p>
        </div>
      </div>

      <div className="overflow-x-auto rounded-lg border border-gray-200">
        <div className="min-w-full inline-block align-middle">
          <div className="overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Ticker</th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Type</th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Strike</th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Expiry</th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Price</th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Qty</th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Value</th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Delta</th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Gamma</th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Theta</th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Vega</th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Rho</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {options.map((option: OptionMetrics, index: number) => (
                  <tr 
                    key={`${option.ticker}-${option.type}-${option.strikePrice}-${index}`}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-4 py-2.5 text-sm font-medium text-gray-900 whitespace-nowrap">{option.ticker}</td>
                    <td className="px-4 py-2.5 text-sm text-gray-500 whitespace-nowrap">{option.type}</td>
                    <td className="px-4 py-2.5 text-sm text-gray-500 whitespace-nowrap">{formatCurrency(option.strikePrice)}</td>
                    <td className="px-4 py-2.5 text-sm text-gray-500 whitespace-nowrap">{formatNumber(option.timeToExpiry, 2)}</td>
                    <td className="px-4 py-2.5 text-sm text-gray-500 whitespace-nowrap">{formatCurrency(option.price)}</td>
                    <td className="px-4 py-2.5 text-sm text-gray-500 whitespace-nowrap">{option.quantity}</td>
                    <td className="px-4 py-2.5 text-sm text-gray-500 whitespace-nowrap">{formatCurrency(option.totalValue)}</td>
                    <td className="px-4 py-2.5 text-sm text-gray-500 whitespace-nowrap">{formatNumber(option.greeks.delta)}</td>
                    <td className="px-4 py-2.5 text-sm text-gray-500 whitespace-nowrap">{formatNumber(option.greeks.gamma)}</td>
                    <td className="px-4 py-2.5 text-sm text-gray-500 whitespace-nowrap">{formatNumber(option.greeks.theta)}</td>
                    <td className="px-4 py-2.5 text-sm text-gray-500 whitespace-nowrap">{formatNumber(option.greeks.vega)}</td>
                    <td className="px-4 py-2.5 text-sm text-gray-500 whitespace-nowrap">{formatNumber(option.greeks.rho)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
} 
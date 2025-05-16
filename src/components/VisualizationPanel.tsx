import { useMemo } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from 'chart.js';
import { Bar, Pie } from 'react-chartjs-2';
import { Portfolio, OptionMetrics } from '@/types/option';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

interface VisualizationPanelProps {
  portfolio: Portfolio;
}

export default function VisualizationPanel({ portfolio }: VisualizationPanelProps) {
  // Group options by ticker
  const optionsByTicker = useMemo(() => {
    const grouped = portfolio.options.reduce((acc, option) => {
      const key = option.ticker;
      if (!acc[key]) {
        acc[key] = [];
      }
      acc[key].push(option);
      return acc;
    }, {} as Record<string, OptionMetrics[]>);
    return grouped;
  }, [portfolio.options]);

  // Calculate total value by ticker
  const valueByTicker = useMemo(() => {
    const data: Record<string, number> = {};
    Object.entries(optionsByTicker).forEach(([ticker, options]) => {
      data[ticker] = options.reduce((sum, opt) => sum + opt.totalValue, 0);
    });
    return data;
  }, [optionsByTicker]);

  // Calculate Greeks by ticker
  const greeksByTicker = useMemo(() => {
    const data: Record<string, { delta: number; gamma: number; vega: number; theta: number }> = {};
    Object.entries(optionsByTicker).forEach(([ticker, options]) => {
      data[ticker] = options.reduce(
        (sum, opt) => ({
          delta: sum.delta + opt.greeks.delta * opt.quantity,
          gamma: sum.gamma + opt.greeks.gamma * opt.quantity,
          vega: sum.vega + opt.greeks.vega * opt.quantity,
          theta: sum.theta + opt.greeks.theta * opt.quantity,
        }),
        { delta: 0, gamma: 0, vega: 0, theta: 0 }
      );
    });
    return data;
  }, [optionsByTicker]);

  // Chart configurations
  const valueDistributionData = {
    labels: Object.keys(valueByTicker),
    datasets: [
      {
        label: 'Portfolio Value Distribution',
        data: Object.values(valueByTicker),
        backgroundColor: [
          'rgba(255, 99, 132, 0.5)',
          'rgba(54, 162, 235, 0.5)',
          'rgba(255, 206, 86, 0.5)',
          'rgba(75, 192, 192, 0.5)',
          'rgba(153, 102, 255, 0.5)',
        ],
        borderColor: [
          'rgba(255, 99, 132, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(153, 102, 255, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  const greeksData = {
    labels: Object.keys(greeksByTicker),
    datasets: [
      {
        label: 'Delta',
        data: Object.values(greeksByTicker).map(g => g.delta),
        backgroundColor: 'rgba(255, 99, 132, 0.5)',
      },
      {
        label: 'Gamma',
        data: Object.values(greeksByTicker).map(g => g.gamma),
        backgroundColor: 'rgba(54, 162, 235, 0.5)',
      },
      {
        label: 'Vega',
        data: Object.values(greeksByTicker).map(g => g.vega),
        backgroundColor: 'rgba(75, 192, 192, 0.5)',
      },
      {
        label: 'Theta',
        data: Object.values(greeksByTicker).map(g => g.theta),
        backgroundColor: 'rgba(255, 206, 86, 0.5)',
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Portfolio Metrics by Ticker',
        font: {
          size: 14,
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  const pieOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right' as const,
      },
      title: {
        display: true,
        text: 'Portfolio Value Distribution',
        font: {
          size: 14,
        },
      },
    },
  };

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-6">Portfolio Visualization</h2>
      
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
          <div className="h-[400px]">
            <Pie data={valueDistributionData} options={pieOptions} />
          </div>
        </div>
        
        <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
          <div className="h-[400px]">
            <Bar data={greeksData} options={chartOptions} />
          </div>
        </div>
      </div>

      <div className="mt-8">
        <h3 className="text-xl font-medium mb-4">Portfolio Composition</h3>
        <div className="grid grid-cols-2 xl:grid-cols-5 gap-4">
          {Object.entries(optionsByTicker).map(([ticker, options]) => (
            <div key={ticker} className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <h4 className="text-sm font-medium text-gray-900">{ticker}</h4>
              <div className="mt-2 space-y-2">
                <p className="text-sm text-gray-600">
                  Total Value: {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(valueByTicker[ticker])}
                </p>
                <p className="text-sm text-gray-600">
                  Number of Options: {options.length}
                </p>
                <p className="text-sm text-gray-600">
                  Net Delta: {greeksByTicker[ticker].delta.toFixed(4)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 
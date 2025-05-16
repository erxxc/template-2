import { OptionGreeks } from '@/types/option';

interface GreekExplanationProps {
  selectedGreek: keyof OptionGreeks;
  surfaceStats?: {
    min: number;
    max: number;
    avg: number;
    std: number;
  };
}

const greekDescriptions = {
  delta: {
    title: 'Delta (Δ)',
    description: 'Measures the rate of change in option value with respect to the underlying asset price.',
    interpretation: 'A delta of 0.5 means the option price changes by $0.50 for every $1 change in the underlying.',
    range: 'Calls: 0 to 1, Puts: -1 to 0',
    keyPoints: [
      'Higher absolute delta = more directional exposure',
      'ATM options typically have delta near ±0.5',
      'Deep ITM approaches ±1, deep OTM approaches 0'
    ]
  },
  gamma: {
    title: 'Gamma (Γ)',
    description: 'Measures the rate of change in delta with respect to the underlying price.',
    interpretation: 'Higher gamma means faster delta changes, requiring more frequent hedging.',
    range: 'Always positive, peaks at-the-money',
    keyPoints: [
      'Highest for ATM options near expiration',
      'Represents convexity/acceleration of value changes',
      'Key risk metric for delta-hedged positions'
    ]
  },
  theta: {
    title: 'Theta (Θ)',
    description: 'Measures the rate of time decay in option value.',
    interpretation: 'A theta of -0.05 means the option loses $0.05 in value per day, all else equal.',
    range: 'Generally negative for bought options',
    keyPoints: [
      'Highest for ATM options near expiration',
      'Represents time decay/premium erosion',
      'Important for premium-selling strategies'
    ]
  },
  vega: {
    title: 'Vega (ν)',
    description: 'Measures sensitivity to changes in implied volatility.',
    interpretation: 'A vega of 0.2 means a 1% change in vol changes the option value by $0.20.',
    range: 'Always positive, peaks at-the-money',
    keyPoints: [
      'Highest for ATM options with medium-term expiry',
      'Key for volatility trading strategies',
      'Important during high market uncertainty'
    ]
  },
  rho: {
    title: 'Rho (ρ)',
    description: 'Measures sensitivity to changes in the risk-free interest rate.',
    interpretation: 'A rho of 0.1 means a 1% rate change impacts the option value by $0.10.',
    range: 'Positive for calls, negative for puts',
    keyPoints: [
      'Larger for longer-dated options',
      'More relevant in high interest rate environments',
      'Usually the least monitored Greek'
    ]
  }
};

export default function GreekExplanation({ selectedGreek, surfaceStats }: GreekExplanationProps) {
  const greek = greekDescriptions[selectedGreek];

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 space-y-4">
      <h3 className="text-2xl font-bold text-gray-800">{greek.title}</h3>
      
      <div className="space-y-2">
        <p className="text-gray-700">{greek.description}</p>
        <p className="text-gray-600 italic">{greek.interpretation}</p>
        <p className="text-gray-600">
          <span className="font-semibold">Typical Range:</span> {greek.range}
        </p>
      </div>

      <div className="mt-4">
        <h4 className="font-semibold text-gray-700 mb-2">Key Points:</h4>
        <ul className="list-disc list-inside space-y-1">
          {greek.keyPoints.map((point, index) => (
            <li key={index} className="text-gray-600">{point}</li>
          ))}
        </ul>
      </div>

      {surfaceStats && (
        <div className="mt-6 grid grid-cols-2 gap-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-semibold text-gray-700 mb-2">Surface Statistics</h4>
            <div className="space-y-2">
              <p className="text-sm text-gray-600">
                <span className="font-medium">Range:</span>{' '}
                {surfaceStats.min.toFixed(4)} to {surfaceStats.max.toFixed(4)}
              </p>
              <p className="text-sm text-gray-600">
                <span className="font-medium">Average:</span>{' '}
                {surfaceStats.avg.toFixed(4)}
              </p>
              <p className="text-sm text-gray-600">
                <span className="font-medium">Std Dev:</span>{' '}
                {surfaceStats.std.toFixed(4)}
              </p>
            </div>
          </div>
          
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-semibold text-gray-700 mb-2">Risk Implications</h4>
            <div className="space-y-2">
              <p className="text-sm text-gray-600">
                {selectedGreek === 'delta' && 'High directional exposure in areas of high absolute delta.'}
                {selectedGreek === 'gamma' && 'Increased hedging needs in high gamma regions.'}
                {selectedGreek === 'theta' && 'Accelerated time decay in high theta areas.'}
                {selectedGreek === 'vega' && 'Greater volatility risk in high vega regions.'}
                {selectedGreek === 'rho' && 'Significant rate exposure in high absolute rho areas.'}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 
import { Document, Page, Text, View, StyleSheet, PDFViewer, Font } from '@react-pdf/renderer';
import { Portfolio, OptionGreeks } from '@/types/option';

interface PDFReportProps {
  portfolio: Portfolio;
  selectedGreek?: keyof OptionGreeks;
  surfaceStats?: {
    min: number;
    max: number;
    avg: number;
    std: number;
  };
  pnlAttribution?: {
    delta: number;
    gamma: number;
    theta: number;
    vega: number;
    rho: number;
    unexplained: number;
    total: number;
  };
  stressTestResults?: {
    spotPriceChange: number;
    volatilityChange: number;
    rateChange: number;
    stressedPortfolio: Portfolio;
  };
  volSurfaceInfo?: {
    minStrike: number;
    maxStrike: number;
    minMaturity: number;
    maxMaturity: number;
    avgVol: number;
  };
}

// Register a professional font
Font.register({
  family: 'Helvetica',
  fonts: [
    { src: 'https://fonts.gstatic.com/s/helveticaneue/v70/1Ptsg8zYS_SKggPNyC0IT4ttDfA.ttf', fontWeight: 400 },
    { src: 'https://fonts.gstatic.com/s/helveticaneue/v70/1Ptsg8zYS_SKggPNyC0IT4ttDfB.ttf', fontWeight: 700 },
  ],
});

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: 'Helvetica',
  },
  header: {
    fontSize: 24,
    marginBottom: 20,
    fontWeight: 700,
    color: '#1a365d',
  },
  subHeader: {
    fontSize: 18,
    marginBottom: 15,
    marginTop: 30,
    fontWeight: 700,
    color: '#2d3748',
  },
  section: {
    marginBottom: 20,
  },
  description: {
    fontSize: 11,
    color: '#4a5568',
    marginBottom: 10,
    lineHeight: 1.4,
  },
  table: {
    display: 'table',
    width: '100%',
    marginBottom: 20,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    borderBottomStyle: 'solid',
    paddingVertical: 8,
  },
  tableHeader: {
    backgroundColor: '#f7fafc',
    fontWeight: 700,
  },
  tableCell: {
    flex: 1,
    fontSize: 10,
    textAlign: 'left' as const,
  },
  summaryBox: {
    backgroundColor: '#f7fafc',
    padding: 15,
    marginBottom: 20,
    borderRadius: 4,
  },
  summaryTitle: {
    fontSize: 14,
    fontWeight: 700,
    marginBottom: 10,
    color: '#2d3748',
  },
  summaryText: {
    fontSize: 12,
    marginBottom: 5,
    color: '#4a5568',
  },
  explanationBox: {
    backgroundColor: '#ebf8ff',
    padding: 12,
    marginTop: 10,
    marginBottom: 15,
    borderRadius: 4,
  },
  explanationTitle: {
    fontSize: 11,
    fontWeight: 700,
    color: '#2b6cb0',
    marginBottom: 5,
  },
  explanationText: {
    fontSize: 10,
    color: '#2c5282',
    lineHeight: 1.4,
  },
  footer: {
    position: 'absolute',
    bottom: 40,
    left: 40,
    right: 40,
    fontSize: 10,
    color: '#718096',
    textAlign: 'center',
  },
  greekAnalysis: {
    marginTop: 20,
    marginBottom: 20,
  },
  greekTitle: {
    fontSize: 16,
    fontWeight: 700,
    color: '#2d3748',
    marginBottom: 10,
  },
  greekDescription: {
    fontSize: 11,
    color: '#4a5568',
    marginBottom: 8,
  },
  statGrid: {
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 10,
  },
  statBox: {
    width: '50%',
    padding: 8,
  },
  statLabel: {
    fontSize: 10,
    color: '#718096',
    marginBottom: 2,
  },
  statValue: {
    fontSize: 12,
    color: '#2d3748',
    fontWeight: 700,
  },
  pnlSection: {
    marginTop: 20,
    backgroundColor: '#f7fafc',
    padding: 15,
    borderRadius: 4,
  },
  pnlComponent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  pnlLabel: {
    fontSize: 11,
    color: '#4a5568',
  },
  pnlValue: {
    fontSize: 11,
    fontWeight: 700,
  },
  volSurfaceSection: {
    marginTop: 20,
    backgroundColor: '#f8f9fa',
    padding: 15,
    borderRadius: 4,
  },
  pageBreak: {
    marginTop: 30,
    marginBottom: 30,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    borderTopStyle: 'dashed',
  },
});

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

function formatNumber(value: number, decimals: number = 4): string {
  return value.toFixed(decimals);
}

function formatPercentage(value: number): string {
  return `${(value * 100).toFixed(2)}%`;
}

function formatChange(current: number, original: number): string {
  const change = ((current - original) / Math.abs(original)) * 100;
  const sign = change > 0 ? '+' : '';
  return `${sign}${change.toFixed(2)}%`;
}

export default function PDFReport({ 
  portfolio, 
  selectedGreek,
  surfaceStats,
  pnlAttribution,
  stressTestResults,
  volSurfaceInfo 
}: PDFReportProps) {
  const currentDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  // Greek descriptions from GreekExplanation component
  const greekDescriptions = {
    delta: {
      title: 'Delta (Δ)',
      description: 'Measures the rate of change in option value with respect to the underlying asset price.',
      interpretation: 'A delta of 0.5 means the option price changes by $0.50 for every $1 change in the underlying.'
    },
    gamma: {
      title: 'Gamma (Γ)',
      description: 'Measures the rate of change in delta with respect to the underlying price.',
      interpretation: 'Higher gamma means faster delta changes, requiring more frequent hedging.'
    },
    theta: {
      title: 'Theta (Θ)',
      description: 'Measures the rate of time decay in option value.',
      interpretation: 'A theta of -0.05 means the option loses $0.05 in value per day, all else equal.'
    },
    vega: {
      title: 'Vega (ν)',
      description: 'Measures sensitivity to changes in implied volatility.',
      interpretation: 'A vega of 0.2 means a 1% change in vol changes the option value by $0.20.'
    },
    rho: {
      title: 'Rho (ρ)',
      description: 'Measures sensitivity to changes in the risk-free interest rate.',
      interpretation: 'A rho of 0.1 means a 1% rate change impacts the option value by $0.10.'
    }
  };

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.header}>Portfolio Risk Analysis Report</Text>
        <Text style={{ fontSize: 12, marginBottom: 10, color: '#718096' }}>{currentDate}</Text>
        
        <Text style={styles.description}>
          This report provides a comprehensive analysis of your options portfolio, including current valuations, risk metrics, and potential impacts from market changes. Each section below breaks down different aspects of your portfolio with explanations of what the numbers mean.
        </Text>

        <View style={styles.section}>
          <Text style={styles.summaryTitle}>Executive Summary</Text>
          <View style={styles.explanationBox}>
            <Text style={styles.explanationTitle}>What is this section?</Text>
            <Text style={styles.explanationText}>
              The executive summary provides a high-level overview of your portfolio's key metrics. These numbers help you understand the total value of your investments and how sensitive they are to market changes.
            </Text>
          </View>
          <View style={styles.summaryBox}>
            <Text style={styles.summaryText}>Total Portfolio Value: {formatCurrency(portfolio.totalValue)}</Text>
            <Text style={styles.summaryText}>Number of Positions: {portfolio.options.length}</Text>
            <Text style={styles.summaryText}>Net Delta: {formatNumber(portfolio.aggregateGreeks.delta)}</Text>
            <Text style={styles.summaryText}>Net Gamma: {formatNumber(portfolio.aggregateGreeks.gamma)}</Text>
            <Text style={styles.summaryText}>Net Vega: {formatNumber(portfolio.aggregateGreeks.vega)}</Text>
          </View>
          <View style={styles.explanationBox}>
            <Text style={styles.explanationTitle}>Understanding the Metrics</Text>
            <Text style={styles.explanationText}>
              • Total Portfolio Value: The current market value of all your options combined{'\n'}
              • Number of Positions: Total count of different options in your portfolio{'\n'}
              • Net Delta: How much your portfolio value changes when stock prices change (higher number = more sensitive){'\n'}
              • Net Gamma: How fast your delta changes (higher number = faster changes in sensitivity){'\n'}
              • Net Vega: How sensitive your portfolio is to market volatility changes
            </Text>
          </View>
        </View>

        <Text style={styles.subHeader}>Position Details</Text>
        <View style={styles.explanationBox}>
          <Text style={styles.explanationTitle}>Understanding Your Positions</Text>
          <Text style={styles.explanationText}>
            This table shows each option in your portfolio. Here's what each column means:{'\n'}
            • Ticker: The stock symbol (e.g., AAPL for Apple){'\n'}
            • Type: Whether it's a Call (right to buy) or Put (right to sell){'\n'}
            • Strike: The price at which you can buy/sell the stock{'\n'}
            • Expiry: Time until the option expires (in years){'\n'}
            • Value: Current market value of this position{'\n'}
            • Delta: How much this position's value changes with the stock price
          </Text>
        </View>
        <View style={styles.table}>
          <View style={[styles.tableRow, styles.tableHeader]}>
            <Text style={styles.tableCell}>Ticker</Text>
            <Text style={styles.tableCell}>Type</Text>
            <Text style={styles.tableCell}>Strike</Text>
            <Text style={styles.tableCell}>Expiry</Text>
            <Text style={styles.tableCell}>Value</Text>
            <Text style={styles.tableCell}>Delta</Text>
          </View>
          {portfolio.options.map((option, index) => (
            <View key={index} style={styles.tableRow}>
              <Text style={styles.tableCell}>{option.ticker}</Text>
              <Text style={styles.tableCell}>{option.type}</Text>
              <Text style={styles.tableCell}>{formatCurrency(option.strikePrice)}</Text>
              <Text style={styles.tableCell}>{formatNumber(option.timeToExpiry, 2)}</Text>
              <Text style={styles.tableCell}>{formatCurrency(option.totalValue)}</Text>
              <Text style={styles.tableCell}>{formatNumber(option.greeks.delta)}</Text>
            </View>
          ))}
        </View>

        {selectedGreek && surfaceStats && (
          <View style={styles.greekAnalysis}>
            <Text style={styles.subHeader}>Greeks Surface Analysis</Text>
            <View style={styles.explanationBox}>
              <Text style={styles.explanationTitle}>{greekDescriptions[selectedGreek].title} Analysis</Text>
              <Text style={styles.explanationText}>
                {greekDescriptions[selectedGreek].description}{'\n'}
                {greekDescriptions[selectedGreek].interpretation}
              </Text>
            </View>
            
            <View style={styles.summaryBox}>
              <Text style={styles.summaryTitle}>Surface Statistics</Text>
              <View style={styles.statGrid}>
                <View style={styles.statBox}>
                  <Text style={styles.statLabel}>Range</Text>
                  <Text style={styles.statValue}>
                    {formatNumber(surfaceStats.min)} to {formatNumber(surfaceStats.max)}
                  </Text>
                </View>
                <View style={styles.statBox}>
                  <Text style={styles.statLabel}>Average</Text>
                  <Text style={styles.statValue}>{formatNumber(surfaceStats.avg)}</Text>
                </View>
                <View style={styles.statBox}>
                  <Text style={styles.statLabel}>Standard Deviation</Text>
                  <Text style={styles.statValue}>{formatNumber(surfaceStats.std)}</Text>
                </View>
              </View>
            </View>
          </View>
        )}

        <View style={styles.pageBreak} />

        {pnlAttribution && (
          <View style={styles.section}>
            <Text style={styles.subHeader}>P&L Attribution Analysis</Text>
            <View style={styles.explanationBox}>
              <Text style={styles.explanationTitle}>Understanding P&L Components</Text>
              <Text style={styles.explanationText}>
                This section breaks down how different market factors contributed to your portfolio's performance. Each component shows the P&L impact from a specific risk factor.
              </Text>
            </View>
            
            <View style={styles.pnlSection}>
              {Object.entries(pnlAttribution).map(([component, value]) => (
                <View key={component} style={styles.pnlComponent}>
                  <Text style={styles.pnlLabel}>
                    {component.charAt(0).toUpperCase() + component.slice(1)}
                  </Text>
                  <Text style={[
                    styles.pnlValue,
                    { color: value >= 0 ? '#047857' : '#dc2626' }
                  ]}>
                    {formatCurrency(value)}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {volSurfaceInfo && (
          <View style={styles.section}>
            <Text style={styles.subHeader}>Volatility Surface Information</Text>
            <View style={styles.explanationBox}>
              <Text style={styles.explanationTitle}>Volatility Surface Coverage</Text>
              <Text style={styles.explanationText}>
                The volatility surface shows how implied volatility varies across different strike prices and maturities. This information is crucial for accurate option pricing and risk assessment.
              </Text>
            </View>
            
            <View style={styles.volSurfaceSection}>
              <View style={styles.statGrid}>
                <View style={styles.statBox}>
                  <Text style={styles.statLabel}>Strike Range</Text>
                  <Text style={styles.statValue}>
                    {formatCurrency(volSurfaceInfo.minStrike)} - {formatCurrency(volSurfaceInfo.maxStrike)}
                  </Text>
                </View>
                <View style={styles.statBox}>
                  <Text style={styles.statLabel}>Maturity Range</Text>
                  <Text style={styles.statValue}>
                    {formatNumber(volSurfaceInfo.minMaturity, 2)}y - {formatNumber(volSurfaceInfo.maxMaturity, 2)}y
                  </Text>
                </View>
                <View style={styles.statBox}>
                  <Text style={styles.statLabel}>Average Volatility</Text>
                  <Text style={styles.statValue}>{formatPercentage(volSurfaceInfo.avgVol)}</Text>
                </View>
              </View>
            </View>
          </View>
        )}

        {stressTestResults && (
          <>
            <Text style={styles.subHeader}>Stress Test Analysis</Text>
            <View style={styles.explanationBox}>
              <Text style={styles.explanationTitle}>What is Stress Testing?</Text>
              <Text style={styles.explanationText}>
                Stress testing shows how your portfolio might perform under different market conditions. We simulate changes in stock prices, market volatility, and interest rates to help you understand potential risks and opportunities. A negative percentage means a decrease in value, while a positive percentage indicates an increase.
              </Text>
            </View>
            <View style={styles.summaryBox}>
              <Text style={styles.summaryText}>Spot Price Change: {formatPercentage(stressTestResults.spotPriceChange / 100)}</Text>
              <Text style={styles.summaryText}>Volatility Change: {formatPercentage(stressTestResults.volatilityChange / 100)}</Text>
              <Text style={styles.summaryText}>Rate Change: {formatPercentage(stressTestResults.rateChange / 100)}</Text>
              <Text style={styles.summaryText}>Value Impact: {formatChange(stressTestResults.stressedPortfolio.totalValue, portfolio.totalValue)}</Text>
              <Text style={styles.summaryText}>Delta Impact: {formatChange(stressTestResults.stressedPortfolio.aggregateGreeks.delta, portfolio.aggregateGreeks.delta)}</Text>
            </View>
            <View style={styles.explanationBox}>
              <Text style={styles.explanationTitle}>Understanding the Results</Text>
              <Text style={styles.explanationText}>
                • Spot Price Change: How much stock prices changed in the test{'\n'}
                • Volatility Change: How much market uncertainty changed{'\n'}
                • Rate Change: How much interest rates changed{'\n'}
                • Value Impact: How your portfolio value would change{'\n'}
                • Delta Impact: How your portfolio's price sensitivity would change
              </Text>
            </View>
          </>
        )}

        <Text style={styles.footer}>
          Generated by Portfolio Option Risk Visualizer • {currentDate}
        </Text>
      </Page>
    </Document>
  );
} 
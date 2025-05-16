# Portfolio Option Risk Visualizer

A sophisticated web application for analyzing and visualizing option portfolio risks using the Black-Scholes model. Built with Next.js, TypeScript, and React, this tool provides institutional-grade risk analytics for options traders and portfolio managers.

## Overview

The Portfolio Option Risk Visualizer helps traders and risk managers understand their option portfolio exposures through:
- Real-time Black-Scholes pricing
- Interactive Greeks visualization
- P&L attribution analysis
- Volatility surface modeling
- Stress testing capabilities

## Technical Architecture

### Frontend Stack
- **Next.js 14 (App Router)**: Server-side rendering and optimal performance
- **TypeScript**: Type safety and enhanced developer experience
- **Tailwind CSS**: Responsive and modern UI design
- **Plotly.js**: Interactive 3D visualizations
- **React-PDF**: Professional PDF report generation

### Key Components

1. **Greeks Surface Viewer**
   - 3D visualization of option Greeks (Delta, Gamma, Theta, Vega, Rho)
   - Interactive surface exploration with cross-sections
   - Real-time statistical analysis
   - Multiple view modes (surface, contour, heatmap)

2. **Volatility Surface**
   - CSV upload support for custom volatility surfaces
   - Bilinear interpolation for accurate pricing
   - Strike/maturity grid visualization
   - Sample data generation with smile effect

3. **P&L Attribution Engine**
   - Decomposition of portfolio value changes
   - First and second-order effects analysis
   - Waterfall chart visualization
   - Risk factor contribution analysis

4. **Stress Testing Module**
   - Scenario-based analysis
   - Multiple risk factor shifts
   - Impact visualization
   - Portfolio revaluation

## Mathematical Models

### Black-Scholes Implementation

The core pricing engine uses the Black-Scholes model with the following assumptions:
- European-style options
- Log-normal distribution of returns
- Constant volatility and interest rates
- No dividends (can be extended to include dividends)

Key formulas:
```
Call Price = S₀N(d₁) - Ke^(-rT)N(d₂)
Put Price = Ke^(-rT)N(-d₂) - S₀N(-d₁)

where:
d₁ = [ln(S₀/K) + (r + σ²/2)T] / (σ√T)
d₂ = d₁ - σ√T
```

### Greeks Calculations

1. **Delta (Δ)**
   - First derivative with respect to spot price
   - Measures directional exposure
   - Range: [-1 to 1] for puts/calls

2. **Gamma (Γ)**
   - Second derivative with respect to spot price
   - Measures delta change rate
   - Always positive, peaks at-the-money

3. **Theta (Θ)**
   - First derivative with respect to time
   - Measures time decay
   - Generally negative for bought options

4. **Vega (ν)**
   - First derivative with respect to volatility
   - Measures volatility sensitivity
   - Always positive, peaks at-the-money

5. **Rho (ρ)**
   - First derivative with respect to interest rate
   - Measures rate sensitivity
   - Positive for calls, negative for puts

### Volatility Surface

The application uses bilinear interpolation for volatility surface modeling:
```typescript
σ(K,T) = w₁₁σ₁₁ + w₁₂σ₁₂ + w₂₁σ₂₁ + w₂₂σ₂₂

where:
wᵢⱼ = weight coefficients based on distance
σᵢⱼ = volatility at nearby grid points
```

### P&L Attribution

Portfolio value changes are decomposed into:
1. Delta effect (spot price changes)
2. Gamma effect (convexity)
3. Theta effect (time decay)
4. Vega effect (volatility changes)
5. Rho effect (interest rate changes)
6. Cross-effects and higher-order terms

## Risk Analysis Features

### Surface Analysis
- Strike price range: ±30% around current spot
- Time to expiry: 0.1 to 2 years
- 40x40 grid resolution
- Statistical measures (min, max, avg, std)

### Stress Testing
- Spot price shifts: ±20%
- Volatility scaling: 50-200%
- Interest rate shifts: ±50bps
- Combined scenario analysis

### Portfolio Analytics
- Position-level metrics
- Aggregate exposures
- Risk concentrations
- Correlation effects

## Report Generation

The application generates comprehensive PDF reports including:
- Portfolio summary
- Position details
- Greeks analysis
- Risk metrics
- Stress test results
- Educational content

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
```env
NEXT_PUBLIC_API_URL=your_api_url
```

3. Run development server:
```bash
npm run dev
```

## Data Format

The application accepts portfolio data in CSV or JSON format:
```json
{
  "options": [
    {
      "ticker": "AAPL",
      "type": "call",
      "strikePrice": 150,
      "spotPrice": 145,
      "timeToExpiry": 0.5,
      "volatility": 0.3,
      "riskFreeRate": 0.05,
      "quantity": 100
    }
  ]
}
```

## Contributing

Contributions are welcome! Please read our contributing guidelines and submit pull requests for any enhancements.

## License

This project is licensed under the MIT License - see the LICENSE file for details.
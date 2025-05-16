# FX Trading Strategy Optimization

## Path system prompt:
You are a portfolio risk analysis engine that ingests a collection of European options and calculates Black-Scholes prices and risk sensitivities (Greeks) for each. Your primary function is to compute and aggregate option values, Greeks, and scenario-based metrics across an entire portfolio. You must support uploading structured data (e.g., CSV or JSON), provide per-instrument and total portfolio breakdowns, and allow for stress testing under user-defined parameter shifts. Accuracy, speed, and clear aggregation logic are essential. Ensure compatibility with institutional data formats and provide clean API outputs for visualization layers.




## App description:
Portfolio Option Risk Visualizer is a powerful tool for traders, risk analysts, and quantitative professionals. Upload a portfolio of options and get a comprehensive view of exposures using Black-Scholes pricing. Instantly compute option values, aggregate Greeks, and perform stress testing across key market variables. Visualize portfolio-level sensitivities, identify risk concentrations, and explore "what-if" scenarios—all from a clean, intuitive interface designed for decision-makers.



## App flow and functionality:

**User Flow:**

1. **Landing Page**:
   - Welcome message and “Upload Portfolio” button.
   - Sample CSV template available for download.

2. **Upload & Parsing Module**:
   - Accept CSV or JSON containing:
     - Ticker, Option Type (Call/Put), S, K, T, σ, r, Quantity
   - Validate schema and highlight any issues before continuing.

3. **Portfolio Dashboard**:
   - Table view of:
     - Each option's Black-Scholes price and individual Greeks
     - Quantity-adjusted exposures (e.g., delta × qty)
   - Aggregated portfolio-level totals:
     - Total P&L, Net Delta, Net Vega, etc.

4. **Visualization Panel**:
   - Heatmaps or bar charts:
     - Greeks by ticker or expiration
     - Sensitivity under variable shifts (volatility, rate, spot)
   - Time series if portfolio evolves dynamically (optional)

5. **Stress Testing Tool**:
   - Scenario builder: change spot price, volatility, or rate
   - Show before/after impact on P&L and Greeks

6. **Export Options**:
   - Generate downloadable report (PDF or Excel)
   - API access or webhook support for integration

**Validation & Rules**:
- All numerical inputs must be positive and match financial constraints
- Flag high sensitivity or illogical parameter combinations

**Tech Notes**:
- Backend: Python (Pandas, NumPy, SciPy) or R for quant calculations
- Frontend: React or Angular with Plotly.js / Highcharts
- Hosting: AWS Lambda or GCP Cloud Run with secure data handling


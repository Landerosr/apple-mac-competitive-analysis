# Apple Mac Competitive Strength Dashboard

## Interactive MacBook teardown

The 3D teardown section embeds [Inside a MacBook](https://inside-macbook.vercel.app/) by [Pulkit Saraf](https://github.com/Pulkit7070/inside-macbook), whose source and procedural geometry are MIT licensed. This third-party viewer is credited in the interface and loads only when a reader chooses to explore. Its source is not copied into this repository; availability depends on the creator's hosting. A direct full-screen link remains available if embedding fails.

Readers can rotate, zoom, separate and reassemble the model, and inspect components using the viewer's controls. The model is a **simplified educational study of the 14-inch 2026 M5 Pro**, not Apple's CAD or a service/repair model. It is not automatically relabeled when a reader chooses an Air or base M5 in the buying guide. It does not establish upgradeability or affect buying recommendations. Browser WebGL support and third-party network access are required.

## Buy now or wait: consumer guide

The first screen now helps a reader decide whether to replace their laptop. It compares three exact starting configurations: 13-inch M5 Air (16GB/512GB), 14-inch M5 Pro laptop (16GB/1TB, base M5 chip), and 14-inch M5 Pro laptop with the M5 Pro chip (24GB/1TB).

Product facts and U.S. starting prices come from Apple's real March 3, 2026 announcements, reviewed September 10, 2026. These are **dated published reference prices, not live checkout prices**. The shop pages confirmed configurations but did not expose a verifiable current checkout price in the retrieved content. We do not fill that gap with fabricated quotes. Sources:

- [Apple M5 Air announcement](https://www.apple.com/newsroom/2026/03/apple-introduces-the-new-macbook-air-with-m5/)
- [Apple M5 Pro / Max announcement and updated base M5 configuration](https://www.apple.com/newsroom/2026/03/apple-introduces-macbook-pro-with-all-new-m5-pro-and-m5-max/)
- [Apple Air store](https://www.apple.com/shop/buy-mac/macbook-air)
- [Apple Pro store](https://www.apple.com/shop/buy-mac/macbook-pro)

The guide asks about budget, current laptop condition, workload and software compatibility. Readers may supply an actual quote; it is labeled user-provided and is cleared on a model change. The quote comparison uses `(published reference - quote) / published reference × 100`, not a historical-low or market-wide discount estimate.

Decision rules are deliberately transparent and separate from observed facts: validate inputs, check software, check budget, assess replacement need, check workload fit, then require a current quote before the affirmative buy recommendation. These are judgment rules, not a trained prediction model. A working laptop supports waiting; a limiting laptop with compatible software and an affordable quote supports buying. No synthetic data, assumed sale prices or predicted launch dates are used in this guide. Revenue forecasts and the older illustrative competitive score remain in their separate research sections and do not drive consumer advice.

This is a limited shortlist, not a ranking of every Mac or Windows laptop. Actual app performance, upgraded configurations, taxes, warranty, retailer availability and ownership costs need separate consideration. Neither launch age nor Apple's revenue growth establishes whether a consumer should buy today.

The Product tab now compares specific M5, M5 Pro and HP ZBook configurations with editable USD prices, price premiums and included memory/storage per $1,000. Apple defaults are March 2026 reference prices, not live quotes; HP needs a user-supplied quote. Source links and the review date appear in the interface. Capacity ratios are not performance benchmarks and do not affect the market-strength score. Family-level specifications remain separate from configuration-level value calculations.

### [View the interactive dashboard →](https://landerosr.github.io/apple-mac-competitive-analysis/)

Open the dashboard in your browser

I built this project to answer a question I care about from both a finance and technology perspective: **Is Apple actually strong in the computer market, or does the Mac only look strong because it occupies a premium niche?**

My interest comes from working as an Apple Technical Advisor and following the MacBook Pro product line. I wanted the analysis to go beyond a product-spec comparison, so I combined market shipments, Mac financial results, a small forecasting exercise, and a transparent scenario model in one dashboard.

## The short answer

The base case describes Apple as a **strong premium challenger** rather than the PC market leader.

- Apple ranked fourth in 2025 worldwide PC shipments with 9.2% share.
- Apple shipments grew 10.3%, slightly faster than the 9.1% overall market.
- Mac revenue reached $10.35 billion in FY2026 Q3, up 28.7% from the comparable quarter.
- MacBook Pro has a strong published premium feature set, but Apple still has a major unit-scale gap versus Lenovo, HP, and Dell.

That distinction is the point of the project: financial and product momentum can be strong even when volume leadership is not.

## What is inside the project

The Python analysis loads the public CSV files, uses SQLite to rank vendors and calculate share changes, then evaluates three Mac revenue forecasting methods:

1. Seasonal naive
2. Four-quarter moving average
3. Linear trend with quarterly seasonality

I used walk-forward validation and compared MAE, RMSE, and MAPE. The four-quarter mean had the lowest test RMSE on this small dataset, producing a FY2026 Q4 estimate of **$8.97 billion** with an 80% model range of **$7.96–$9.97 billion**.

The forecast is a portfolio exercise, not company guidance. Apple reports revenue for the entire Mac category and does not disclose standalone MacBook Pro revenue or unit sales.

## How the strength score works

The score is intentionally simple enough to explain and challenge. Its default weights are:

- Market scale: 20%
- Shipment momentum: 20%
- Market-share direction: 15%
- Mac financial momentum: 25%
- Premium product position: 20%

The market and financial components use explicit formulas in `analytics/build_analysis.py`. The product component awards 25 points for each published threshold met across the MacBook Pro family: at least 20 hours of claimed battery life, up to 128 GB memory, at least 1 TB starting storage, and 1,600-nit peak display brightness.

Readers can change the scenario assumptions and every signal weight in the dashboard. Increasing the importance of unit scale lowers Apple’s result; increasing the importance of financial momentum or premium positioning raises it.

The score is an illustrative judgment model, not a probability, investment rating, or independently validated measure of competitiveness. Weights are normalized to their total. The feature thresholds are analyst-selected and may favor the MacBook Pro; a perfect product score means the selected thresholds are met, not that Apple beats every competitor. Market data covers calendar 2025, while financial momentum uses FY2026 Q3, so the signals are not contemporaneous.

The approximate 80% forecast range uses ±1.282 times the sample standard deviation of seven walk-forward residuals. It assumes approximately normal, stable errors, is not calibrated out of sample, and does not account for model-selection uncertainty. The same small validation sample selects the model and reports its errors, so these are not independent final-test results.

## Tools used

- Python, pandas, and NumPy for the analysis and forecasting
- SQLite and SQL window functions for vendor rankings
- React, TypeScript, and Recharts for the interactive dashboard
- Walk-forward validation, MAE, RMSE, MAPE, sensitivity analysis, and uncertainty ranges

## Run it locally

```bash
python3 -m venv .venv
source .venv/bin/activate
python3 -m pip install -r requirements.txt
python3 analytics/build_analysis.py
pnpm install
pnpm run dev
```

Then open `http://localhost:3000`.

Requirements: Node.js 22.13 or newer, pnpm, and Python 3.10 or newer. On Windows, activate the environment with `.venv\Scripts\activate` instead.

## Publish to GitHub Pages

Run `pnpm run build:pages` on macOS or Linux, then commit the generated `docs/` folder. GitHub Pages serves the `main` branch's `/docs` folder. This preserves the interactive charts and scenario controls without a server.

To rebuild and verify the project:

```bash
pnpm run check
```

## Data sources

- [Gartner: 2025 worldwide PC vendor shipment estimates](https://www.gartner.com/en/newsroom/press-releases/2026-1-20-gartner-says-worldwide-pc-shipments-increased-9-point-3-percent-in-fourth-quarter-of-2025-and-9-point-1-percent-for-the-full-year)
- [Apple FY2026 Q3 consolidated financial statements](https://www.apple.com/newsroom/pdfs/fy2026q3/FY26_Q3_Consolidated_Financial_Statements.pdf)
- [Apple Investor Relations quarterly reports](https://investor.apple.com/investor-relations/default.aspx)
- [Apple MacBook Pro M5 family announcement and specifications](https://www.apple.com/newsroom/2026/03/apple-introduces-macbook-pro-with-all-new-m5-pro-and-m5-max/)
- Manufacturer product pages linked directly from the comparison table

## Important limitations

Gartner shipment figures are third-party estimates and measure shipments into channels, not consumer sell-through. Product specifications come from manufacturers and do not represent independent benchmark testing. The revenue forecast uses only a short quarterly history, so the uncertainty range should be treated seriously. This project is research and portfolio work, not investment advice.

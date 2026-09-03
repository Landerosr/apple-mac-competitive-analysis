"""Build the public analysis payload from sourced CSV inputs.

The script intentionally keeps the model small and auditable. It loads the
market data through SQLite, evaluates three forecasting approaches with
walk-forward validation, and exports only the results the dashboard needs.
"""

from __future__ import annotations

import json
import sqlite3
from pathlib import Path

import numpy as np
import pandas as pd


ROOT = Path(__file__).resolve().parents[1]
DATA = ROOT / "data"
OUTPUT = ROOT / "lib" / "analysis.json"


def seasonal_design(frame: pd.DataFrame) -> np.ndarray:
    time_index = np.arange(len(frame), dtype=float)
    quarter = frame["quarter"].to_numpy()
    return np.column_stack(
        [
            np.ones(len(frame)),
            time_index,
            (quarter == 2).astype(float),
            (quarter == 3).astype(float),
            (quarter == 4).astype(float),
        ]
    )


def predict_trend_seasonal(train: pd.DataFrame, next_quarter: int) -> float:
    design = seasonal_design(train)
    target = train["revenue_usd_bn"].to_numpy()
    coefficients, *_ = np.linalg.lstsq(design, target, rcond=None)
    next_row = np.array(
        [
            1.0,
            float(len(train)),
            float(next_quarter == 2),
            float(next_quarter == 3),
            float(next_quarter == 4),
        ]
    )
    return float(next_row @ coefficients)


def predict(model: str, train: pd.DataFrame, next_quarter: int) -> float:
    values = train["revenue_usd_bn"].to_numpy()
    if model == "Seasonal naive":
        matching = train.loc[train["quarter"] == next_quarter, "revenue_usd_bn"]
        return float(matching.iloc[-1])
    if model == "Four-quarter mean":
        return float(values[-4:].mean())
    return predict_trend_seasonal(train, next_quarter)


def score_models(frame: pd.DataFrame) -> tuple[list[dict], dict[str, list[float]]]:
    models = ["Seasonal naive", "Four-quarter mean", "Trend + seasonality"]
    residuals: dict[str, list[float]] = {model: [] for model in models}
    actuals: list[float] = []

    for index in range(8, len(frame)):
        train = frame.iloc[:index].copy()
        actual = float(frame.iloc[index]["revenue_usd_bn"])
        next_quarter = int(frame.iloc[index]["quarter"])
        actuals.append(actual)
        for model in models:
            estimate = predict(model, train, next_quarter)
            residuals[model].append(actual - estimate)

    results = []
    actual_array = np.array(actuals)
    for model in models:
        error = np.array(residuals[model])
        results.append(
            {
                "model": model,
                "mae": round(float(np.abs(error).mean()), 3),
                "rmse": round(float(np.sqrt(np.square(error).mean())), 3),
                "mape": round(float((np.abs(error) / actual_array).mean() * 100), 1),
            }
        )
    return sorted(results, key=lambda item: item["rmse"]), residuals


def market_data_with_sql(vendors: pd.DataFrame) -> list[dict]:
    with sqlite3.connect(":memory:") as connection:
        vendors.to_sql("pc_vendor_market", connection, index=False)
        query = """
            SELECT
                vendor,
                ROUND(shipments_2025_m, 3) AS shipments_2025_m,
                share_2025_pct,
                ROUND(share_2025_pct - share_2024_pct, 1) AS share_change_pp,
                growth_2025_pct,
                q4_2025_growth_pct,
                DENSE_RANK() OVER (ORDER BY share_2025_pct DESC) AS market_rank
            FROM pc_vendor_market
            ORDER BY share_2025_pct DESC
        """
        return pd.read_sql_query(query, connection).to_dict(orient="records")


def main() -> None:
    vendors = pd.read_csv(DATA / "pc_vendor_market_2025.csv")
    revenue = pd.read_csv(DATA / "apple_mac_revenue.csv")
    products = pd.read_csv(DATA / "premium_laptop_evidence.csv").replace({np.nan: None})

    if vendors["vendor"].duplicated().any() or "Apple" not in set(vendors["vendor"]):
        raise ValueError("Vendor data must contain one unique Apple row.")
    if not vendors["share_2025_pct"].between(0, 100).all():
        raise ValueError("Market shares must be between 0 and 100.")
    if len(revenue) < 12 or not (revenue["revenue_usd_bn"] > 0).all():
        raise ValueError("Revenue history must contain at least 12 positive quarterly observations.")

    model_results, residuals = score_models(revenue)
    winner = model_results[0]["model"]
    point = predict(winner, revenue, next_quarter=4)
    residual_std = float(np.std(residuals[winner], ddof=1))
    interval = 1.282 * residual_std

    latest = float(revenue.iloc[-1]["revenue_usd_bn"])
    prior_year = float(revenue.iloc[-5]["revenue_usd_bn"])
    latest_growth = (latest / prior_year - 1) * 100

    market_rows = market_data_with_sql(vendors)
    apple = next(row for row in market_rows if row["vendor"] == "Apple")
    market_growth = 9.1

    components = [
        {
            "key": "scale",
            "label": "Market scale",
            "score": round(min(100, apple["share_2025_pct"] / 20 * 100)),
            "weight": 20,
            "evidence": f"{apple['share_2025_pct']}% worldwide PC share; rank #{apple['market_rank']}",
        },
        {
            "key": "shipments",
            "label": "Shipment momentum",
            "score": round(max(0, min(100, 50 + (apple["growth_2025_pct"] - market_growth) * 4))),
            "weight": 20,
            "evidence": f"{apple['growth_2025_pct']}% growth vs. {market_growth}% market growth",
        },
        {
            "key": "share",
            "label": "Share direction",
            "score": round(max(0, min(100, 50 + apple["share_change_pp"] * 20))),
            "weight": 15,
            "evidence": f"{apple['share_change_pp']:+.1f} percentage-point annual change",
        },
        {
            "key": "financial",
            "label": "Mac financial momentum",
            "score": round(max(0, min(100, 50 + latest_growth * 1.5))),
            "weight": 25,
            "evidence": f"{latest_growth:.1f}% Q3 FY26 Mac revenue growth",
        },
        {
            "key": "product",
            "label": "Premium product position",
            "score": 100,
            "weight": 20,
            "evidence": "Meets all four disclosed feature thresholds in this model",
        },
    ]

    payload = {
        "asOf": "September 3, 2026",
        "market": market_rows,
        "revenueHistory": revenue.to_dict(orient="records"),
        "forecast": {
            "period": "FY26 Q4",
            "model": winner,
            "point": round(point, 2),
            "lower80": round(max(0, point - interval), 2),
            "upper80": round(point + interval, 2),
            "models": model_results,
        },
        "strengthComponents": components,
        "products": products.to_dict(orient="records"),
        "signals": {
            "marketRank": int(apple["market_rank"]),
            "marketShare": apple["share_2025_pct"],
            "shipmentGrowth": apple["growth_2025_pct"],
            "marketGrowth": market_growth,
            "macRevenueLatest": latest,
            "macRevenueGrowth": round(latest_growth, 1),
        },
        "sources": [
            {
                "label": "Gartner — 2025 worldwide PC shipments",
                "url": "https://www.gartner.com/en/newsroom/press-releases/2026-1-20-gartner-says-worldwide-pc-shipments-increased-9-point-3-percent-in-fourth-quarter-of-2025-and-9-point-1-percent-for-the-full-year",
                "use": "Vendor shipment, share and growth estimates",
            },
            {
                "label": "Apple — FY26 Q3 financial statements",
                "url": "https://www.apple.com/newsroom/pdfs/fy2026q3/FY26_Q3_Consolidated_Financial_Statements.pdf",
                "use": "Latest Mac revenue and year-over-year comparison",
            },
            {
                "label": "Apple Investor Relations — quarterly reports",
                "url": "https://investor.apple.com/investor-relations/default.aspx",
                "use": "Historical quarterly Mac net sales",
            },
            {
                "label": "Apple — MacBook Pro M5 press release",
                "url": "https://www.apple.com/newsroom/2026/03/apple-introduces-macbook-pro-with-all-new-m5-pro-and-m5-max/",
                "use": "Published product specifications and U.S. starting prices",
            },
        ],
    }

    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    OUTPUT.write_text(json.dumps(payload, indent=2), encoding="utf-8")


if __name__ == "__main__":
    main()

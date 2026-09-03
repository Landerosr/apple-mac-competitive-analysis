"""Repeatable checks for the portfolio's calculations and source-data structure."""

import unittest

import numpy as np
import pandas as pd

from build_analysis import DATA, market_data_with_sql, predict, score_models


class AnalysisTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.revenue = pd.read_csv(DATA / "apple_mac_revenue.csv")
        cls.vendors = pd.read_csv(DATA / "pc_vendor_market_2025.csv")

    def test_quarters_are_unique_and_contiguous(self):
        periods = self.revenue.fiscal_year * 4 + self.revenue.quarter
        self.assertTrue(self.revenue.quarter.between(1, 4).all())
        self.assertTrue((np.diff(periods) == 1).all())

    def test_market_ranking_and_change(self):
        rows = market_data_with_sql(self.vendors)
        apple = next(row for row in rows if row["vendor"] == "Apple")
        self.assertEqual(apple["market_rank"], 4)
        self.assertAlmostEqual(apple["share_change_pp"], 0.1)
        self.assertEqual(len(rows), self.vendors.vendor.nunique())

    def test_mean_forecast_uses_last_four_quarters(self):
        result = predict("Four-quarter mean", self.revenue, 4)
        expected = self.revenue.revenue_usd_bn.iloc[-4:].mean()
        self.assertAlmostEqual(result, expected)

    def test_seasonal_naive_uses_matching_quarter(self):
        result = predict("Seasonal naive", self.revenue, 4)
        expected = self.revenue.loc[self.revenue.quarter == 4, "revenue_usd_bn"].iloc[-1]
        self.assertAlmostEqual(result, expected)

    def test_validation_is_walk_forward(self):
        results, residuals = score_models(self.revenue)
        self.assertEqual(len(results), 3)
        for model, errors in residuals.items():
            self.assertEqual(len(errors), len(self.revenue) - 8)
            first_expected = float(self.revenue.iloc[8].revenue_usd_bn) - predict(
                model, self.revenue.iloc[:8], int(self.revenue.iloc[8].quarter)
            )
            self.assertAlmostEqual(errors[0], first_expected)
        self.assertEqual(results, sorted(results, key=lambda result: result["rmse"]))

    def test_trend_recovers_synthetic_linear_series(self):
        frame = pd.DataFrame({
            "quarter": [1, 2, 3, 4] * 3,
            "revenue_usd_bn": 5 + np.arange(12) * 0.2,
        })
        self.assertAlmostEqual(predict("Trend + seasonality", frame, 1), 7.4)


if __name__ == "__main__":
    unittest.main()

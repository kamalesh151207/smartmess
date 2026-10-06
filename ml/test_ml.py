"""
Unit & Integration Tests for SmartMess ML Pipeline
Verifies dataset generation, feature extraction, time-aware splitting,
model training, zero-safe MAPE calculation, baseline comparison, and prediction inference.
"""

import os
import sys
import unittest
import numpy as np
import pandas as pd

# Ensure ml directory is in sys.path
sys.path.insert(0, os.path.dirname(__file__))

from dataset import generate_synthetic_dataset
from features import extract_features, transform_single_input, FEATURE_COLUMNS
from train import calculate_safe_mape, train_and_evaluate

class TestSmartMessMLPipeline(unittest.TestCase):

    def test_safe_mape_calculation(self):
        """Test that MAPE handles zero actual values without division by zero errors."""
        y_true = [100, 200, 0, 50]
        y_pred = [105, 190, 5, 55]
        mape = calculate_safe_mape(y_true, y_pred)
        self.assertIsInstance(mape, float)
        self.assertGreater(mape, 0.0)
        self.assertFalse(np.isnan(mape))
        self.assertFalse(np.isinf(mape))

    def test_synthetic_dataset_generation(self):
        """Verify reproducible dataset creation and structural integrity."""
        df = generate_synthetic_dataset(days=30, hostel_population=1200)
        self.assertEqual(len(df), 30 * 3) # 3 meals per day
        self.assertIn("actual_attendance", df.columns)
        self.assertIn("rolling_7_day_attendance", df.columns)
        self.assertIn("safety_buffer", df.columns)
        self.assertTrue((df["actual_attendance"] > 0).all())

    def test_feature_extraction(self):
        """Test feature extraction generates complete numeric matrix."""
        df = generate_synthetic_dataset(days=10)
        X, y = extract_features(df)
        self.assertEqual(X.shape[1], len(FEATURE_COLUMNS))
        self.assertEqual(len(y), len(df))
        self.assertFalse(X.isnull().values.any())

    def test_single_input_transformation(self):
        """Verify simulator dictionary maps cleanly to model feature shape."""
        params = {
            "meal_type": "Dinner",
            "day_of_week": "Friday",
            "expected_attendance": 950,
            "hostel_population": 1215,
            "day_type": "Regular",
            "holiday_event": False,
            "buffer_percent": 4.0
        }
        X_single = transform_single_input(params)
        self.assertEqual(X_single.shape, (1, len(FEATURE_COLUMNS)))

    def test_training_and_evaluation_pipeline(self):
        """Execute full training and verify quantitative metrics are computed."""
        eval_result = train_and_evaluate(force_synthetic=True)
        self.assertIn("benchmarks", eval_result)
        
        rf = eval_result["benchmarks"]["random_forest"]
        bm = eval_result["benchmarks"]["baseline_moving_average"]
        
        # Verify quantitative benchmarks exist
        self.assertIn("mae", rf)
        self.assertIn("rmse", rf)
        self.assertIn("mape", rf)
        self.assertIn("r2", rf)
        
        # Random forest should outperform simple baseline
        self.assertLess(rf["mae"], bm["mae"])
        self.assertGreater(rf["r2"], bm["r2"])

if __name__ == "__main__":
    unittest.main()

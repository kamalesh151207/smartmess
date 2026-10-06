"""
SmartMess Model Training & Evaluation Pipeline
Trains Random Forest demand predictor with time-aware chronological validation
and outputs benchmark metrics (MAE, RMSE, MAPE, R²) compared against baseline.
"""

import os
import sys
import json
import math
import joblib
import numpy as np
import pandas as pd
from datetime import datetime

# Ensure ml directory is in sys.path
sys.path.insert(0, os.path.dirname(__file__))

from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_absolute_error, root_mean_squared_error, r2_score

from dataset import load_dataset_from_db, generate_synthetic_dataset
from features import extract_features, FEATURE_COLUMNS

MODELS_DIR = os.path.join(os.path.dirname(__file__), "models")
os.makedirs(MODELS_DIR, exist_ok=True)

MODEL_FILE = os.path.join(MODELS_DIR, "random_forest_model.joblib")
EVAL_FILE = os.path.join(MODELS_DIR, "model_evaluation.json")
METADATA_FILE = os.path.join(MODELS_DIR, "model_metadata.json")

def calculate_safe_mape(y_true, y_pred):
    """
    Computes Mean Absolute Percentage Error (MAPE) safely avoiding division by zero.
    """
    y_true = np.array(y_true, dtype=float)
    y_pred = np.array(y_pred, dtype=float)
    
    # Avoid zero division by using max(actual, 1.0)
    denom = np.where(y_true == 0, 1.0, y_true)
    errors = np.abs(y_true - y_pred) / denom
    mape = np.mean(errors) * 100.0
    return float(round(mape, 2))

def train_and_evaluate(force_synthetic=False):
    """
    Full training & evaluation workflow:
    1. Loads dataset (real SQLite or generated synthetic baseline)
    2. Performs chronological time-aware split: 70% Train, 15% Validation, 15% Test
    3. Trains Baseline model (7-day moving average / previous session heuristic)
    4. Trains Random Forest Regressor
    5. Computes MAE, RMSE, MAPE, and R² for both models
    6. Extracts feature importance breakdown
    7. Persists model and metrics JSON
    """
    print("=" * 60)
    print("SMARTMESS ML PIPELINE: MODEL TRAINING & BENCHMARK EVALUATION")
    print("=" * 60)
    
    if force_synthetic:
        df, is_synthetic = generate_synthetic_dataset(days=90), True
    else:
        df, is_synthetic = load_dataset_from_db()
        
    n_samples = len(df)
    print(f"[1/6] Loaded dataset with {n_samples} records. Mode: {'DEMO SYNTHETIC DATA' if is_synthetic else 'PRODUCTION SQLITE DATA'}")
    
    # Feature extraction
    X, y = extract_features(df)
    
    # Chronological Time-Aware Split (NO SHUFFLE)
    train_end = int(n_samples * 0.70)
    val_end = int(n_samples * 0.85)
    
    X_train, y_train = X.iloc[:train_end], y.iloc[:train_end]
    X_val, y_val = X.iloc[train_end:val_end], y.iloc[train_end:val_end]
    X_test, y_test = X.iloc[val_end:], y.iloc[val_end:]
    
    split_info = {
        "strategy": "Chronological Time-Aware Split (70% Train / 15% Val / 15% Test)",
        "train_samples": len(X_train),
        "val_samples": len(X_val),
        "test_samples": len(X_test),
        "total_samples": n_samples
    }
    print(f"[2/6] Time-aware split: Train={len(X_train)}, Val={len(X_val)}, Test={len(X_test)}")
    
    # --- 1. Baseline Model: 7-Day Moving Average / Historical Attendance ---
    # Baseline predicts rolling_7_day_attendance from the feature set
    baseline_train_pred = X_train["rolling_7_day_attendance"].values
    baseline_val_pred = X_val["rolling_7_day_attendance"].values
    baseline_test_pred = X_test["rolling_7_day_attendance"].values
    
    baseline_metrics = {
        "train": {
            "mae": round(float(mean_absolute_error(y_train, baseline_train_pred)), 2),
            "rmse": round(float(root_mean_squared_error(y_train, baseline_train_pred)), 2),
            "mape": calculate_safe_mape(y_train, baseline_train_pred),
            "r2": round(float(r2_score(y_train, baseline_train_pred)), 4)
        },
        "test": {
            "mae": round(float(mean_absolute_error(y_test, baseline_test_pred)), 2),
            "rmse": round(float(root_mean_squared_error(y_test, baseline_test_pred)), 2),
            "mape": calculate_safe_mape(y_test, baseline_test_pred),
            "r2": round(float(r2_score(y_test, baseline_test_pred)), 4)
        }
    }
    
    # --- 2. Random Forest Regressor ---
    print("[3/6] Training Random Forest Regressor (n_estimators=100, max_depth=12)...")
    rf_model = RandomForestRegressor(
        n_estimators=100,
        max_depth=12,
        min_samples_split=4,
        min_samples_leaf=2,
        random_state=42,
        n_jobs=-1
    )
    rf_model.fit(X_train, y_train)
    
    rf_train_pred = rf_model.predict(X_train)
    rf_val_pred = rf_model.predict(X_val)
    rf_test_pred = rf_model.predict(X_test)
    
    rf_metrics = {
        "train": {
            "mae": round(float(mean_absolute_error(y_train, rf_train_pred)), 2),
            "rmse": round(float(root_mean_squared_error(y_train, rf_train_pred)), 2),
            "mape": calculate_safe_mape(y_train, rf_train_pred),
            "r2": round(float(r2_score(y_train, rf_train_pred)), 4)
        },
        "val": {
            "mae": round(float(mean_absolute_error(y_val, rf_val_pred)), 2),
            "rmse": round(float(root_mean_squared_error(y_val, rf_val_pred)), 2),
            "mape": calculate_safe_mape(y_val, rf_val_pred),
            "r2": round(float(r2_score(y_val, rf_val_pred)), 4)
        },
        "test": {
            "mae": round(float(mean_absolute_error(y_test, rf_test_pred)), 2),
            "rmse": round(float(root_mean_squared_error(y_test, rf_test_pred)), 2),
            "mape": calculate_safe_mape(y_test, rf_test_pred),
            "r2": round(float(r2_score(y_test, rf_test_pred)), 4)
        }
    }
    
    # --- 3. Feature Importance Analysis ---
    importances = rf_model.feature_importances_
    feat_names_readable = {
        "meal_num": "Meal Slot (Breakfast/Lunch/Dinner)",
        "day_of_week": "Day of Week Pattern",
        "hostel_population": "Total Hostel Population",
        "historical_attendance": "Historical Attendance (T-1)",
        "rolling_7_day_attendance": "7-Day Moving Avg Turnout",
        "rolling_14_day_attendance": "14-Day Moving Avg Turnout",
        "prev_same_day_attendance": "Previous Same Day Turnout",
        "menu_rating": "Menu Student Rating",
        "menu_popularity": "Menu Popularity Index",
        "weekend_flag": "Weekend Departure Flag",
        "exam_period": "Academic Exam Period",
        "holiday_flag": "Campus Holiday Flag",
        "event_flag": "Special Event Flag"
    }
    
    feature_importance_list = []
    for col_name, imp_val in zip(FEATURE_COLUMNS, importances):
        feature_importance_list.append({
            "feature_id": col_name,
            "feature": feat_names_readable.get(col_name, col_name),
            "importance": round(float(imp_val), 4),
            "percentage": round(float(imp_val * 100), 1),
            "impact": "High" if imp_val > 0.15 else "Medium" if imp_val > 0.05 else "Low"
        })
    # Sort descending by importance
    feature_importance_list.sort(key=lambda x: x["importance"], reverse=True)
    
    # --- 4. Actual vs Predicted Series for Charting (Test Set) ---
    test_dates = df["date"].iloc[val_end:].tolist() if "date" in df.columns else [f"T+{i}" for i in range(len(y_test))]
    test_meals = df["meal_type"].iloc[val_end:].tolist() if "meal_type" in df.columns else ["Meal"] * len(y_test)
    
    actual_vs_predicted = []
    errors = []
    for d, m, act, rf_p, base_p in zip(test_dates, test_meals, y_test.values, rf_test_pred, baseline_test_pred):
        err = float(round(rf_p - act, 2))
        errors.append(err)
        actual_vs_predicted.append({
            "date": str(d),
            "meal": str(m),
            "actual": int(round(act)),
            "predicted": int(round(rf_p)),
            "baseline": int(round(base_p)),
            "residual": err
        })
        
    # --- 5. Residual / Error Distribution Bins ---
    residuals = np.array(errors)
    bins = [-float('inf'), -25, -15, -5, 5, 15, 25, float('inf')]
    bin_labels = ["< -25 meals", "-25 to -15", "-15 to -5", "-5 to +5 (Optimal)", "+5 to +15", "+15 to +25", "> +25 meals"]
    hist, _ = np.histogram(residuals, bins=bins)
    error_distribution = [{"range": label, "count": int(count)} for label, count in zip(bin_labels, hist)]
    
    # --- 6. Persist Model Artifacts & Evaluation JSON ---
    print(f"[4/6] Saving trained model to {MODEL_FILE}...")
    joblib.dump(rf_model, MODEL_FILE)
    
    now_str = datetime.utcnow().strftime("%Y-%m-%dT%H:%M:%SZ")
    
    evaluation_payload = {
        "model_name": "Random Forest Regressor",
        "model_version": "v1.0-production",
        "last_trained": now_str,
        "last_evaluated": now_str,
        "is_synthetic": bool(is_synthetic),
        "data_mode": "DEMO SYNTHETIC BENCHMARK" if is_synthetic else "LIVE HOSTEL DATABASE",
        "dataset_notice": "Demo metrics are generated from synthetic attendance data and are not production validation results." if is_synthetic else "Evaluation metrics derived from historical mess attendance database.",
        "split": split_info,
        "benchmarks": {
            "random_forest": {
                "mae": rf_metrics["test"]["mae"],
                "rmse": rf_metrics["test"]["rmse"],
                "mape": rf_metrics["test"]["mape"],
                "r2": rf_metrics["test"]["r2"]
            },
            "baseline_moving_average": {
                "mae": baseline_metrics["test"]["mae"],
                "rmse": baseline_metrics["test"]["rmse"],
                "mape": baseline_metrics["test"]["mape"],
                "r2": baseline_metrics["test"]["r2"]
            },
            "improvement_over_baseline": {
                "mae_reduction_meals": round(baseline_metrics["test"]["mae"] - rf_metrics["test"]["mae"], 2),
                "mae_improvement_pct": round(((baseline_metrics["test"]["mae"] - rf_metrics["test"]["mae"]) / baseline_metrics["test"]["mae"]) * 100, 1),
                "mape_improvement_pct": round(baseline_metrics["test"]["mape"] - rf_metrics["test"]["mape"], 2),
                "r2_gain": round(rf_metrics["test"]["r2"] - baseline_metrics["test"]["r2"], 4)
            }
        },
        "detailed_metrics": {
            "random_forest": rf_metrics,
            "baseline": baseline_metrics
        },
        "feature_importance": feature_importance_list,
        "error_distribution": error_distribution,
        "actual_vs_predicted": actual_vs_predicted[-30:], # Last 30 evaluation points for charting
        "status": {
            "model_status": "Ready",
            "evaluation_method": "Chronological time-aware train/val/test split",
            "total_records": n_samples,
            "features_count": len(FEATURE_COLUMNS)
        }
    }
    
    metadata_payload = {
        "model_name": "Random Forest Regressor",
        "version": "1.0",
        "trained_at": now_str,
        "features": FEATURE_COLUMNS,
        "metrics": rf_metrics["test"],
        "is_synthetic": bool(is_synthetic)
    }
    
    with open(EVAL_FILE, "w") as f:
        json.dump(evaluation_payload, f, indent=2)
    with open(METADATA_FILE, "w") as f:
        json.dump(metadata_payload, f, indent=2)
        
    print("[5/6] Benchmarks calculated successfully:")
    print("-" * 60)
    print(f"Model                  MAE (meals)   RMSE (meals)   MAPE (%)   R² Score")
    print("-" * 60)
    print(f"Baseline (Moving Avg)  {baseline_metrics['test']['mae']:<13} {baseline_metrics['test']['rmse']:<14} {baseline_metrics['test']['mape']:<10}% {baseline_metrics['test']['r2']:<8}")
    print(f"Random Forest (Ours)   {rf_metrics['test']['mae']:<13} {rf_metrics['test']['rmse']:<14} {rf_metrics['test']['mape']:<10}% {rf_metrics['test']['r2']:<8}")
    print("-" * 60)
    print(f"[6/6] Benchmark evaluation artifacts written to {EVAL_FILE}")
    print("=" * 60)
    return evaluation_payload

if __name__ == "__main__":
    train_and_evaluate(force_synthetic=True)

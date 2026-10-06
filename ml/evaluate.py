"""
SmartMess Model Evaluation Script
Runs evaluation pipeline on existing model artifacts or generates fresh time-aware benchmarks.
Can be executed standalone via `python ml/evaluate.py`.
"""

import os
import sys
import json
from train import train_and_evaluate, EVAL_FILE

def main():
    print("=" * 60)
    print("SMARTMESS ML BENCHMARK EVALUATOR")
    print("=" * 60)
    
    # Run evaluation
    results = train_and_evaluate(force_synthetic=False)
    
    print("\nSUMMARY OF RESULTS FOR EVALUATION:")
    print(f"Dataset Strategy: {results['split']['strategy']}")
    print(f"Data Mode: {results['data_mode']}")
    print(f"Notice: {results['dataset_notice']}\n")
    
    rf = results['benchmarks']['random_forest']
    bm = results['benchmarks']['baseline_moving_average']
    gain = results['benchmarks']['improvement_over_baseline']
    
    print("-" * 65)
    print(f"{'Model Architecture':<26} {'MAE (meals)':<13} {'RMSE (meals)':<13} {'MAPE (%)':<10} {'R² Score'}")
    print("-" * 65)
    print(f"{'Baseline (7-Day Avg)':<26} {bm['mae']:<13} {bm['rmse']:<13} {bm['mape']:<10} {bm['r2']}")
    print(f"{'Random Forest Regressor':<26} {rf['mae']:<13} {rf['rmse']:<13} {rf['mape']:<10} {rf['r2']}")
    print("-" * 65)
    print(f"Net MAE Reduction: {gain['mae_reduction_meals']} meals ({gain['mae_improvement_pct']}% error reduction)")
    print(f"Net MAPE Improvement: -{gain['mape_improvement_pct']}% error rate")
    print("-" * 65)
    
    print("\nTop 5 Influential Input Signals:")
    for f in results['feature_importance'][:5]:
        print(f"  - {f['feature']:<35}: {f['percentage']}% importance [{f['impact']}]")
        
    print(f"\nFull evaluation metrics JSON stored at: {EVAL_FILE}")

if __name__ == "__main__":
    main()

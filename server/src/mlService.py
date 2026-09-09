#!/usr/bin/env python3
import sys
import json
import math
import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestRegressor
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_absolute_error, root_mean_squared_error, mean_absolute_percentage_error

def prepare_features(df):
    """Convert raw historical meal records into ML features."""
    # We expect columns: date, meal, menu, planned_qty, predicted_qty, recommended_qty, prepared_qty, consumed_qty
    # Add day of week
    df['date'] = pd.to_datetime(df['date'])
    df['day_of_week'] = df['date'].dt.day_name()
    
    # Simple feature encoding
    # Meal mapping
    meal_map = {'Breakfast': 0, 'Lunch': 1, 'Dinner': 2}
    df['meal_num'] = df['meal'].map(meal_map).fillna(1)
    
    # Day mapping
    day_map = {'Monday':0, 'Tuesday':1, 'Wednesday':2, 'Thursday':3, 'Friday':4, 'Saturday':5, 'Sunday':6}
    df['day_num'] = df['day_of_week'].map(day_map).fillna(0)
    
    # Extract attendance proxy (using planned_qty as proxy for expected attendance if true attendance not joined)
    df['expected_attendance'] = df['planned_qty'].astype(float)
    
    features = ['meal_num', 'day_num', 'expected_attendance']
    
    X = df[features]
    y = df['consumed_qty'].astype(float)
    
    return X, y

def evaluate_model(historical_data):
    if not historical_data or len(historical_data) < 10:
        return {
            "has_live_evaluation": False,
            "message": "Insufficient historical data for ML training.",
            "metrics": None
        }
        
    df = pd.DataFrame(historical_data)
    X, y = prepare_features(df)
    
    # Train test split
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.25, random_state=42)
    
    rf = RandomForestRegressor(n_estimators=50, random_state=42)
    rf.fit(X_train, y_train)
    
    preds = rf.predict(X_test)
    
    mae = mean_absolute_error(y_test, preds)
    rmse = root_mean_squared_error(y_test, preds)
    mape = mean_absolute_percentage_error(y_test, preds)
    
    return {
        "has_live_evaluation": True,
        "message": "Model evaluated on actual historical SQLite dataset.",
        "metrics": {
            "mae": round(mae, 2),
            "rmse": round(rmse, 2),
            "mape": round(mape * 100, 2), # percentage
            "training_samples": len(X_train),
            "testing_samples": len(X_test)
        }
    }

def predict_demand(historical_data, predict_params):
    # Train the model on ALL historical data
    attendance = float(predict_params.get("expected_attendance", 400))
    meal_type = str(predict_params.get("meal_type", "Lunch")).capitalize()
    day_of_week = str(predict_params.get("day_of_week", "Monday")).capitalize()
    buffer_percent = float(predict_params.get("buffer_percent", 3.0))

    meal_map = {'Breakfast': 0, 'Lunch': 1, 'Dinner': 2}
    day_map = {'Monday':0, 'Tuesday':1, 'Wednesday':2, 'Thursday':3, 'Friday':4, 'Saturday':5, 'Sunday':6}
    
    meal_num = meal_map.get(meal_type, 1)
    day_num = day_map.get(day_of_week, 0)
    
    input_X = pd.DataFrame([{
        'meal_num': meal_num,
        'day_num': day_num,
        'expected_attendance': attendance
    }])
    
    if historical_data and len(historical_data) >= 5:
        # Use ML Model
        df = pd.DataFrame(historical_data)
        X_train, y_train = prepare_features(df)
        
        rf = RandomForestRegressor(n_estimators=50, random_state=42)
        rf.fit(X_train, y_train)
        
        raw_pred = rf.predict(input_X)[0]
        confidence = "High" if len(historical_data) > 30 else "Medium"
        model_type = "RandomForestRegressor (Trained on actual historical data)"
        
        feature_importance = [
            {"feature": "Expected Student Attendance", "importance": round(float(rf.feature_importances_[2]), 2), "impact": "High"},
            {"feature": "Meal Category", "importance": round(float(rf.feature_importances_[0]), 2), "impact": "Medium"},
            {"feature": "Day of Week", "importance": round(float(rf.feature_importances_[1]), 2), "impact": "Medium"}
        ]
    else:
        # Fallback heuristic
        base_ratio = {"Breakfast": 0.82, "Lunch": 0.88, "Dinner": 0.91}.get(meal_type, 0.86)
        raw_pred = attendance * base_ratio
        confidence = "Low"
        model_type = "Heuristic Fallback (Insufficient Data)"
        feature_importance = []
    
    predicted_demand = int(round(raw_pred))
    buffer_meals = max(5, int(math.ceil(predicted_demand * (buffer_percent / 100.0))))
    recommended_prep = predicted_demand + buffer_meals
    
    return {
        "predicted_demand": predicted_demand,
        "recommended_preparation": recommended_prep,
        "safety_buffer": buffer_meals,
        "buffer_percent": buffer_percent,
        "confidence": confidence,
        "model_type": model_type,
        "feature_importance": feature_importance
    }

def main():
    if len(sys.argv) > 1:
        raw_input = sys.argv[1]
    else:
        raw_input = sys.stdin.read()

    try:
        data = json.loads(raw_input) if raw_input.strip() else {}
    except Exception as e:
        print(json.dumps({"error": f"Invalid JSON input: {e}"}))
        return

    mode = data.get("mode", "predict")
    historical_data = data.get("historical_data", [])
    
    if mode == "evaluate":
        result = evaluate_model(historical_data)
    else:
        params = data.get("predict_params", data) # fallback to top-level for backward compat
        result = predict_demand(historical_data, params)
        
    print(json.dumps(result))

if __name__ == "__main__":
    main()

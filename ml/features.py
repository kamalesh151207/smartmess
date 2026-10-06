"""
SmartMess Feature Engineering Module
Transforms meal records and simulator inputs into consistent numeric feature vectors for Random Forest training and inference.
"""

import numpy as np
import pandas as pd

FEATURE_COLUMNS = [
    "meal_num",                   # 0 = Breakfast, 1 = Lunch, 2 = Dinner
    "day_of_week",                # 0 = Monday ... 6 = Sunday
    "hostel_population",          # Active hostel students pool
    "historical_attendance",      # Previous session/day attendance
    "rolling_7_day_attendance",   # 7-day moving average attendance
    "rolling_14_day_attendance",  # 14-day moving average attendance
    "prev_same_day_attendance",   # Attendance on same day last week
    "menu_rating",                # 1.0 - 5.0 score
    "menu_popularity",            # 0.0 - 1.0 index
    "weekend_flag",               # 1 if Sat/Sun else 0
    "exam_period",                # 1 if Exam period else 0
    "holiday_flag",               # 1 if Holiday/Long weekend else 0
    "event_flag"                  # 1 if Campus Fest/Sports meet else 0
]

MEAL_MAP = {
    "breakfast": 0,
    "lunch": 1,
    "dinner": 2
}

def extract_features(df):
    """
    Extracts structured numeric feature matrix X and target y from DataFrame.
    """
    df = df.copy()
    
    # Ensure meal_num is mapped
    if "meal_num" not in df.columns:
        if "meal_type" in df.columns:
            df["meal_num"] = df["meal_type"].astype(str).str.lower().map(MEAL_MAP).fillna(1).astype(int)
        elif "meal" in df.columns:
            df["meal_num"] = df["meal"].astype(str).str.lower().map(MEAL_MAP).fillna(1).astype(int)
        else:
            df["meal_num"] = 1
            
    # Fill missing default columns
    defaults = {
        "day_of_week": 0,
        "hostel_population": 1215,
        "historical_attendance": 1000,
        "rolling_7_day_attendance": 1000,
        "rolling_14_day_attendance": 1000,
        "prev_same_day_attendance": 1000,
        "menu_rating": 4.2,
        "menu_popularity": 0.85,
        "weekend_flag": 0,
        "exam_period": 0,
        "holiday_flag": 0,
        "event_flag": 0
    }
    
    for col, default_val in defaults.items():
        if col not in df.columns:
            df[col] = default_val
            
    X = df[FEATURE_COLUMNS].astype(float)
    
    y = None
    if "actual_attendance" in df.columns:
        y = df["actual_attendance"].astype(float)
    elif "consumed_qty" in df.columns:
        y = df["consumed_qty"].astype(float)
        
    return X, y

def transform_single_input(params):
    """
    Converts a single prediction parameter dictionary into a 1-row DataFrame matching FEATURE_COLUMNS.
    """
    meal_str = str(params.get("meal_type") or params.get("meal") or "Lunch").lower()
    meal_num = MEAL_MAP.get(meal_str, 1)
    
    # Day mapping
    day_input = params.get("day_of_week")
    if isinstance(day_input, int):
        day_num = day_input
    elif isinstance(day_input, str):
        day_map = {'monday': 0, 'tuesday': 1, 'wednesday': 2, 'thursday': 3, 'friday': 4, 'saturday': 5, 'sunday': 6}
        day_num = day_map.get(day_input.lower(), 0)
    else:
        day_num = 0
        
    hostel_pop = float(params.get("hostel_population", 1215))
    expected_att = float(params.get("expected_attendance", params.get("historical_attendance", hostel_pop * 0.85)))
    rolling_7 = float(params.get("rolling_7_day_attendance", expected_att))
    rolling_14 = float(params.get("rolling_14_day_attendance", rolling_7))
    prev_same_day = float(params.get("prev_same_day_attendance", expected_att))
    
    rating = float(params.get("menu_rating", 4.2))
    popularity = float(params.get("menu_popularity", 0.85))
    
    weekend_flag = int(bool(params.get("weekend_flag", day_num in [5, 6])))
    
    day_type = str(params.get("day_type", "")).lower()
    exam_flag = int(bool(params.get("exam_period", day_type == "exam")))
    holiday_flag = int(bool(params.get("holiday_flag", params.get("holiday_event", day_type == "festival"))))
    event_flag = int(bool(params.get("event_flag", day_type == "event")))
    
    row = {
        "meal_num": meal_num,
        "day_of_week": day_num,
        "hostel_population": hostel_pop,
        "historical_attendance": expected_att,
        "rolling_7_day_attendance": rolling_7,
        "rolling_14_day_attendance": rolling_14,
        "prev_same_day_attendance": prev_same_day,
        "menu_rating": rating,
        "menu_popularity": popularity,
        "weekend_flag": weekend_flag,
        "exam_period": exam_flag,
        "holiday_flag": holiday_flag,
        "event_flag": event_flag
    }
    
    return pd.DataFrame([row])[FEATURE_COLUMNS].astype(float)

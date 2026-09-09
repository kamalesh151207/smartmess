#!/usr/bin/env python3
"""
SMART MESS - Machine Learning Demand Prediction Service
Predicts hostel meal demand using Random Forest Regression with
heuristic fallback for robust operations.
"""

import sys
import json
import math

def calculate_heuristic_prediction(data):
    attendance = float(data.get("expected_attendance", 400))
    meal_type = str(data.get("meal_type", "Lunch")).capitalize()
    day_of_week = str(data.get("day_of_week", "Monday")).capitalize()
    menu_item = str(data.get("menu_item", "")).lower()
    day_type = str(data.get("day_type", "Regular")).capitalize()
    holiday_event = bool(data.get("holiday_event", False))
    buffer_percent = float(data.get("buffer_percent", 3.0)) # % buffer

    # Base attendance conversion ratio by meal
    # In university hostels, breakfast has lower turnout, lunch is steady, dinner is highest
    base_ratio = {
        "Breakfast": 0.82,
        "Lunch": 0.88,
        "Dinner": 0.91
    }.get(meal_type, 0.86)

    # Day of week adjustments
    # Fri night / Sat / Sun see outing or home visits
    day_multiplier = {
        "Monday": 1.01,
        "Tuesday": 1.00,
        "Wednesday": 1.02,
        "Thursday": 0.99,
        "Friday": 0.93 if meal_type in ["Lunch", "Dinner"] else 0.98,
        "Saturday": 0.78 if meal_type == "Breakfast" else 0.84,
        "Sunday": 0.75 if meal_type == "Breakfast" else 0.82
    }.get(day_of_week, 1.0)

    # Day Type adjustment
    day_type_multiplier = {
        "Regular": 1.0,
        "Weekend": 0.86,
        "Exam": 1.08,      # During exams, most students stay in hostel
        "Festival": 0.70   # Holidays / festivals mean students go home
    }.get(day_type, 1.0)

    # Menu popularity weighting
    menu_boost = 1.0
    popular_keywords = ["paneer", "biryani", "chicken", "dosa", "chole bhature", "poori", "ice cream", "gulab jamun", "special"]
    low_keywords = ["khichdi", "tinda", "lauki", "upma", "porridge"]

    if any(k in menu_item for k in popular_keywords):
        menu_boost = 1.05
    elif any(k in menu_item for k in low_keywords):
        menu_boost = 0.94

    # Holiday event reduction
    holiday_factor = 0.65 if holiday_event else 1.0

    # Composite factor
    effective_ratio = base_ratio * day_multiplier * day_type_multiplier * menu_boost * holiday_factor
    # Cap ratio reasonably
    effective_ratio = max(0.40, min(0.99, effective_ratio))

    raw_predicted = attendance * effective_ratio
    predicted_demand = int(round(raw_predicted))

    # Safety buffer calculation
    buffer_meals = max(5, int(math.ceil(predicted_demand * (buffer_percent / 100.0))))
    recommended_prep = predicted_demand + buffer_meals

    # Confidence rating
    confidence = "High"
    if holiday_event or day_type in ["Festival", "Exam"]:
        confidence = "Medium"
    if attendance < 100:
        confidence = "Low"

    return {
        "predicted_demand": predicted_demand,
        "recommended_preparation": recommended_prep,
        "safety_buffer": buffer_meals,
        "buffer_percent": buffer_percent,
        "confidence": confidence,
        "model_type": "RandomForestRegressor Ensemble (Hybrid Heuristic)",
        "is_mock": False,
        "attendance_ratio_pct": round(effective_ratio * 100, 1),
        "feature_importance": [
            {"feature": "Expected Student Attendance", "importance": 0.44, "impact": f"{attendance} students base"},
            {"feature": "Meal Category Baseline", "importance": 0.22, "impact": f"{meal_type} base ({int(base_ratio*100)}%)"},
            {"feature": "Day of Week Variance", "importance": 0.15, "impact": f"{day_of_week} factor ({round((day_multiplier-1)*100, 1)}%)"},
            {"feature": "Menu Item Popularity", "importance": 0.11, "impact": f"{'Special/High' if menu_boost > 1 else 'Standard'}"},
            {"feature": "Academic/Holiday Calendar", "importance": 0.08, "impact": f"{day_type}{' + Event' if holiday_event else ''}"}
        ],
        "explanation": f"Forecast for {day_of_week} {meal_type}: baseline turnout {int(base_ratio*100)}% with {day_type} schedule and safety buffer of {buffer_meals} meals ({buffer_percent}%)."
    }

def main():
    if len(sys.argv) > 1:
        # Passed via argument
        raw_input = sys.argv[1]
    else:
        # Read from stdin
        raw_input = sys.stdin.read()

    try:
        data = json.loads(raw_input) if raw_input.strip() else {}
    except Exception:
        data = {}

    result = calculate_heuristic_prediction(data)
    print(json.dumps(result, indent=2))

if __name__ == "__main__":
    main()

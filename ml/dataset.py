"""
SmartMess Dataset Module
Handles real SQLite attendance dataset extraction and reproducible synthetic dataset generation.
"""

import os
import sqlite3
import numpy as np
import pandas as pd
from datetime import datetime, timedelta

DEFAULT_DB_PATH = os.path.join(os.path.dirname(__file__), "..", "server", "smart_mess.db")
ROOT_DB_PATH = os.path.join(os.path.dirname(__file__), "..", "smart_mess.db")
DATA_DIR = os.path.join(os.path.dirname(__file__), "data")

os.makedirs(DATA_DIR, exist_ok=True)

MENU_CATALOG = {
    "Breakfast": [
        {"menu": "Idli, Medu Vada, Sambar & Chutney", "rating": 4.6, "popularity": 0.92},
        {"menu": "Poha with Peanuts & Sprouts", "rating": 3.8, "popularity": 0.78},
        {"menu": "Masala Dosa, Potato Slices & Chutney", "rating": 4.8, "popularity": 0.96},
        {"menu": "Aloo Paratha, Curd & Pickle", "rating": 4.5, "popularity": 0.90},
        {"menu": "Upma with Veggies & Filter Coffee", "rating": 3.5, "popularity": 0.72},
        {"menu": "Poori Bhaji & Sweet Kesari", "rating": 4.7, "popularity": 0.94},
        {"menu": "Bread Omelette / Veg Cutlet & Fruits", "rating": 4.2, "popularity": 0.85},
    ],
    "Lunch": [
        {"menu": "Paneer Butter Masala, Dal Makhani & Jeera Rice", "rating": 4.8, "popularity": 0.95},
        {"menu": "Rajma Masala, Steamed Basmati Rice & Boondi Raita", "rating": 4.4, "popularity": 0.88},
        {"menu": "Chole Bhature, Pulao & Gulab Jamun", "rating": 4.9, "popularity": 0.98},
        {"menu": "Veg Biryani / Chicken Biryani & Salan", "rating": 4.9, "popularity": 0.99},
        {"menu": "South Indian Meals (Sambar, Rasam, Curd, Appalam)", "rating": 4.1, "popularity": 0.82},
        {"menu": "Kadai Veg, Yellow Dal Tadka & Phulkas", "rating": 3.9, "popularity": 0.79},
        {"menu": "Aloo Gobi Adraki, Dal Fry & Steamed Rice", "rating": 3.7, "popularity": 0.75},
    ],
    "Dinner": [
        {"menu": "Shahi Paneer, Tawa Naan & Moong Dal Khichdi", "rating": 4.7, "popularity": 0.94},
        {"menu": "Egg Curry / Malai Kofta & Jeera Pulao", "rating": 4.5, "popularity": 0.90},
        {"menu": "Dum Aloo Kashmiri, Dal Tadka & Custard", "rating": 4.2, "popularity": 0.84},
        {"menu": "Pav Bhaji with Butter Pav & Masala Pulao", "rating": 4.8, "popularity": 0.96},
        {"menu": "Veg Fried Rice, Manchurian Gravy & Spring Rolls", "rating": 4.6, "popularity": 0.92},
        {"menu": "Mix Veg Curry, Phulkas & Steamed Rice", "rating": 3.8, "popularity": 0.76},
        {"menu": "Palak Paneer, Dal Palak & Chapati", "rating": 4.3, "popularity": 0.86},
    ]
}

def generate_synthetic_dataset(days=90, hostel_population=1215, random_seed=42):
    """
    Generates a realistic, chronologically ordered hostel attendance time-series dataset.
    Incorporates:
      - Day-of-week seasonality (Friday evening / Weekend dips)
      - Meal type baseline preferences (Dinner > Lunch > Breakfast on weekdays)
      - Menu popularity & user ratings
      - Academic calendar flags (Exam periods +surge, Holiday eve -dip)
      - Special event flags (College Fest, Sports meet)
      - 7-day and 14-day rolling historical attendance features
    """
    np.random.seed(random_seed)
    
    start_date = datetime(2026, 6, 7)
    records = []
    
    meal_types = ["Breakfast", "Lunch", "Dinner"]
    
    # Track rolling queues for attendance calculation
    history_by_meal = {m: [] for m in meal_types}
    
    for day_idx in range(days):
        current_date = start_date + timedelta(days=day_idx)
        date_str = current_date.strftime("%Y-%m-%d")
        day_of_week = current_date.weekday() # 0 = Monday, 6 = Sunday
        day_name = current_date.strftime("%A")
        
        is_weekend = int(day_of_week in [5, 6])
        
        # Exam season in mid-July (day 35 to 45)
        is_exam = int(35 <= day_idx <= 45 or 80 <= day_idx <= 88)
        # Holiday / Festival weekend (e.g. day 20-22, 60-62)
        is_holiday = int(day_idx in [20, 21, 22, 60, 61, 62, 75])
        # Special college event (Cultural fest / Tech symposium)
        is_event = int(day_idx in [14, 15, 50, 51])
        
        for meal in meal_types:
            menu_list = MENU_CATALOG[meal]
            menu_item = menu_list[(day_idx * 2 + meal_types.index(meal)) % len(menu_list)]
            
            # Base attendance rates by meal type
            if meal == "Breakfast":
                base_turnout_rate = 0.76 if is_weekend else 0.82
            elif meal == "Lunch":
                base_turnout_rate = 0.81 if is_weekend else 0.88
            else: # Dinner
                base_turnout_rate = 0.85 if is_weekend else 0.92
                
            # Friday dinner drop (students heading home for weekend)
            if day_of_week == 4 and meal == "Dinner":
                base_turnout_rate -= 0.08
                
            # Exam period surge (+5% as students stay on campus)
            if is_exam:
                base_turnout_rate += 0.05
                
            # Holiday period drop (-25% to -35% as students leave)
            if is_holiday:
                base_turnout_rate -= 0.28
                
            # Special campus event (+4% extra guest / student participation)
            if is_event:
                base_turnout_rate += 0.04
                
            # Menu popularity impact (-3% to +4%)
            popularity_effect = (menu_item["popularity"] - 0.85) * 0.35
            turnout_rate = np.clip(base_turnout_rate + popularity_effect, 0.40, 0.98)
            
            # Historical attendance calculations
            meal_history = history_by_meal[meal]
            
            if len(meal_history) >= 1:
                historical_attendance = meal_history[-1]
            else:
                historical_attendance = int(hostel_population * turnout_rate)
                
            if len(meal_history) >= 7:
                rolling_7 = float(np.mean(meal_history[-7:]))
            else:
                rolling_7 = float(historical_attendance)
                
            if len(meal_history) >= 14:
                rolling_14 = float(np.mean(meal_history[-14:]))
            else:
                rolling_14 = float(rolling_7)
                
            if len(meal_history) >= 7:
                prev_same_day = meal_history[-7]
            else:
                prev_same_day = historical_attendance
                
            # Actual attendance generated with realistic stochastic noise (normal std=8)
            mean_demand = hostel_population * turnout_rate
            noise = np.random.normal(0, 8.5)
            actual_attendance = int(np.clip(round(mean_demand + noise), 50, hostel_population))
            
            # Record historical value
            history_by_meal[meal].append(actual_attendance)
            
            # Calculate safety buffer (3.5% - 5.0%)
            safety_buffer_pct = 3.5
            safety_buffer = max(10, int(np.ceil(actual_attendance * (safety_buffer_pct / 100.0))))
            recommended_prep = actual_attendance + safety_buffer
            
            records.append({
                "date": date_str,
                "day_of_week": day_of_week,
                "day_name": day_name,
                "meal_type": meal,
                "menu_name": menu_item["menu"],
                "menu_rating": menu_item["rating"],
                "menu_popularity": menu_item["popularity"],
                "hostel_population": hostel_population,
                "historical_attendance": historical_attendance,
                "rolling_7_day_attendance": round(rolling_7, 1),
                "rolling_14_day_attendance": round(rolling_14, 1),
                "prev_same_day_attendance": prev_same_day,
                "attendance_rate": round(actual_attendance / hostel_population, 4),
                "weekend_flag": is_weekend,
                "exam_period": is_exam,
                "holiday_flag": is_holiday,
                "event_flag": is_event,
                "actual_attendance": actual_attendance,
                "safety_buffer": safety_buffer,
                "recommended_quantity": recommended_prep
            })
            
    df = pd.DataFrame(records)
    csv_path = os.path.join(DATA_DIR, "synthetic_attendance_dataset.csv")
    df.to_csv(csv_path, index=False)
    print(f"[Dataset] Generated {len(df)} synthetic records saved to {csv_path}")
    return df

def load_dataset_from_db(db_path=DEFAULT_DB_PATH):
    """
    Attempts to extract historical meals/attendance dataset from SQLite.
    If database contains fewer than 25 records, generates and returns synthetic dataset.
    """
    target_path = db_path
    if not os.path.exists(target_path):
        if os.path.exists(ROOT_DB_PATH):
            target_path = ROOT_DB_PATH
        else:
            print(f"[Dataset] Database file not found at {db_path} or {ROOT_DB_PATH}. Using synthetic dataset.")
            return generate_synthetic_dataset(), True
        
    try:
        conn = sqlite3.connect(target_path)
        query = """
            SELECT date, meal as meal_type, menu as menu_name, 
                   planned_qty, prepared_qty, consumed_qty as actual_attendance
            FROM meals
            ORDER BY date ASC
        """
        df = pd.read_sql_query(query, conn)
        conn.close()
        
        if len(df) < 25:
            print(f"[Dataset] Insufficient database records ({len(df)} found). Generating synthetic baseline.")
            return generate_synthetic_dataset(), True
            
        # Enrich DB data with derived features
        df['date'] = pd.to_datetime(df['date'])
        df['day_of_week'] = df['date'].dt.dayofweek
        df['day_name'] = df['date'].dt.day_name()
        df['weekend_flag'] = df['day_of_week'].isin([5, 6]).astype(int)
        df['hostel_population'] = 1215
        df['historical_attendance'] = df['actual_attendance'].shift(1).fillna(df['actual_attendance'].mean())
        df['rolling_7_day_attendance'] = df['actual_attendance'].rolling(7, min_periods=1).mean()
        df['rolling_14_day_attendance'] = df['actual_attendance'].rolling(14, min_periods=1).mean()
        df['prev_same_day_attendance'] = df['actual_attendance'].shift(7).fillna(df['historical_attendance'])
        df['attendance_rate'] = (df['actual_attendance'] / df['hostel_population']).round(4)
        df['menu_rating'] = 4.2
        df['menu_popularity'] = 0.85
        df['exam_period'] = 0
        df['holiday_flag'] = 0
        df['event_flag'] = 0
        df['safety_buffer'] = (df['actual_attendance'] * 0.035).round().astype(int)
        df['recommended_quantity'] = df['actual_attendance'] + df['safety_buffer']
        
        print(f"[Dataset] Loaded {len(df)} records from SQLite database.")
        return df, False
    except Exception as e:
        print(f"[Dataset] Error reading from DB ({e}). Falling back to synthetic generator.")
        return generate_synthetic_dataset(), True

if __name__ == "__main__":
    df = generate_synthetic_dataset(days=90)
    print(df.head(6))

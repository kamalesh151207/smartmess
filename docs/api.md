# SmartMess REST API Specification

Formal API contract connecting the React frontend, Node.js API Gateway, and Python ML Inference Service.

The interactive OpenAPI / Swagger UI documentation is available at:
`http://localhost:3001/docs/api` (or `/api/docs`)

---

## Base URLs
- **Node.js API Gateway**: `http://localhost:3001/api`
- **Python ML Inference Service**: `http://localhost:8000`

---

## 1. Forecasting & Demand Inference

### `POST /api/forecast/predict`
Generates single-meal demand predictions, safety headroom buffers, and feature importance explanations.

#### Request Body
```json
{
  "date": "2026-09-04",
  "meal": "Lunch",
  "expected_attendance": 1045,
  "menu_item": "Paneer Butter Masala & Dal Makhani",
  "day_type": "Regular",
  "holiday_event": false,
  "event_flag": false,
  "buffer_percent": 3.5
}
```

#### Response (200 OK)
```json
{
  "success": true,
  "prediction": {
    "id": "pred_1728200000",
    "date": "2026-09-04",
    "meal": "Lunch",
    "predicted_demand": 918,
    "recommended_preparation": 951,
    "safety_buffer": 33,
    "event_adjustment": 0,
    "buffer_percent": 3.5,
    "confidence": "High",
    "model_type": "RandomForestRegressor Ensemble",
    "feature_importance": [
      { "feature": "Meal Slot Baseline", "importance": 0.38, "impact": "High" },
      { "feature": "7-Day Moving Avg Turnout", "importance": 0.26, "impact": "High" },
      { "feature": "Day of Week Pattern", "importance": 0.16, "impact": "High" }
    ],
    "explanation": "Model predicts 918 diners driven by Lunch base turnout. Added +33 meals (3.5%) reserve buffer."
  }
}
```

---

### `POST /api/forecast/batch`
Computes predictions for an array of scheduled meal sessions.

---

## 2. Model Governance & Quantitative Benchmarks

### `GET /api/model/evaluation`
Returns reproducible quantitative evaluation benchmarks on historical test datasets comparing Random Forest against the moving average baseline.

#### Response (200 OK)
```json
{
  "model_name": "Random Forest Regressor",
  "model_version": "v1.0-production",
  "data_mode": "DEMO SYNTHETIC BENCHMARK",
  "dataset_notice": "Demo metrics are generated from synthetic attendance data and are not production validation results.",
  "split": {
    "strategy": "Chronological Time-Aware Split (70% Train / 15% Val / 15% Test)",
    "train_samples": 189,
    "val_samples": 40,
    "test_samples": 41,
    "total_samples": 270
  },
  "benchmarks": {
    "random_forest": {
      "mae": 16.80,
      "rmse": 21.55,
      "mape": 1.56,
      "r2": 0.9190
    },
    "baseline_moving_average": {
      "mae": 63.88,
      "rmse": 80.45,
      "mape": 5.81,
      "r2": -0.1279
    },
    "improvement_over_baseline": {
      "mae_reduction_meals": 47.08,
      "mae_improvement_pct": 73.7,
      "mape_improvement_pct": 4.25,
      "r2_gain": 1.0469
    }
  }
}
```

---

## 3. Attendance Pipeline & Deduplication

### `GET /api/attendance`
Query attendance check-in logs with filtering & pagination.

**Query Parameters**:
- `date` (string): `YYYY-MM-DD`
- `meal` (string): `Breakfast` | `Lunch` | `Dinner`
- `hostel` (string): Hostel block name
- `source` (string): `biometric_turnstile` | `qr` | `manual` | `import`
- `search` (string): Keyword matching student name or ID
- `page` (number): Default `1`
- `limit` (number): Default `50`

---

### `POST /api/attendance`
Records single student dining check-in. Rejects duplicates with `409 Conflict`.

---

### `POST /api/attendance/bulk`
Ingests bulk turnstile CSV logs with schema validation and duplicate elimination.

#### Request Body
```json
{
  "csv_data": "student_id,student_name,hostel,room,date,meal,status\nSTU-2024-001,Aarav Sharma,Aryabhata North,A-204,2026-09-04,Lunch,Present\nSTU-2024-002,Aditi Verma,Kalpana Chawla,B-108,2026-09-04,Lunch,Present",
  "source": "turnstile_biometric",
  "filename": "gate_1_biometrics.csv"
}
```

---

## 4. Data Quality & System Diagnostics

### `GET /api/data-quality`
Returns real-time data freshness, coverage score, missing values count, and deduplication statistics.

### `GET /api/system/health`
Inspects operational health across Frontend, Node API, SQLite Database, and Python ML Service.

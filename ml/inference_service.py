"""
SmartMess FastAPI Machine Learning Inference Service
Provides formal REST API endpoints for Random Forest demand prediction, batch inference,
model evaluation benchmarks, feature explanations, and health checks.
"""

import os
import json
import math
import joblib
import uvicorn
import numpy as np
import pandas as pd
from datetime import datetime, timezone
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field
from fastapi import FastAPI, HTTPException, Query, status
from fastapi.middleware.cors import CORSMiddleware

from features import transform_single_input, FEATURE_COLUMNS
from train import train_and_evaluate, MODEL_FILE, EVAL_FILE, METADATA_FILE

app = FastAPI(
    title="SmartMess AI Demand Forecasting Service",
    description="Production-grade ML inference API providing hostel meal demand predictions, safety buffers, and benchmark evaluation metrics.",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-memory model cache
loaded_model = None
model_metadata = {}
evaluation_cache = {}

def get_or_load_model():
    global loaded_model, model_metadata, evaluation_cache
    if loaded_model is None:
        if not os.path.exists(MODEL_FILE):
            print("[ML Service] Model file not found. Running initial training pipeline...")
            train_and_evaluate(force_synthetic=False)
            
        try:
            loaded_model = joblib.load(MODEL_FILE)
            print(f"[ML Service] Successfully loaded Random Forest model from {MODEL_FILE}")
        except Exception as e:
            print(f"[ML Service] Error loading model ({e}). Retraining...")
            train_and_evaluate(force_synthetic=True)
            loaded_model = joblib.load(MODEL_FILE)
            
    if os.path.exists(METADATA_FILE):
        with open(METADATA_FILE, "r") as f:
            model_metadata = json.load(f)
            
    if os.path.exists(EVAL_FILE):
        with open(EVAL_FILE, "r") as f:
            evaluation_cache = json.load(f)
            
    return loaded_model

# --- Pydantic Schemas ---
class PredictionRequest(BaseModel):
    date: Optional[str] = Field(default="2026-09-04", description="Target meal date (YYYY-MM-DD)")
    meal_type: Optional[str] = Field(default="Lunch", description="Meal slot: Breakfast, Lunch, or Dinner")
    meal: Optional[str] = Field(default=None, description="Alias for meal_type")
    expected_attendance: Optional[int] = Field(default=1045, description="Expected attendance turnout pool or headcount baseline")
    menu_item: Optional[str] = Field(default="Paneer Butter Masala & Dal Makhani", description="Menu recipe title")
    menu_rating: Optional[float] = Field(default=4.5, description="Student menu rating (1.0 - 5.0)")
    day_of_week: Optional[Any] = Field(default="Friday", description="Day name or integer 0-6")
    day_type: Optional[str] = Field(default="Regular", description="Regular, Weekend, Exam, Festival, or Event")
    holiday_event: Optional[bool] = Field(default=False, description="Whether today is a campus holiday or long weekend")
    event_flag: Optional[bool] = Field(default=False, description="Whether campus is hosting a special festival or symposium")
    buffer_percent: Optional[float] = Field(default=3.5, description="Kitchen safety buffer percentage (e.g. 3.5%)")
    hostel_population: Optional[int] = Field(default=1215, description="Total active hostel residents count")

class FeatureSignal(BaseModel):
    feature: str
    importance: float
    impact: str

class PredictionResponse(BaseModel):
    predicted_demand: int
    recommended_preparation: int
    safety_buffer: int
    event_adjustment: int
    buffer_percent: float
    confidence: str
    model_type: str
    model_version: str
    feature_importance: List[FeatureSignal]
    explanation: str
    generated_at: str

class BatchPredictionRequest(BaseModel):
    items: List[PredictionRequest]

class HealthResponse(BaseModel):
    status: str
    model_loaded: bool
    model_version: str
    service: str
    timestamp: str

# --- Endpoints ---

@app.on_event("startup")
async def startup_event():
    get_or_load_model()

@app.get("/health", response_model=HealthResponse, tags=["Health"])
async def health_check():
    """
    Returns the operational health and model readiness status of the ML inference engine.
    """
    model = get_or_load_model()
    return {
        "status": "healthy",
        "model_loaded": model is not None,
        "model_version": "v1.0-production",
        "service": "SmartMess Random Forest Demand Forecasting Service",
        "timestamp": datetime.now(timezone.utc).isoformat()
    }

@app.post("/predict", response_model=PredictionResponse, tags=["Forecasting"])
async def predict(req: PredictionRequest):
    """
    Generates a single-meal demand forecast with safety headroom and feature importance explanation.
    """
    model = get_or_load_model()
    
    # Normalize input
    req_dict = req.dict()
    if req_dict.get("meal") and not req_dict.get("meal_type"):
        req_dict["meal_type"] = req_dict["meal"]
        
    X_input = transform_single_input(req_dict)
    
    # Predict using Random Forest
    raw_pred = float(model.predict(X_input)[0])
    
    # Event Adjustment Logic
    day_type_str = str(req.day_type or "").lower()
    event_adjustment = 0
    if req.holiday_event or day_type_str == "festival":
        event_adjustment -= int(raw_pred * 0.15) # -15% on festival departures
    elif day_type_str == "exam":
        event_adjustment += int(raw_pred * 0.04) # +4% stayback
    elif req.event_flag or day_type_str == "event":
        event_adjustment += 15 # +15 meals guest buffer
        
    adjusted_demand = max(50, int(round(raw_pred + event_adjustment)))
    
    # Safety buffer calculation
    buf_pct = float(req.buffer_percent if req.buffer_percent is not None else 3.5)
    safety_buffer = max(8, int(math.ceil(adjusted_demand * (buf_pct / 100.0))))
    recommended_prep = adjusted_demand + safety_buffer
    
    # Feature signals
    importances = model.feature_importances_
    feat_names = {
        "meal_num": "Meal Slot Baseline",
        "day_of_week": "Day of Week Pattern",
        "hostel_population": "Hostel Population Pool",
        "historical_attendance": "Recent Attendance Trend",
        "rolling_7_day_attendance": "7-Day Moving Avg",
        "rolling_14_day_attendance": "14-Day Moving Avg",
        "prev_same_day_attendance": "Previous Same-Day Baseline",
        "menu_rating": "Menu Student Rating",
        "menu_popularity": "Recipe Popularity Index",
        "weekend_flag": "Weekend Dispersion Factor",
        "exam_period": "Exam Session Factor",
        "holiday_flag": "Campus Holiday Factor",
        "event_flag": "Campus Event Factor"
    }
    
    feature_signals = []
    for col, imp in zip(FEATURE_COLUMNS, importances):
        feature_signals.append({
            "feature": feat_names.get(col, col),
            "importance": round(float(imp), 4),
            "impact": "High" if imp > 0.15 else "Medium" if imp > 0.05 else "Low"
        })
    feature_signals.sort(key=lambda x: x["importance"], reverse=True)
    top_signals = feature_signals[:4]
    
    # Natural language explanation
    factors = []
    if req.meal_type:
        factors.append(f"{req.meal_type} base turnout")
    if req.day_type == "Weekend" or req_dict.get("weekend_flag"):
        factors.append("weekend dip adjustment")
    if req.holiday_event:
        factors.append("holiday travel reduction")
    if req.day_type == "Exam":
        factors.append("exam period surge")
    if req.menu_item and "Biryani" in req.menu_item or "Paneer" in req.menu_item:
        factors.append("high menu popularity index")
        
    factor_str = ", ".join(factors) if factors else "historical 7-day moving baseline"
    explanation = f"Model predicts {adjusted_demand} diners driven by {factor_str}. Added +{safety_buffer} meals ({buf_pct}%) reserve buffer for total recommended preparation of {recommended_prep} portions."
    
    return {
        "predicted_demand": adjusted_demand,
        "recommended_preparation": recommended_prep,
        "safety_buffer": safety_buffer,
        "event_adjustment": event_adjustment,
        "buffer_percent": buf_pct,
        "confidence": "High" if req.expected_attendance and req.expected_attendance > 300 else "Medium",
        "model_type": "RandomForestRegressor Ensemble",
        "model_version": "1.0",
        "feature_importance": top_signals,
        "explanation": explanation,
        "generated_at": datetime.now(timezone.utc).isoformat()
    }

@app.post("/batch_predict", tags=["Forecasting"])
async def batch_predict(req: BatchPredictionRequest):
    """
    Computes forecasts for a list of meal requests in a single batch.
    """
    results = []
    for item in req.items:
        res = await predict(item)
        results.append(res)
    return {"success": True, "count": len(results), "predictions": results}

@app.get("/model/evaluation", tags=["Model Governance"])
async def get_model_evaluation():
    """
    Returns quantitative evaluation benchmarks (MAE, RMSE, MAPE, R²) compared against the baseline model.
    """
    if not evaluation_cache or not os.path.exists(EVAL_FILE):
        train_and_evaluate(force_synthetic=False)
        
    with open(EVAL_FILE, "r") as f:
        data = json.load(f)
    return data

@app.get("/model/metadata", tags=["Model Governance"])
async def get_model_metadata():
    """
    Returns active model metadata, hyperparameters, and feature catalog.
    """
    if not model_metadata or not os.path.exists(METADATA_FILE):
        train_and_evaluate(force_synthetic=False)
        
    with open(METADATA_FILE, "r") as f:
        data = json.load(f)
    return data

@app.post("/model/retrain", tags=["Model Governance"])
async def retrain_model():
    """
    Triggers chronological re-training and re-evaluation pipeline.
    """
    global loaded_model
    results = train_and_evaluate(force_synthetic=False)
    loaded_model = joblib.load(MODEL_FILE)
    return {
        "success": True,
        "message": "Model retrained and benchmarked successfully.",
        "metrics": results["benchmarks"]
    }

if __name__ == "__main__":
    uvicorn.run("inference_service:app", host="0.0.0.0", port=8000, reload=False)

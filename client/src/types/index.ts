export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  hostel_assigned: string;
}

export interface Kpis {
  expected_attendance: number;
  predicted_meals: number;
  food_prepared: number;
  estimated_leftover_kg: number;
}

export interface MealForecast {
  meal: 'Breakfast' | 'Lunch' | 'Dinner';
  predicted: number;
  recommended: number;
  confidence: 'High' | 'Medium' | 'Low';
  menu: string;
  status: string;
  prepared?: number;
  consumed?: number;
}

export interface TrendPoint {
  date: string;
  day?: string;
  all_forecast?: number;
  all_actual?: number;
  breakfast_forecast?: number;
  breakfast_actual?: number;
  lunch_forecast?: number;
  lunch_actual?: number;
  dinner_forecast?: number;
  dinner_actual?: number;
  prepared?: number;
  consumed?: number;
  predicted?: number;
}

export interface WasteSummary {
  prepared_meals: number;
  consumed_meals: number;
  leftover_quantity: number;
  waste_percentage: string | number;
  highest_waste_meal: string;
  waste_trend_7days: Array<{
    date: string;
    percentage: number;
  }>;
}

export interface AlertItem {
  id: string;
  title: string;
  message: string;
  severity: 'Normal' | 'Attention' | 'Critical';
  date: string;
  is_read: number;
  type: string;
}

export interface DashboardData {
  success: boolean;
  data_mode: string;
  kpis: Kpis;
  today_forecast: MealForecast[];
  seven_day_trend: TrendPoint[];
  waste_summary: WasteSummary;
  alerts: AlertItem[];
}

export interface FeatureImportance {
  feature_id?: string;
  feature: string;
  importance: number;
  percentage?: number;
  impact?: 'High' | 'Medium' | 'Low';
}

export interface PredictionResult {
  id?: string;
  date: string;
  meal: string;
  expected_attendance: number;
  menu_item: string;
  day_type: string;
  holiday_event: boolean;
  event_flag?: boolean;
  predicted_demand: number;
  recommended_preparation: number;
  recommended_prep?: number;
  safety_buffer: number;
  event_adjustment?: number;
  buffer_percent?: number;
  confidence: 'High' | 'Medium' | 'Low';
  model_type: string;
  model_version?: string;
  is_mock?: boolean;
  is_fallback?: boolean;
  feature_importance: FeatureImportance[];
  explanation: string;
}

export interface AttendanceRecord {
  id: string;
  date: string;
  meal: string;
  student_id: string;
  student_name: string;
  hostel: string;
  room?: string;
  status: 'Present' | 'Absent';
  source?: string;
  marked_at: string;
}

export interface AttendanceStats {
  total_students: number;
  breakfast_attendance: number;
  lunch_attendance: number;
  dinner_attendance: number;
  breakfast_rate?: number;
  lunch_rate?: number;
  dinner_rate?: number;
}

export interface MealRecord {
  id: string;
  date: string;
  meal: 'Breakfast' | 'Lunch' | 'Dinner';
  menu: string;
  planned_qty: number;
  predicted_qty: number;
  recommended_qty: number;
  prepared_qty: number;
  consumed_qty: number;
  leftover_qty: number;
  status: 'Optimal' | 'Overprepared' | 'Underprepared';
  notes?: string;
}

export interface WasteLog {
  id: string;
  date: string;
  meal: string;
  prepared_qty: number;
  consumed_qty: number;
  leftover_qty: number;
  waste_percentage: number;
  highest_waste_item?: string;
  cause?: string;
  notes?: string;
}

export interface InventoryItem {
  id: string;
  item_name: string;
  category: string;
  current_stock: number;
  unit: string;
  daily_avg_consumption: number;
  reorder_level: number;
  status: 'Healthy' | 'Low Stock' | 'Critical';
  recommended_purchase: number;
  last_updated: string;
}

export interface DayOfWeekDemand {
  day: string;
  full_day?: string;
  avg_demand: number;
}

export interface MenuPopularity {
  menu: string;
  demand_score: number;
  avg_turnout: string;
  total_consumed?: number;
}

export interface ModelMetricSet {
  mae: number;
  rmse: number;
  mape: number;
  r2: number;
}

export interface ModelEvaluation {
  model_name?: string;
  model_version?: string;
  last_trained?: string;
  last_evaluated?: string;
  has_live_evaluation: boolean;
  message: string;
  interim_mae: string;
  interim_r2: string;
  interim_mape?: string;
  sample_records_count: number;
  data_mode?: string;
  dataset_notice?: string;
  benchmarks?: {
    random_forest: ModelMetricSet;
    baseline_moving_average: ModelMetricSet;
    improvement_over_baseline?: {
      mae_reduction_meals: number;
      mae_improvement_pct: number;
      mape_improvement_pct: number;
      r2_gain: number;
    };
  };
  feature_importance?: FeatureImportance[];
  error_distribution?: Array<{ range: string; count: number }>;
  actual_vs_predicted?: Array<{
    date: string;
    meal: string;
    actual: number;
    predicted: number;
    baseline: number;
    residual: number;
  }>;
  split?: {
    strategy: string;
    train_samples: number;
    val_samples: number;
    test_samples: number;
    total_samples: number;
  };
  status?: {
    model_status: string;
    evaluation_method: string;
    total_records: number;
    features_count: number;
  };
}

export interface HistoryRecord {
  date: string;
  meal: string;
  menu: string;
  predicted: number;
  actual: number;
  variance: number;
  prepared: number;
  leftover: number;
  status: 'Optimal' | 'Overprepared' | 'Underprepared';
}

export interface IngestionSummary {
  total_rows: number;
  valid_rows: number;
  invalid_rows: number;
  duplicates_filtered: number;
  inserted_records: number;
  success_rate: number;
  ingested_at: string;
}

export interface DataQualityReport {
  status: 'GOOD' | 'WARNING' | 'CRITICAL';
  status_message: string;
  data_mode: string;
  metrics: {
    total_attendance_records: number;
    records_today: number;
    missing_values_count: number;
    duplicates_intercepted: number;
    invalid_records_caught: number;
    latest_ingestion_time: string;
    data_freshness: string;
    attendance_coverage_percent: number;
    registered_hostel_students: number;
  };
  quality_checks: Array<{
    name: string;
    status: 'Passed' | 'Warning' | 'Failed';
    detail: string;
  }>;
}

export interface SystemHealthReport {
  timestamp: string;
  system: {
    frontend: { status: string; version: string; framework: string };
    backend_api: { status: string; version: string; runtime: string; port: number };
    database: { status: string; engine: string; tables: Record<string, number> };
    ml_service: { status: string; model_loaded: boolean; model_version: string; service: string; endpoint: string };
    data_pipeline: { status: string; freshness: string; coverage: string; last_ingestion: string };
  };
}

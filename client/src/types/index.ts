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
  day: string;
  all_forecast: number;
  all_actual: number;
  breakfast_forecast?: number;
  breakfast_actual?: number;
  lunch_forecast?: number;
  lunch_actual?: number;
  dinner_forecast?: number;
  dinner_actual?: number;
}

export interface WasteSummary {
  prepared_meals: number;
  consumed_meals: number;
  leftover_quantity: number;
  waste_percentage: number;
  highest_waste_meal: string;
  waste_trend_7days: Array<{
    date: string;
    meal: string;
    leftover: number;
    waste_percentage: number;
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

export interface AiInsight {
  id: string;
  type: 'pattern' | 'alert' | 'sustainability';
  title: string;
  insight: string;
  recommendation: string;
}

export interface DashboardData {
  data_mode: string;
  kpis: Kpis;
  today_forecast: MealForecast[];
  seven_day_trend: TrendPoint[];
  waste_summary: WasteSummary;
  alerts: AlertItem[];
  ai_insights: AiInsight[];
}

export interface FeatureImportance {
  feature: string;
  importance: number;
  impact?: string;
}

export interface PredictionResult {
  id?: string;
  date: string;
  meal: string;
  expected_attendance: number;
  menu_item: string;
  day_type: string;
  holiday_event: boolean;
  predicted_demand: number;
  recommended_preparation: number;
  recommended_prep?: number;
  safety_buffer: number;
  buffer_percent?: number;
  confidence: 'High' | 'Medium' | 'Low';
  model_type: string;
  is_mock?: boolean;
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
  status: 'Present' | 'Absent';
  marked_at: string;
}

export interface AttendanceStats {
  total_students: number;
  breakfast_attendance: number;
  lunch_attendance: number;
  dinner_attendance: number;
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
  avg_demand: number;
}

export interface MenuPopularity {
  menu: string;
  demand_score: number;
  avg_turnout: string;
}

export interface ModelEvaluation {
  has_live_evaluation: boolean;
  message: string;
  interim_mae: string;
  interim_r2: string;
  sample_records_count: number;
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

import {
  DashboardData,
  PredictionResult,
  AttendanceRecord,
  AttendanceStats,
  MealRecord,
  WasteLog,
  InventoryItem,
  DayOfWeekDemand,
  MenuPopularity,
  ModelEvaluation,
  HistoryRecord,
  User
} from '../types';

const BASE_URL = '/api';

export const api = {
  // Auth
  async login(email: string, password?: string): Promise<{ success: boolean; user?: User; error?: string }> {
    const res = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    return res.json();
  },

  async register(name: string, email: string, password?: string): Promise<{ success: boolean; error?: string }> {
    const res = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password })
    });
    return res.json();
  },

  // Global Search
  async search(query: string): Promise<{
    students: Array<{ id: string; student_id: string; name: string; hostel: string }>;
    meals: Array<{ id: string; date: string; meal: string; menu: string; prepared_qty: number; consumed_qty: number; status: string }>;
    inventory: Array<{ id: string; item_name: string; category: string; current_stock: number; unit: string; status: string }>;
    predictions: Array<{ id: string; date: string; meal: string; menu_item: string; predicted_demand: number; recommended_prep: number; confidence: string }>;
  }> {
    if (!query.trim()) return { students: [], meals: [], inventory: [], predictions: [] };
    const res = await fetch(`${BASE_URL}/search?q=${encodeURIComponent(query)}`);
    const data = await res.json();
    return data.results || { students: [], meals: [], inventory: [], predictions: [] };
  },

  // Dashboard
  async getDashboard(): Promise<DashboardData> {
    const res = await fetch(`${BASE_URL}/dashboard`);
    if (!res.ok) throw new Error('Failed to load dashboard data');
    return res.json();
  },

  // Predictions
  async getRecentPredictions(): Promise<PredictionResult[]> {
    const res = await fetch(`${BASE_URL}/predictions`);
    const data = await res.json();
    return data.predictions || [];
  },

  async generatePrediction(params: {
    date: string;
    meal: string;
    expected_attendance: number;
    menu_item: string;
    day_type: string;
    holiday_event: boolean;
    buffer_percent: number;
  }): Promise<PredictionResult> {
    const res = await fetch(`${BASE_URL}/predictions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params)
    });
    if (!res.ok) throw new Error('Prediction service error');
    const data = await res.json();
    return data.prediction;
  },

  // Attendance
  async getAttendance(params?: { date?: string; meal?: string; hostel?: string; search?: string }): Promise<{
    stats: AttendanceStats;
    records: AttendanceRecord[];
  }> {
    const query = new URLSearchParams(params as Record<string, string>).toString();
    const res = await fetch(`${BASE_URL}/attendance?${query}`);
    const data = await res.json();
    return { stats: data.stats, records: data.records };
  },

  async markAttendance(record: Partial<AttendanceRecord>): Promise<{ success: boolean; id: string }> {
    const res = await fetch(`${BASE_URL}/attendance`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(record)
    });
    return res.json();
  },

  // Meals
  async getMeals(date?: string): Promise<MealRecord[]> {
    const url = date ? `${BASE_URL}/meals?date=${date}` : `${BASE_URL}/meals`;
    const res = await fetch(url);
    const data = await res.json();
    return data.meals || [];
  },

  async createMeal(mealData: Partial<MealRecord>): Promise<{ success: boolean; id: string; status: string }> {
    const res = await fetch(`${BASE_URL}/meals`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(mealData)
    });
    return res.json();
  },

  async getWaste(): Promise<{
    metrics: { total_leftover_kg: number; avg_waste_pct: number; highest_waste_meal: string; saved_meals_estimate: number };
    waste_by_meal: Array<{ meal: string; leftover: number; prepared: number; rate: number }>;
    highest_waste_items: Array<{ item: string; kg_wasted: number; frequency: string }>;
    logs: WasteLog[];
  }> {
    const res = await fetch(`${BASE_URL}/waste`);
    const data = await res.json();
    return {
      metrics: {
        total_leftover_kg: data.overview?.total_leftover || 0,
        avg_waste_pct: data.overview?.avg_waste_pct || 0,
        highest_waste_meal: 'Lunch — Friday', // Mapped from somewhere or default
        saved_meals_estimate: 840
      },
      waste_by_meal: data.meal_breakdown || [],
      highest_waste_items: data.top_waste_items || [],
      logs: data.recent_logs || []
    };
  },

  async logWaste(data: Partial<WasteLog>): Promise<{ success: boolean; id: string; waste_percentage: number }> {
    const res = await fetch(`${BASE_URL}/waste`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  },

  // Inventory
  async getInventory(): Promise<InventoryItem[]> {
    const res = await fetch(`${BASE_URL}/inventory`);
    const data = await res.json();
    return data.inventory || [];
  },

  async updateInventory(id: string, current_stock: number, recommended_purchase?: number): Promise<{ success: boolean; status: string }> {
    const res = await fetch(`${BASE_URL}/inventory`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, current_stock, recommended_purchase })
    });
    return res.json();
  },

  // Analytics
  async getAnalytics(): Promise<{
    day_of_week_demand: DayOfWeekDemand[];
    menu_popularity: MenuPopularity[];
    model_evaluation: ModelEvaluation;
  }> {
    const res = await fetch(`${BASE_URL}/analytics`);
    return res.json();
  },

  // AI Insights
  async getAiInsights(): Promise<{
    insights: {
      demand_forecast_summary: string;
      pattern_detection: Array<{ pattern: string; observation: string; action: string }>;
      recommendations: Array<{ priority: string; target: string; recommendation: string }>;
      alerts: Array<{ severity: string; message: string }>;
      model_signals: Array<{ feature: string; influence: string; percentage: number }>;
    };
  }> {
    const res = await fetch(`${BASE_URL}/ai-insights`);
    return res.json();
  },

  // History
  async getHistory(page = 1, limit = 15): Promise<{
    page: number;
    limit: number;
    total_pages: number;
    total_count: number;
    history: HistoryRecord[];
  }> {
    const res = await fetch(`${BASE_URL}/history?page=${page}&limit=${limit}`);
    return res.json();
  },

  // Settings
  async getSettings(): Promise<Record<string, string>> {
    const res = await fetch(`${BASE_URL}/settings`);
    const data = await res.json();
    return data.settings || {};
  },

  async saveSettings(settings: Record<string, string>): Promise<{ success: boolean; message: string }> {
    const res = await fetch(`${BASE_URL}/settings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ settings })
    });
    return res.json();
  },

  // Seed / Reset Demo Data
  async reloadDemoData(): Promise<{ success: boolean; message: string }> {
    const res = await fetch(`${BASE_URL}/seed`, { method: 'POST' });
    return res.json();
  }
};

import React, { useState } from 'react';
import {
  FileCode2,
  ExternalLink,
  Code2,
  CheckCircle,
  Copy,
  Send,
  Layers,
  Sparkles,
  Server
} from 'lucide-react';

interface EndpointSpec {
  method: 'GET' | 'POST';
  path: string;
  summary: string;
  category: string;
  description: string;
  requestBody?: Record<string, any>;
  responseExample: Record<string, any>;
}

const ENDPOINTS: EndpointSpec[] = [
  {
    method: 'POST',
    path: '/api/forecast/predict',
    summary: 'Predict Single Meal Demand & Headroom',
    category: 'Forecasting',
    description: 'Invokes the Python Random Forest model (or resilient fallback) with day-of-week, rolling history, and calendar modifiers.',
    requestBody: {
      date: '2026-09-04',
      meal: 'Lunch',
      expected_attendance: 1045,
      menu_item: 'Paneer Butter Masala & Dal Makhani',
      day_type: 'Regular',
      holiday_event: false,
      event_flag: false,
      buffer_percent: 3.5
    },
    responseExample: {
      success: true,
      prediction: {
        id: 'pred_1728200000',
        predicted_demand: 918,
        recommended_preparation: 951,
        safety_buffer: 33,
        event_adjustment: 0,
        buffer_percent: 3.5,
        confidence: 'High',
        model_type: 'RandomForestRegressor Ensemble',
        feature_importance: [
          { feature: 'Meal Slot Baseline', importance: 0.38, impact: 'High' },
          { feature: '7-Day Moving Avg Turnout', importance: 0.26, impact: 'High' }
        ],
        explanation: 'Model predicts 918 diners driven by Lunch base turnout. Added +33 meals (3.5%) reserve buffer.'
      }
    }
  },
  {
    method: 'POST',
    path: '/api/forecast/batch',
    summary: 'Batch Multi-Meal Forecasting',
    category: 'Forecasting',
    description: 'Computes forecasts for an array of scheduled meal sessions in a single API call.',
    requestBody: {
      items: [
        { date: '2026-09-05', meal: 'Breakfast', expected_attendance: 980 },
        { date: '2026-09-05', meal: 'Lunch', expected_attendance: 1045 },
        { date: '2026-09-05', meal: 'Dinner', expected_attendance: 1110 }
      ]
    },
    responseExample: {
      success: true,
      count: 3,
      predictions: [
        { predicted_demand: 780, recommended_preparation: 808, safety_buffer: 28 },
        { predicted_demand: 890, recommended_preparation: 922, safety_buffer: 32 },
        { predicted_demand: 960, recommended_preparation: 994, safety_buffer: 34 }
      ]
    }
  },
  {
    method: 'GET',
    path: '/api/model/evaluation',
    summary: 'Model Evaluation Benchmarks (MAE, RMSE, MAPE, R²)',
    category: 'Model Governance',
    description: 'Returns quantitative evaluation benchmarks comparing the Random Forest model against a 7-day moving average baseline on time-aware validation splits.',
    responseExample: {
      model_name: 'Random Forest Regressor',
      benchmarks: {
        random_forest: { mae: 16.8, rmse: 21.55, mape: 1.56, r2: 0.919 },
        baseline_moving_average: { mae: 63.88, rmse: 80.45, mape: 5.81, r2: -0.128 },
        improvement_over_baseline: {
          mae_reduction_meals: 47.08,
          mae_improvement_pct: 73.7,
          mape_improvement_pct: 4.25,
          r2_gain: 1.047
        }
      }
    }
  },
  {
    method: 'GET',
    path: '/api/attendance',
    summary: 'Query Attendance Swipes with Filters & Search',
    category: 'Attendance Pipeline',
    description: 'Retrieves attendance roster filtered by date, meal slot, hostel block, source, and search keyword with pagination.',
    responseExample: {
      success: true,
      stats: { total_students: 1215, breakfast_attendance: 980, lunch_attendance: 1045, dinner_attendance: 1110 },
      records: [
        { id: 'att_1', student_id: 'STU-2024-001', student_name: 'Aarav Sharma', hostel: 'Aryabhata North', meal: 'Lunch', status: 'Present', marked_at: '2026-09-04 12:45:10' }
      ]
    }
  },
  {
    method: 'POST',
    path: '/api/attendance/bulk',
    summary: 'Bulk Turnstile CSV Ingestion & Deduplication Pipeline',
    category: 'Attendance Pipeline',
    description: 'Ingests CSV formatted attendance logs, validates schema constraints, eliminates duplicates, and provides detailed error breakdowns.',
    requestBody: {
      csv_data: "student_id,date,meal,status\nSTU-2024-001,2026-09-04,Lunch,Present\nSTU-2024-002,2026-09-04,Lunch,Present",
      source: "turnstile_biometric",
      filename: "turnstile_gate_1.csv"
    },
    responseExample: {
      success: true,
      summary: {
        total_rows: 2,
        valid_rows: 2,
        invalid_rows: 0,
        duplicates_filtered: 0,
        inserted_records: 2,
        success_rate: 100
      },
      errors: []
    }
  },
  {
    method: 'GET',
    path: '/api/data-quality',
    summary: 'Attendance Data Quality Scorecard',
    category: 'Data Engineering',
    description: 'Computes real-time data freshness, missing value detection, coverage percentages, and deduplication audit logs.',
    responseExample: {
      status: 'GOOD',
      status_message: 'Attendance pipeline operating nominally with high integrity',
      metrics: {
        total_attendance_records: 180,
        records_today: 90,
        missing_values_count: 0,
        duplicates_intercepted: 0,
        attendance_coverage_percent: 94
      }
    }
  },
  {
    method: 'GET',
    path: '/api/system/health',
    summary: 'Full Stack Service Health & Telemetry',
    category: 'System',
    description: 'Inspects connectivity and operational statuses across Frontend, Node REST Gateway, SQLite Database, and Python ML Inference Service.',
    responseExample: {
      system: {
        frontend: { status: 'Operational', framework: 'React + Vite' },
        backend_api: { status: 'Operational', runtime: 'Node.js Express' },
        database: { status: 'Connected', engine: 'SQLite3 (WAL Mode)' },
        ml_service: { status: 'Operational', model_loaded: true }
      }
    }
  }
];

export const ApiDocsPage: React.FC = () => {
  const [selectedEndpoint, setSelectedEndpoint] = useState<EndpointSpec>(ENDPOINTS[0]);
  const [testResponse, setTestResponse] = useState<any>(null);
  const [testing, setTesting] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleTestCall = async () => {
    setTesting(true);
    try {
      if (selectedEndpoint.method === 'GET') {
        const res = await fetch(selectedEndpoint.path);
        const data = await res.json();
        setTestResponse(data);
      } else {
        const res = await fetch(selectedEndpoint.path, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(selectedEndpoint.requestBody)
        });
        const data = await res.json();
        setTestResponse(data);
      }
    } catch (err: any) {
      setTestResponse({ error: err.message });
    } finally {
      setTesting(false);
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-xl lg:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <FileCode2 className="w-6 h-6 text-indigo-600" /> REST API Specification & OpenAPI Explorer
            </h2>
            <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-indigo-100 text-indigo-700 border border-indigo-200">
              OPENAPI 3.0
            </span>
          </div>
          <p className="text-xs text-slate-500">
            Formal REST API contracts connecting React Frontend, Node.js Backend Gateway, and Python ML Inference Service.
          </p>
        </div>

        <a
          href="/docs/api"
          target="_blank"
          rel="noopener noreferrer"
          className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold flex items-center gap-2 transition-colors cursor-pointer shadow-sm self-start sm:self-auto"
        >
          <ExternalLink className="w-3.5 h-3.5" />
          <span>Open Full Swagger UI (/docs/api)</span>
        </a>
      </div>

      {/* Main Grid: Endpoints list on Left, Schema Explorer on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left column: Endpoints Catalog */}
        <div className="lg:col-span-5 p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
            Available Service Endpoints
          </h3>

          <div className="space-y-2">
            {ENDPOINTS.map((ep) => {
              const isSelected = selectedEndpoint.path === ep.path && selectedEndpoint.method === ep.method;
              return (
                <button
                  key={`${ep.method}-${ep.path}`}
                  onClick={() => {
                    setSelectedEndpoint(ep);
                    setTestResponse(null);
                  }}
                  className={`w-full text-left p-3 rounded-xl border transition-all cursor-pointer flex items-start gap-2.5 ${
                    isSelected
                      ? 'bg-indigo-50/70 border-indigo-300 text-indigo-950 shadow-sm'
                      : 'bg-slate-50/70 border-slate-200 hover:bg-slate-100/70 text-slate-700'
                  }`}
                >
                  <span
                    className={`text-[10px] font-bold font-mono px-2 py-0.5 rounded ${
                      ep.method === 'POST' ? 'bg-blue-600 text-white' : 'bg-emerald-600 text-white'
                    }`}
                  >
                    {ep.method}
                  </span>
                  <div className="truncate flex-1">
                    <p className="text-xs font-bold font-mono truncate">{ep.path}</p>
                    <p className="text-[11px] text-slate-500 truncate">{ep.summary}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right column: Interactive Inspector & Live Try-It-Out */}
        <div className="lg:col-span-7 p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-5">
          <div className="flex items-start justify-between border-b border-slate-100 pb-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span
                  className={`text-[11px] font-bold font-mono px-2.5 py-0.5 rounded ${
                    selectedEndpoint.method === 'POST' ? 'bg-blue-600 text-white' : 'bg-emerald-600 text-white'
                  }`}
                >
                  {selectedEndpoint.method}
                </span>
                <span className="text-sm font-bold font-mono text-slate-900">{selectedEndpoint.path}</span>
              </div>
              <p className="text-xs text-slate-500">{selectedEndpoint.description}</p>
            </div>

            <button
              onClick={handleTestCall}
              disabled={testing}
              className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow"
            >
              <Send className={`w-3.5 h-3.5 ${testing ? 'animate-spin' : ''}`} />
              <span>{testing ? 'Executing...' : 'Try It Out'}</span>
            </button>
          </div>

          {/* Request Payload Schema (if POST) */}
          {selectedEndpoint.requestBody && (
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs text-slate-600">
                <span className="font-bold flex items-center gap-1.5">
                  <Code2 className="w-3.5 h-3.5 text-indigo-600" /> Request Payload (JSON Schema)
                </span>
                <button
                  onClick={() => handleCopy(JSON.stringify(selectedEndpoint.requestBody, null, 2))}
                  className="text-[11px] text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer"
                >
                  <Copy className="w-3 h-3" /> Copy JSON
                </button>
              </div>
              <pre className="p-3.5 rounded-xl bg-slate-900 text-slate-200 text-xs font-mono overflow-x-auto border border-slate-800">
                {JSON.stringify(selectedEndpoint.requestBody, null, 2)}
              </pre>
            </div>
          )}

          {/* Live / Example Response Payload */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs text-slate-600">
              <span className="font-bold flex items-center gap-1.5">
                <Server className="w-3.5 h-3.5 text-emerald-600" />
                {testResponse ? 'Live Response Output (200 OK)' : 'Documented Response Specification'}
              </span>
              <span className="text-[10px] font-mono text-slate-500">application/json</span>
            </div>
            <pre className="p-3.5 rounded-xl bg-slate-900 text-emerald-300 text-xs font-mono overflow-x-auto border border-slate-800 max-h-72">
              {JSON.stringify(testResponse || selectedEndpoint.responseExample, null, 2)}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};

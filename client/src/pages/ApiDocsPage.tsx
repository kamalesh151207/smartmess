import React, { useState } from 'react';
import {
  FileCode2,
  ExternalLink,
  Code2,
  CheckCircle,
  Copy,
  Send,
  Workflow,
  Server,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';

interface EndpointSpec {
  section: string;
  method: 'GET' | 'POST';
  path: string;
  purpose: string;
  description: string;
  successStatus: string;
  errorStatus: string;
  requestBody?: Record<string, any>;
  responseExample: Record<string, any>;
}

const ENDPOINTS: EndpointSpec[] = [
  // A. SYSTEM
  {
    section: 'A. SYSTEM',
    method: 'GET',
    path: '/api/system/health',
    purpose: 'Full Stack Telemetry & Operational Health',
    description: 'Inspects connectivity and operational status across Frontend, Node REST Gateway, SQLite Database, and Python ML Inference Service.',
    successStatus: '200 OK',
    errorStatus: '500 Internal Server Error',
    responseExample: {
      success: true,
      system: {
        frontend: { status: 'Operational', framework: 'React + Vite' },
        backend_api: { status: 'Operational', runtime: 'Node.js Express' },
        database: { status: 'Connected', engine: 'SQLite3 (WAL Mode)' },
        ml_service: { status: 'Operational', model_loaded: true }
      }
    }
  },
  // B. ATTENDANCE
  {
    section: 'B. ATTENDANCE',
    method: 'POST',
    path: '/api/attendance',
    purpose: 'Single Biometric Swipe Recording',
    description: 'Records individual student attendance swipe. Enforces unique index constraint on (student_id, date, meal).',
    successStatus: '200 OK',
    errorStatus: '409 Conflict (DUPLICATE_ATTENDANCE) / 400 Bad Request',
    requestBody: {
      date: '2026-09-04',
      meal: 'Lunch',
      student_id: 'STU-2024-001',
      student_name: 'Aarav Sharma',
      hostel: 'Aryabhata North',
      status: 'Present',
      source: 'manual'
    },
    responseExample: {
      success: true,
      record: {
        id: 'att_101',
        student_id: 'STU-2024-001',
        date: '2026-09-04',
        meal: 'Lunch',
        status: 'Present'
      }
    }
  },
  {
    section: 'B. ATTENDANCE',
    method: 'POST',
    path: '/api/attendance/bulk',
    purpose: 'Bulk Turnstile CSV Ingestion & Deduplication',
    description: 'Ingests raw turnstile CSV logs, validates schema constraints, normalizes timestamps, and eliminates duplicate swipes.',
    successStatus: '200 OK',
    errorStatus: '400 Invalid CSV Format / 500 Server Error',
    requestBody: {
      csv_data: "student_id,student_name,hostel,room,date,meal,status\nSTU-001,Student One,Aryabhata,A-101,2026-09-04,Dinner,Present",
      source: "turnstile_biometric",
      filename: "gate_3_turnstile.csv"
    },
    responseExample: {
      success: true,
      summary: {
        total_rows: 1,
        valid_rows: 1,
        duplicates_filtered: 0,
        inserted_records: 1,
        success_rate: 100
      },
      errors: []
    }
  },
  // C. FORECAST
  {
    section: 'C. FORECAST',
    method: 'POST',
    path: '/api/forecast/predict',
    purpose: 'Predict Single Meal Demand & Headroom',
    description: 'Invokes Python Random Forest inference service (or Node.js fallback) with day-of-week, rolling history, and calendar modifiers.',
    successStatus: '200 OK',
    errorStatus: '400 Invalid Inputs / 500 Inference Failure',
    requestBody: {
      date: '2026-09-04',
      meal: 'Lunch',
      expected_attendance: 1045,
      menu_item: 'Paneer Butter Masala & Dal Makhani',
      day_type: 'Regular',
      holiday_event: false,
      buffer_percent: 3.5
    },
    responseExample: {
      success: true,
      prediction: {
        predicted_demand: 918,
        recommended_preparation: 951,
        safety_buffer: 33,
        event_adjustment: 0,
        buffer_percent: 3.5,
        confidence: 'High',
        model_type: 'RandomForestRegressor Ensemble'
      }
    }
  },
  // D. MODEL
  {
    section: 'D. MODEL',
    method: 'GET',
    path: '/api/model/evaluation',
    purpose: 'Model Evaluation Benchmarks (MAE, RMSE, MAPE, R²)',
    description: 'Returns quantitative evaluation benchmarks comparing Random Forest against 7-day moving average baseline on chronological holdout split.',
    successStatus: '200 OK',
    errorStatus: '500 Benchmark Artifact Missing',
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
  // E. DATA QUALITY
  {
    section: 'E. DATA QUALITY',
    method: 'GET',
    path: '/api/data-quality',
    purpose: 'Attendance Data Quality Scorecard',
    description: 'Computes data freshness, missing value detection, coverage percentages, and deduplication audit metrics.',
    successStatus: '200 OK',
    errorStatus: '500 Scorecard Calculation Error',
    responseExample: {
      status: 'GOOD',
      status_message: 'Attendance pipeline operating nominally with high integrity',
      metrics: {
        total_attendance_records: 270,
        records_today: 90,
        missing_values_count: 0,
        duplicates_intercepted: 0,
        attendance_coverage_percent: 94
      }
    }
  },
  // F. PYTHON ML SERVICE
  {
    section: 'F. PYTHON ML SERVICE',
    method: 'GET',
    path: '/health (Python FastAPI: Port 8000)',
    purpose: 'Python Inference Microservice Health',
    description: 'Health probe verifying Python FastAPI service status, loaded model artifact, and scikit-learn environment.',
    successStatus: '200 OK',
    errorStatus: '503 Service Unavailable',
    responseExample: {
      status: 'healthy',
      service: 'SmartMess ML Inference Service',
      model_loaded: true,
      model_version: 'v1.0-production'
    }
  },
  {
    section: 'F. PYTHON ML SERVICE',
    method: 'POST',
    path: '/predict (Python FastAPI: Port 8000)',
    purpose: 'Direct Random Forest Inference Engine',
    description: 'Transforms payload into 13-feature numerical vector and executes Random Forest decision tree ensemble regression.',
    successStatus: '200 OK',
    errorStatus: '422 Unprocessable Entity / 500 Model Error',
    requestBody: {
      meal_type: 'Lunch',
      day_of_week: 'Friday',
      expected_attendance: 1045,
      buffer_percent: 3.5
    },
    responseExample: {
      predicted_demand: 918,
      recommended_preparation: 951,
      safety_buffer: 33,
      confidence: 'High',
      model_type: 'RandomForestRegressor Ensemble'
    }
  },
  {
    section: 'F. PYTHON ML SERVICE',
    method: 'POST',
    path: '/evaluate (Python FastAPI: Port 8000)',
    purpose: 'Execute Retraining & Benchmark Pipeline',
    description: 'Triggers dataset reloading, time-aware chronological split, Random Forest fit, baseline comparison, and metric JSON updates.',
    successStatus: '200 OK',
    errorStatus: '500 Retraining Failure',
    responseExample: {
      success: true,
      message: 'Model evaluation completed successfully',
      evaluated_at: '2026-10-06T21:40:00Z'
    }
  }
];

export const ApiDocsPage: React.FC = () => {
  const [selectedEndpoint, setSelectedEndpoint] = useState<EndpointSpec>(ENDPOINTS[0]);
  const [testResponse, setTestResponse] = useState<any>(null);
  const [testing, setTesting] = useState(false);

  const handleTestCall = async () => {
    setTesting(true);
    try {
      if (selectedEndpoint.path.includes('Port 8000')) {
        setTestResponse({
          notice: "Python FastAPI service endpoint (Port 8000). When offline, Node.js Gateway seamlessly routes requests to embedded fallback engine.",
          documented_response: selectedEndpoint.responseExample
        });
        return;
      }

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
  };

  // Group endpoints by section
  const sections = Array.from(new Set(ENDPOINTS.map(ep => ep.section)));

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

      {/* Demonstrable Architecture Flow (Section 6) */}
      <div className="p-6 rounded-2xl bg-gradient-to-br from-slate-900 to-indigo-950 text-white shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h3 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
            <Workflow className="w-4 h-4 text-indigo-400" /> End-to-End ML Architecture & High-Availability Resiliency Topology
          </h3>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-900 text-indigo-300 border border-indigo-700">
            Microservice Topology
          </span>
        </div>

        {/* Primary Data Flow Path */}
        <div className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700 font-mono text-xs text-slate-200 space-y-2">
          <span className="text-emerald-400 font-bold block uppercase text-[10px]">PRIMARY ML EXECUTION PATH:</span>
          <div className="flex flex-wrap items-center gap-2 text-[11px]">
            <span className="px-2 py-1 rounded bg-slate-900 text-indigo-300">React Frontend</span>
            <span>→</span>
            <span className="px-2 py-1 rounded bg-slate-900 text-blue-300">Node/Express REST API</span>
            <span>→</span>
            <span className="px-2 py-1 rounded bg-slate-900 text-emerald-300">Python FastAPI ML Service</span>
            <span>→</span>
            <span className="px-2 py-1 rounded bg-slate-900 text-amber-300">Feature Matrix (13 Features)</span>
            <span>→</span>
            <span className="px-2 py-1 rounded bg-slate-900 text-purple-300">Random Forest Regressor</span>
            <span>→</span>
            <span className="px-2 py-1 rounded bg-slate-900 text-cyan-300">Safety Buffer (+3.5%)</span>
            <span>→</span>
            <span className="px-2 py-1 rounded bg-emerald-900 text-emerald-200 font-bold">Recommended Preparation</span>
          </div>
        </div>

        {/* Resilience / Fallback Mechanism */}
        <div className="p-3 rounded-xl bg-amber-950/60 border border-amber-800/80 text-amber-200 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-amber-400 flex-shrink-0" />
            <span>
              <strong>Resilience / Fallback Mechanism:</strong> If Python ML Service is offline, Node.js Gateway seamlessly routes requests to the embedded Node.js fallback forecasting engine so production API calls never break.
            </span>
          </div>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-900 text-amber-300 border border-amber-700 font-bold">
            HIGH AVAILABILITY
          </span>
        </div>
      </div>

      {/* Organized Endpoints Catalog (Section 7: A through F) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Categorized Endpoints Catalog */}
        <div className="lg:col-span-5 p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 border-b border-slate-100 pb-2">
            Organized Service API Catalog (Sections A - F)
          </h3>

          <div className="space-y-4 max-h-[600px] overflow-y-auto pr-1">
            {sections.map(sec => (
              <div key={sec} className="space-y-1.5">
                <span className="text-[11px] font-bold font-mono text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200 block">
                  {sec}
                </span>
                <div className="space-y-1 pl-1">
                  {ENDPOINTS.filter(ep => ep.section === sec).map(ep => {
                    const isSelected = selectedEndpoint.path === ep.path && selectedEndpoint.method === ep.method;
                    return (
                      <button
                        key={`${ep.method}-${ep.path}`}
                        onClick={() => {
                          setSelectedEndpoint(ep);
                          setTestResponse(null);
                        }}
                        className={`w-full text-left p-2.5 rounded-xl border transition-all cursor-pointer flex items-start gap-2 ${
                          isSelected
                            ? 'bg-indigo-50/70 border-indigo-300 text-indigo-950 shadow-sm font-semibold'
                            : 'bg-slate-50/70 border-slate-200 hover:bg-slate-100/70 text-slate-700'
                        }`}
                      >
                        <span
                          className={`text-[9px] font-bold font-mono px-1.5 py-0.5 rounded ${
                            ep.method === 'POST' ? 'bg-blue-600 text-white' : 'bg-emerald-600 text-white'
                          }`}
                        >
                          {ep.method}
                        </span>
                        <div className="truncate flex-1">
                          <p className="text-xs font-mono truncate">{ep.path}</p>
                          <p className="text-[10px] text-slate-500 truncate">{ep.purpose}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Endpoint Specification Inspector */}
        <div className="lg:col-span-7 p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-start justify-between border-b border-slate-100 pb-3">
            <div>
              <span className="text-[10px] font-mono text-indigo-600 font-bold uppercase block mb-0.5">{selectedEndpoint.section}</span>
              <div className="flex items-center gap-2 mb-1">
                <span
                  className={`text-[10px] font-bold font-mono px-2 py-0.5 rounded ${
                    selectedEndpoint.method === 'POST' ? 'bg-blue-600 text-white' : 'bg-emerald-600 text-white'
                  }`}
                >
                  {selectedEndpoint.method}
                </span>
                <span className="text-xs font-bold font-mono text-slate-900">{selectedEndpoint.path}</span>
              </div>
              <p className="text-xs font-semibold text-slate-800">{selectedEndpoint.purpose}</p>
              <p className="text-[11px] text-slate-500 mt-0.5">{selectedEndpoint.description}</p>
            </div>

            <button
              onClick={handleTestCall}
              disabled={testing}
              className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow"
            >
              <Send className={`w-3.5 h-3.5 ${testing ? 'animate-spin' : ''}`} />
              <span>{testing ? 'Executing...' : 'Try Endpoint'}</span>
            </button>
          </div>

          {/* Status Codes Specification */}
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200">
              <span className="text-[10px] font-bold uppercase text-emerald-800 block">SUCCESS STATUS</span>
              <span className="font-mono font-bold text-emerald-700">{selectedEndpoint.successStatus}</span>
            </div>
            <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200">
              <span className="text-[10px] font-bold uppercase text-amber-800 block">ERROR / CONFLICT STATUS</span>
              <span className="font-mono font-bold text-amber-700">{selectedEndpoint.errorStatus}</span>
            </div>
          </div>

          {/* Request Payload Schema (if POST) */}
          {selectedEndpoint.requestBody && (
            <div className="space-y-1 text-xs">
              <div className="flex items-center justify-between text-slate-700 font-bold">
                <span className="flex items-center gap-1">
                  <Code2 className="w-3.5 h-3.5 text-indigo-600" /> REQUEST PAYLOAD SCHEMA
                </span>
                <button
                  onClick={() => handleCopy(JSON.stringify(selectedEndpoint.requestBody, null, 2))}
                  className="text-[10px] text-indigo-600 hover:text-indigo-800 font-mono"
                >
                  Copy JSON
                </button>
              </div>
              <pre className="p-3 rounded-xl bg-slate-900 text-slate-200 text-xs font-mono overflow-x-auto border border-slate-800">
                {JSON.stringify(selectedEndpoint.requestBody, null, 2)}
              </pre>
            </div>
          )}

          {/* Documented / Live Response Output */}
          <div className="space-y-1 text-xs">
            <div className="flex items-center justify-between text-slate-700 font-bold">
              <span className="flex items-center gap-1">
                <Server className="w-3.5 h-3.5 text-emerald-600" /> RESPONSE SPECIFICATION ({selectedEndpoint.successStatus})
              </span>
              <span className="text-[10px] font-mono text-slate-500">application/json</span>
            </div>
            <pre className="p-3 rounded-xl bg-slate-900 text-emerald-300 text-xs font-mono overflow-x-auto border border-slate-800 max-h-64">
              {JSON.stringify(testResponse || selectedEndpoint.responseExample, null, 2)}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};

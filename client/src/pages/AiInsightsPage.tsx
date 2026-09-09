import React, { useState, useEffect } from 'react';
import {
  Brain,
  Sparkles,
  TrendingUp,
  AlertTriangle,
  Lightbulb,
  Cpu,
  Layers,
  CheckCircle2,
  Sliders,
  ShieldCheck,
  ArrowRight
} from 'lucide-react';
import { api } from '../services/api';

export const AiInsightsPage: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadInsights();
  }, []);

  const loadInsights = async () => {
    setLoading(true);
    try {
      const res = await api.getAiInsights();
      setData(res.insights);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !data) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-40 rounded-2xl bg-slate-900/60 border border-slate-800" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="h-64 rounded-2xl bg-slate-900/60 border border-slate-800" />
          <div className="h-64 rounded-2xl bg-slate-900/60 border border-slate-800" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-xl lg:text-2xl font-bold text-slate-50 tracking-tight flex items-center gap-2">
              <Brain className="w-6 h-6 text-indigo-500" /> AI Intelligence & Predictive Signals
            </h2>
            <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-indigo-100 text-indigo-600 border border-indigo-300">
              DEMO DATA
            </span>
          </div>
          <p className="text-xs text-slate-400">
            Automated heuristic pattern detection, feature attribution weights, and dynamic kitchen guidance
          </p>
        </div>
      </div>

      {/* 1. Demand Forecast Overview Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-[#0F172A] via-[#102033] to-indigo-50 border border-indigo-400/30 shadow-xl relative overflow-hidden">
        <div className="flex items-center gap-2 text-indigo-500 text-xs font-bold uppercase tracking-wider mb-2">
          <Sparkles className="w-4 h-4" /> Macro Demand Projection
        </div>
        <h3 className="text-lg sm:text-xl font-bold text-slate-50 mb-2">
          Current Trajectory: Balanced Turnout with Friday Eve Dispersion
        </h3>
        <p className="text-xs text-slate-400 max-w-3xl leading-relaxed">
          {data.demand_forecast_summary}
        </p>
      </div>

      {/* 2. Grid: Pattern Detection on Left, Model Signals on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Pattern Detection */}
        <div className="lg:col-span-7 p-6 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-sm font-bold text-slate-50 tracking-tight flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-slate-50" /> Observed Historical Patterns
            </h3>
            <span className="text-[10px] text-slate-400 font-mono">3 Active Detections</span>
          </div>

          <div className="space-y-3">
            {data.pattern_detection.map((p: any) => (
              <div
                key={p.pattern}
                className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition-colors"
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-bold text-indigo-400">{p.pattern}</span>
                  <span className="text-[10px] text-slate-400 font-mono">Calibrated</span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed mb-2.5">
                  {p.observation}
                </p>
                <div className="p-2.5 rounded-lg bg-blue-100/40 border border-blue-200/50 text-[11px] text-slate-200 flex items-start gap-2">
                  <strong className="text-slate-50 flex-shrink-0">Action:</strong>
                  <span>{p.action}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Model Signals & Feature Weights */}
        <div className="lg:col-span-5 p-6 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
              <h3 className="text-sm font-bold text-slate-50 tracking-tight flex items-center gap-2">
                <Cpu className="w-4 h-4 text-indigo-500" /> Model Signals & Feature Weights
              </h3>
              <span className="text-[10px] font-mono text-slate-400">RandomForest</span>
            </div>

            <p className="text-xs text-slate-400 mb-4">
              Relative Gini impurity decrease attributed to key input variables during inference:
            </p>

            <div className="space-y-4">
              {data.model_signals.map((sig: any) => (
                <div key={sig.feature} className="space-y-1 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-slate-400">{sig.feature}</span>
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
                          sig.influence === 'High'
                            ? 'bg-blue-100 text-slate-50 border border-blue-200'
                            : sig.influence === 'Medium'
                            ? 'bg-cyan-950 text-indigo-500 border border-cyan-800'
                            : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        {sig.influence}
                      </span>
                      <span className="font-mono text-slate-50 font-bold">{sig.percentage}%</span>
                    </div>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-slate-900 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        sig.influence === 'High'
                          ? 'bg-slate-900'
                          : sig.influence === 'Medium'
                          ? 'bg-indigo-400'
                          : 'bg-slate-500'
                      }`}
                      style={{ width: `${sig.percentage * 2}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-[11px] text-slate-400">
            Signals re-balanced on every midnight batch processing run.
          </div>
        </div>
      </div>

      {/* 3. Operational Recommendations & Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recommendations */}
        <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-4">
          <h3 className="text-sm font-bold text-slate-50 tracking-tight flex items-center gap-2">
            <Lightbulb className="w-4 h-4 text-indigo-600" /> Prescriptive Operational Adjustments
          </h3>

          <div className="space-y-3">
            {data.recommendations.map((r: any, idx: number) => (
              <div
                key={idx}
                className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 flex items-start gap-3"
              >
                <div
                  className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${
                    r.priority === 'High'
                      ? 'bg-black text-slate-50 border border-blue-200'
                      : r.priority === 'Medium'
                      ? 'bg-indigo-50 text-indigo-600 border border-indigo-200'
                      : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {r.priority}
                </div>
                <div>
                  <span className="text-xs font-bold text-slate-50 block mb-0.5">{r.target}</span>
                  <p className="text-xs text-slate-400 leading-relaxed">{r.recommendation}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Live Operational Alerts */}
        <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-4">
          <h3 className="text-sm font-bold text-slate-50 tracking-tight flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-slate-50" /> Active Risk & Shortage Interceptions
          </h3>

          <div className="space-y-3">
            {data.alerts.map((alt: any, idx: number) => (
              <div
                key={idx}
                className={`p-4 rounded-xl border flex items-start gap-3 ${
                  alt.severity === 'Critical'
                    ? 'bg-black border-blue-200 text-blue-700'
                    : 'bg-indigo-50 border-amber-900/40 text-amber-200'
                }`}
              >
                <AlertTriangle
                  className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
                    alt.severity === 'Critical' ? 'text-slate-50' : 'text-indigo-600'
                  }`}
                />
                <div className="text-xs space-y-1">
                  <span className="font-bold uppercase tracking-wider block">
                    {alt.severity} Alert
                  </span>
                  <p className="leading-relaxed">{alt.message}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import {
  Cpu,
  Sparkles,
  Sliders,
  Calendar,
  Layers,
  ArrowRight,
  TrendingUp,
  ShieldCheck,
  CheckCircle,
  AlertCircle,
  Zap,
  ArrowLeftRight,
  TrendingDown
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell
} from 'recharts';
import { StatusBadge } from '../components/ui/StatusBadge';
import { PredictionResult } from '../types';
import { api } from '../services/api';

export const PredictionsPage: React.FC = () => {
  const [date, setDate] = useState('2026-09-04');
  const [meal, setMeal] = useState('Lunch');
  const [expectedAttendance, setExpectedAttendance] = useState(420);
  const [menuItem, setMenuItem] = useState('Paneer Butter Masala, Dal Makhani & Jeera Rice');
  const [dayType, setDayType] = useState('Regular');
  const [holidayEvent, setHolidayEvent] = useState(false);
  const [bufferPercent, setBufferPercent] = useState(3.5);

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<PredictionResult | null>(null);
  const [recentPredictions, setRecentPredictions] = useState<PredictionResult[]>([]);

  // Scenario comparison state
  const [scenarioA, setScenarioA] = useState<PredictionResult | null>(null);
  const [scenarioB, setScenarioB] = useState<PredictionResult | null>(null);
  const [loadingScenarios, setLoadingScenarios] = useState(false);

  useEffect(() => {
    loadRecentPredictions();
    handleGenerate();
    runScenarioComparison();
  }, []);

  const loadRecentPredictions = async () => {
    try {
      const preds = await api.getRecentPredictions();
      setRecentPredictions(preds);
    } catch (err) {
      console.error(err);
    }
  };

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const pred = await api.generatePrediction({
        date,
        meal,
        expected_attendance: Number(expectedAttendance),
        menu_item: menuItem,
        day_type: dayType,
        holiday_event: holidayEvent,
        buffer_percent: Number(bufferPercent)
      });
      setResult(pred);
      loadRecentPredictions();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const runScenarioComparison = async () => {
    setLoadingScenarios(true);
    try {
      // Scenario A: Normal Regular Day
      const resA = await api.generatePrediction({
        date: '2026-09-04',
        meal: 'Lunch',
        expected_attendance: 420,
        menu_item: 'Standard Meal',
        day_type: 'Regular',
        holiday_event: false,
        buffer_percent: 3.5
      });
      setScenarioA(resA);

      // Scenario B: Exam Season + High Turnout Event
      const resB = await api.generatePrediction({
        date: '2026-09-04',
        meal: 'Lunch',
        expected_attendance: 950,
        menu_item: 'Special Feast Meal',
        day_type: 'Exam',
        holiday_event: true,
        buffer_percent: 5.0
      });
      setScenarioB(resB);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingScenarios(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-xl lg:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <Cpu className="w-6 h-6 text-indigo-600" /> AI Demand Prediction & Live Scenario Simulator
            </h2>
            <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-indigo-100 text-indigo-700 border border-indigo-200">
              REAL-TIME MODEL API
            </span>
          </div>
          <p className="text-xs text-slate-500">
            Random Forest regression engine calibrated on hostel turnout history, dietary preferences, and calendar factors.
          </p>
        </div>

        <button
          onClick={runScenarioComparison}
          disabled={loadingScenarios}
          className="px-4 py-2 rounded-xl bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200 text-xs font-semibold flex items-center gap-2 transition-colors cursor-pointer shadow-sm self-start sm:self-auto"
        >
          <Zap className={`w-3.5 h-3.5 ${loadingScenarios ? 'animate-spin' : ''}`} />
          <span>Reload Live Scenario Comparison</span>
        </button>
      </div>

      {/* End-to-End Live Scenario Comparison (Section 4 & 5) */}
      <div className="p-6 rounded-2xl bg-gradient-to-br from-slate-900 to-indigo-950 text-white shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
          <div>
            <h3 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
              <ArrowLeftRight className="w-4 h-4 text-indigo-400" /> Interactive Forecast Scenario Comparison (Dynamic ML Inference)
            </h3>
            <p className="text-xs text-slate-400">
              Demonstrates how input parameters dynamically shift ML forecast & recommended preparation.
            </p>
          </div>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-900 text-indigo-300 border border-indigo-700">
            Live API Outputs
          </span>
        </div>

        {scenarioA && scenarioB ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            {/* Scenario A */}
            <div className="p-4 rounded-xl bg-slate-800/90 border border-slate-700 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-700 pb-2">
                <span className="font-bold text-slate-200 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-blue-400"></span> Scenario A: Normal Regular Day
                </span>
                <span className="text-[10px] font-mono px-2 py-0.2 rounded bg-slate-700 text-slate-300">DEMO INPUT</span>
              </div>
              <div className="space-y-1 text-slate-300 text-[11px]">
                <p>Expected Turnout: <strong>420 students</strong></p>
                <p>Academic Schedule: <strong>Regular Weekday</strong></p>
                <p>Safety Buffer Target: <strong>3.5%</strong></p>
              </div>
              <div className="border-t border-slate-700 pt-2 space-y-1">
                <span className="text-[10px] font-bold text-indigo-400 block uppercase">MODEL OUTPUT (Real Forecast API)</span>
                <div className="flex items-center justify-between font-mono">
                  <span>Predicted Demand:</span>
                  <strong className="text-white">{scenarioA.predicted_demand} meals</strong>
                </div>
                <div className="flex items-center justify-between font-mono">
                  <span>Safety Buffer (+3.5%):</span>
                  <strong className="text-cyan-400">+{scenarioA.safety_buffer} meals</strong>
                </div>
                <div className="flex items-center justify-between font-mono text-sm pt-1 border-t border-slate-700/60">
                  <span className="text-emerald-400 font-bold">Recommended Preparation:</span>
                  <strong className="text-emerald-400">{scenarioA.recommended_preparation || scenarioA.recommended_prep} portions</strong>
                </div>
              </div>
            </div>

            {/* Scenario B */}
            <div className="p-4 rounded-xl bg-slate-800/90 border border-slate-700 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-700 pb-2">
                <span className="font-bold text-amber-300 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-amber-400"></span> Scenario B: Peak Exam / Event Day
                </span>
                <span className="text-[10px] font-mono px-2 py-0.2 rounded bg-amber-950/80 text-amber-300 border border-amber-800">DEMO INPUT</span>
              </div>
              <div className="space-y-1 text-slate-300 text-[11px]">
                <p>Expected Turnout: <strong>950 students</strong></p>
                <p>Academic Schedule: <strong>Exam Period (+Event)</strong></p>
                <p>Safety Buffer Target: <strong>5.0%</strong></p>
              </div>
              <div className="border-t border-slate-700 pt-2 space-y-1">
                <span className="text-[10px] font-bold text-amber-400 block uppercase">MODEL OUTPUT (Real Forecast API)</span>
                <div className="flex items-center justify-between font-mono">
                  <span>Predicted Demand:</span>
                  <strong className="text-white">{scenarioB.predicted_demand} meals</strong>
                </div>
                <div className="flex items-center justify-between font-mono">
                  <span>Safety Buffer (+5.0%):</span>
                  <strong className="text-cyan-400">+{scenarioB.safety_buffer} meals</strong>
                </div>
                <div className="flex items-center justify-between font-mono text-sm pt-1 border-t border-slate-700/60">
                  <span className="text-emerald-400 font-bold">Recommended Preparation:</span>
                  <strong className="text-emerald-400">{scenarioB.recommended_preparation || scenarioB.recommended_prep} portions</strong>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-4 text-center text-xs text-slate-400 animate-pulse">Loading live scenario outputs...</div>
        )}

        <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 font-mono text-xs text-slate-300 flex items-center justify-between">
          <span className="text-indigo-300 font-bold">Domain Calculation Flow:</span>
          <span>
            <strong className="text-white">Attendance Input</strong> → <strong className="text-indigo-400">Random Forest Forecast</strong> → <strong className="text-amber-400">Event Adjustment (Δ)</strong> → <strong className="text-cyan-400">Safety Buffer (+%)</strong> → <strong className="text-emerald-400">Recommended Preparation</strong>
          </span>
        </div>
      </div>

      {/* Main Grid: Parameter Form on Left, Output & Feature Signals on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Simulator Controls */}
        <div className="lg:col-span-5 p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
              <Sliders className="w-4 h-4 text-indigo-600" /> Interactive Forecast Controls
            </span>
            <span className="text-[10px] text-slate-500 font-mono bg-slate-100 px-2 py-0.5 rounded">DEMO INPUT</span>
          </div>

          <div className="space-y-4 text-xs">
            {/* Date & Meal */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-500 font-medium mb-1">Date</label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 focus:outline-none focus:border-indigo-400"
                />
              </div>

              <div>
                <label className="block text-slate-500 font-medium mb-1">Meal Slot</label>
                <select
                  value={meal}
                  onChange={(e) => setMeal(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 focus:outline-none focus:border-indigo-400"
                >
                  <option value="Breakfast">Breakfast</option>
                  <option value="Lunch">Lunch</option>
                  <option value="Dinner">Dinner</option>
                </select>
              </div>
            </div>

            {/* Expected Attendance */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-slate-500 font-medium">Expected Attendance (Turnout Pool)</label>
                <span className="font-bold text-indigo-600 font-mono">{expectedAttendance} students</span>
              </div>
              <input
                type="range"
                min="100"
                max="1400"
                step="10"
                value={expectedAttendance}
                onChange={(e) => setExpectedAttendance(Number(e.target.value))}
                className="w-full accent-indigo-600 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                <span>100 (Minimal)</span>
                <span>700 (Avg)</span>
                <span>1,400 (Max Capacity)</span>
              </div>
            </div>

            {/* Planned Menu Item */}
            <div>
              <label className="block text-slate-500 font-medium mb-1">Planned Menu Recipe</label>
              <input
                type="text"
                value={menuItem}
                onChange={(e) => setMenuItem(e.target.value)}
                placeholder="e.g. Paneer Butter Masala, Dal Makhani"
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 focus:outline-none focus:border-indigo-400"
              />
            </div>

            {/* Day Type & Holiday Flag */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-500 font-medium mb-1">Academic Schedule</label>
                <select
                  value={dayType}
                  onChange={(e) => setDayType(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 focus:outline-none focus:border-indigo-400"
                >
                  <option value="Regular">Regular Weekday</option>
                  <option value="Weekend">Weekend Eve / Holiday</option>
                  <option value="Exam">Exam Season (+High turnout)</option>
                  <option value="Festival">Festival Eve (-Dip)</option>
                </select>
              </div>

              <div className="flex flex-col justify-end">
                <label className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-200 cursor-pointer text-slate-600 hover:text-slate-900">
                  <input
                    type="checkbox"
                    checked={holidayEvent}
                    onChange={(e) => setHolidayEvent(e.target.checked)}
                    className="rounded accent-indigo-600"
                  />
                  <span>Campus Event / Holiday</span>
                </label>
              </div>
            </div>

            {/* Safety Buffer Slider */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-slate-500 font-medium">Safety Reserve Buffer</label>
                <span className="font-bold text-slate-900 font-mono">+{bufferPercent}%</span>
              </div>
              <input
                type="range"
                min="1.0"
                max="8.0"
                step="0.5"
                value={bufferPercent}
                onChange={(e) => setBufferPercent(Number(e.target.value))}
                className="w-full accent-indigo-600 cursor-pointer"
              />
              <span className="text-[10px] text-slate-400 block mt-1">
                Adds a headroom cushion to protect against walk-ins while eliminating bulk food waste.
              </span>
            </div>
          </div>

          <button
            onClick={handleGenerate}
            disabled={loading}
            className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow transition-all cursor-pointer"
          >
            <Sparkles className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            {loading ? 'Running Random Forest Model...' : 'GENERATE PREDICTION'}
          </button>
        </div>

        {/* Right Column: Prediction Results & Feature Importance */}
        <div className="lg:col-span-7 space-y-6">
          {result ? (
            <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-5">
              <div className="flex items-start justify-between border-b border-slate-100 pb-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">
                      FORECAST RESULT • {result.meal.toUpperCase()}
                    </span>
                    <StatusBadge status={result.confidence} />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 tracking-tight">{result.menu_item}</h3>
                </div>

                <div className="text-right">
                  <span className="text-[10px] text-slate-500 block">Model Architecture</span>
                  <span className="text-xs font-mono text-slate-700 font-semibold">{result.model_type}</span>
                </div>
              </div>

              {/* Three Output Metric Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-[11px] text-slate-500 block mb-1">Predicted Demand (ML)</span>
                  <span className="text-2xl font-extrabold text-slate-900 font-mono tracking-tight">
                    {result.predicted_demand}
                  </span>
                  <span className="text-[10px] text-slate-400 block mt-1">Expected student turnouts</span>
                </div>

                <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200">
                  <span className="text-[11px] text-emerald-800 block mb-1">Recommended Preparation</span>
                  <span className="text-2xl font-extrabold text-emerald-700 font-mono tracking-tight">
                    {result.recommended_preparation || result.recommended_prep}
                  </span>
                  <span className="text-[10px] text-emerald-600 block mt-1">
                    Final kitchen preparation target
                  </span>
                </div>

                <div className="p-4 rounded-xl bg-indigo-50 border border-indigo-200">
                  <span className="text-[11px] text-indigo-800 block mb-1">Safety Buffer (+{result.buffer_percent || bufferPercent}%)</span>
                  <span className="text-2xl font-extrabold text-indigo-700 font-mono tracking-tight">
                    +{result.safety_buffer}
                  </span>
                  <span className="text-[10px] text-indigo-600 block mt-1">
                    Emergency headroom portions
                  </span>
                </div>
              </div>

              {/* Contributing Factors & Feature Importance */}
              <div className="border-t border-slate-100 pt-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2 flex items-center gap-1.5">
                  <TrendingUp className="w-3.5 h-3.5 text-indigo-600" /> Feature Importance Attribution
                </h4>

                <div className="h-44 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={result.feature_importance}
                      layout="vertical"
                      margin={{ top: 0, right: 20, left: 110, bottom: 0 }}
                    >
                      <XAxis type="number" domain={[0, 0.5]} stroke="#64748B" fontSize={11} tickLine={false} />
                      <YAxis
                        dataKey="feature"
                        type="category"
                        stroke="#64748B"
                        fontSize={11}
                        tickLine={false}
                        width={130}
                      />
                      <Tooltip />
                      <Bar dataKey="importance" fill="#4F46E5" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Natural Language Explanation */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 flex items-start gap-2.5">
                <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                <span>{result.explanation}</span>
              </div>
            </div>
          ) : (
            <div className="p-12 rounded-2xl bg-white border border-slate-200 text-center text-slate-500 text-xs">
              Click Generate Prediction to compute meal demand.
            </div>
          )}

          {/* Recent Prediction Audit Table */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Recent Model Execution Audit Log
            </h4>
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="text-slate-500 uppercase bg-slate-50 border-y border-slate-200 font-semibold">
                  <tr>
                    <th className="py-2.5 px-3">Date</th>
                    <th className="py-2.5 px-3">Meal</th>
                    <th className="py-2.5 px-3">Expected</th>
                    <th className="py-2.5 px-3">Predicted</th>
                    <th className="py-2.5 px-3">Recommended</th>
                    <th className="py-2.5 px-3">Confidence</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {recentPredictions.slice(0, 5).map((p) => (
                    <tr key={p.id || Math.random()} className="hover:bg-slate-50">
                      <td className="py-2.5 px-3 font-mono">{p.date}</td>
                      <td className="py-2.5 px-3 font-semibold text-slate-900">{p.meal}</td>
                      <td className="py-2.5 px-3 font-mono">{p.expected_attendance}</td>
                      <td className="py-2.5 px-3 text-indigo-700 font-bold font-mono">{p.predicted_demand}</td>
                      <td className="py-2.5 px-3 text-slate-900 font-bold font-mono">{p.recommended_prep || p.recommended_preparation}</td>
                      <td className="py-2.5 px-3">
                        <StatusBadge status={p.confidence} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

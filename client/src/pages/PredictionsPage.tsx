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
  AlertCircle
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

  useEffect(() => {
    loadRecentPredictions();
    // Pre-calculate initial prediction
    handleGenerate();
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

  const containerVariants: any = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants: any = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } }
  };

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-8"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-xl lg:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <Cpu className="w-6 h-6 text-indigo-500" /> AI Demand Prediction Workspace
            </h2>
            <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-indigo-100 text-indigo-600 border border-indigo-300">
              DEMO DATA
            </span>
          </div>
          <p className="text-xs text-slate-500">
            Random Forest regression engine calibrated on hostel turnout history, dietary preferences, and calendar factors
          </p>
        </div>
      </div>

      {/* Main Grid: Parameter Form on Left, Output & Feature Signals on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Simulator Controls */}
        <motion.div variants={itemVariants} className="lg:col-span-5 p-7 rounded-3xl glass-panel border border-slate-200 shadow-xl space-y-5">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
              <Sliders className="w-4 h-4 text-slate-900" /> Input Parameters
            </span>
            <span className="text-[11px] text-slate-500 font-mono">Service Simulator</span>
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
                  className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-slate-700 focus:outline-none focus:border-indigo-400"
                />
              </div>

              <div>
                <label className="block text-slate-500 font-medium mb-1">Meal Slot</label>
                <select
                  value={meal}
                  onChange={(e) => setMeal(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-slate-700 focus:outline-none focus:border-indigo-400"
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
                <span className="font-bold text-indigo-500 font-mono">{expectedAttendance} students</span>
              </div>
              <input
                type="range"
                min="100"
                max="1400"
                step="10"
                value={expectedAttendance}
                onChange={(e) => setExpectedAttendance(Number(e.target.value))}
                className="w-full accent-cyan-500 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-500 mt-1">
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
                className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-slate-700 focus:outline-none focus:border-indigo-400"
              />
            </div>

            {/* Day Type & Holiday Flag */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-500 font-medium mb-1">Academic Schedule</label>
                <select
                  value={dayType}
                  onChange={(e) => setDayType(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-slate-700 focus:outline-none focus:border-indigo-400"
                >
                  <option value="Regular">Regular Weekday</option>
                  <option value="Weekend">Weekend Eve / Holiday</option>
                  <option value="Exam">Exam Season (+High turnout)</option>
                  <option value="Festival">Festival Eve (-Dip)</option>
                </select>
              </div>

              <div className="flex flex-col justify-end">
                <label className="flex items-center gap-2 p-2 rounded-lg bg-slate-50 border border-slate-200 cursor-pointer text-slate-500 hover:text-slate-900">
                  <input
                    type="checkbox"
                    checked={holidayEvent}
                    onChange={(e) => setHolidayEvent(e.target.checked)}
                    className="rounded accent-slate-800"
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
                className="w-full accent-slate-800 cursor-pointer"
              />
              <span className="text-[10px] text-slate-500 block mt-1">
                Adds a small cushion to protect against sudden walk-ins while preventing bulk spoilage.
              </span>
            </div>
          </div>

          <button
            onClick={handleGenerate}
            disabled={loading}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-500 via-teal-500 to-emerald-500 hover:opacity-90 text-slate-900 font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/20 transition-all cursor-pointer"
          >
            <Sparkles className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            {loading ? 'Running Random Forest Model...' : 'GENERATE PREDICTION'}
          </button>
        </motion.div>

        {/* Right Column: Prediction Results & Feature Importance */}
        <motion.div variants={itemVariants} className="lg:col-span-7 space-y-6">
          <AnimatePresence mode="wait">
          {result ? (
            <motion.div 
              key={result.id || result.predicted_demand}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="p-7 rounded-3xl glass-panel border border-indigo-400/30 shadow-[0_0_40px_-10px_rgba(6,182,212,0.2)] space-y-6 relative overflow-hidden group"
            >
              <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.03)_50%,transparent_75%,transparent_100%)] bg-[length:250%_250%,100%_100%] animate-[bg-pan_3s_linear_infinite] opacity-0 group-hover:opacity-100 transition-opacity duration-1000"></div>
              <div className="relative z-10">
              <div className="flex items-start justify-between border-b border-slate-200 pb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-bold uppercase tracking-wider text-indigo-500">
                      FORECAST RESULTS • {result.meal.toUpperCase()}
                    </span>
                    <StatusBadge status={result.confidence} />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 tracking-tight">{result.menu_item}</h3>
                </div>

                <div className="text-right">
                  <span className="text-[11px] text-slate-500 block">Model Architecture</span>
                  <span className="text-xs font-mono text-slate-700">{result.model_type}</span>
                </div>
              </div>

              {/* Three Output Metric Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl bg-slate-50/90 border border-slate-200">
                  <span className="text-xs text-slate-500 block mb-1">Predicted Demand</span>
                  <span className="text-3xl font-extrabold text-slate-900 tracking-tight">
                    {result.predicted_demand}
                  </span>
                  <span className="text-[10px] text-slate-500 block mt-1">Expected students</span>
                </div>

                <div className="p-4 rounded-xl bg-blue-100/40 border border-blue-200/60">
                  <span className="text-xs text-slate-700 block mb-1">Recommended Preparation</span>
                  <span className="text-3xl font-extrabold text-slate-900 tracking-tight">
                    {result.recommended_preparation}
                  </span>
                  <span className="text-[10px] text-slate-900/80 block mt-1">
                    Meals kitchen should cook
                  </span>
                </div>

                <div className="p-4 rounded-xl bg-cyan-950/40 border border-cyan-800/60">
                  <span className="text-xs text-indigo-400 block mb-1">Safety Buffer</span>
                  <span className="text-3xl font-extrabold text-indigo-500 tracking-tight">
                    +{result.safety_buffer}
                  </span>
                  <span className="text-[10px] text-indigo-500/80 block mt-1">
                    Emergency headroom portions
                  </span>
                </div>
              </div>

              {/* Push to Kitchen Direct Action */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="text-xs text-slate-500">
                  <strong className="text-slate-900">Ready for production?</strong> Push this recommendation ({result.recommended_preparation} meals) directly to kitchen staff shift.
                </div>
                <button
                  onClick={() => {
                    alert(`Target of ${result.recommended_preparation} meals dispatched to Kitchen Operations for ${result.meal}!`);
                  }}
                  className="w-full sm:w-auto px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow"
                >
                  <CheckCircle className="w-3.5 h-3.5" /> Push Target to Kitchen
                </button>
              </div>

              {/* Contributing Factors & Feature Importance (Progressive Disclosure) */}
              <div className="border-t border-slate-200 pt-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2 flex items-center gap-1.5">
                  <TrendingUp className="w-3.5 h-3.5 text-indigo-500" /> Key Contributing Factors
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
                        stroke="#94A3B8"
                        fontSize={11}
                        tickLine={false}
                        width={130}
                      />
                      <Tooltip
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            const dataItem = payload[0].payload;
                            return (
                              <div className="p-2 rounded-lg bg-slate-50 border border-slate-300 text-xs">
                                <p className="font-bold text-slate-900">{dataItem.feature}</p>
                                <p className="text-indigo-500">Weight: {(dataItem.importance * 100).toFixed(0)}%</p>
                                {dataItem.impact && <p className="text-slate-500 mt-0.5">{dataItem.impact}</p>}
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                      <Bar dataKey="importance" fill="#06B6D4" radius={[0, 4, 4, 0]}>
                        {result.feature_importance.map((_, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={index === 0 ? '#06B6D4' : index === 1 ? '#10B981' : '#3B82F6'}
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Natural Language Explanation */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-500 flex items-start gap-2.5 shadow-inner">
                <CheckCircle className="w-4 h-4 text-slate-900 flex-shrink-0 mt-0.5" />
                <span>{result.explanation}</span>
              </div>
              </div>
            </motion.div>
          ) : (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="p-12 rounded-3xl glass-panel border border-slate-200 text-center text-slate-500 text-xs shadow-lg"
            >
              Click Generate Prediction to compute meal demand.
            </motion.div>
          )}
          </AnimatePresence>

          {/* Recent Prediction Audit Table */}
          <div className="p-6 rounded-3xl glass-panel border border-slate-200 shadow-xl">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
              Recent Model Outputs
            </h4>
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="text-slate-500 uppercase bg-slate-50/60 border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-3">Date</th>
                    <th className="py-2.5 px-3">Meal</th>
                    <th className="py-2.5 px-3">Expected</th>
                    <th className="py-2.5 px-3">Predicted</th>
                    <th className="py-2.5 px-3">Recommended</th>
                    <th className="py-2.5 px-3">Confidence</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-500">
                  {recentPredictions.slice(0, 5).map((p) => (
                    <tr key={p.id || Math.random()} className="hover:bg-slate-100/30">
                      <td className="py-2.5 px-3 font-mono">{p.date}</td>
                      <td className="py-2.5 px-3 font-semibold text-slate-900">{p.meal}</td>
                      <td className="py-2.5 px-3">{p.expected_attendance}</td>
                      <td className="py-2.5 px-3 text-indigo-500 font-bold">{p.predicted_demand}</td>
                      <td className="py-2.5 px-3 text-slate-900 font-bold">{p.recommended_prep || p.recommended_preparation}</td>
                      <td className="py-2.5 px-3">
                        <StatusBadge status={p.confidence} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

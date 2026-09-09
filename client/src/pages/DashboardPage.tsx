import React, { useState, useEffect } from 'react';
import {
  Users,
  Utensils,
  ChefHat,
  Recycle,
  TrendingUp,
  AlertTriangle,
  Lightbulb,
  CheckCircle2,
  Calendar,
  Sparkles,
  ArrowUpRight,
  Plus,
  ArrowRight,
  Check,
  ChevronDown,
  ChevronUp,
  FileSpreadsheet,
  Boxes,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import { MetricCard } from '../components/ui/MetricCard';
import { StatusBadge } from '../components/ui/StatusBadge';
import { DataFlowVisualization } from '../components/DataFlowVisualization';
import { DashboardData, MealForecast } from '../types';
import { api } from '../services/api';

interface DashboardPageProps {
  onNavigate: (route: string) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ onNavigate }) => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [mealFilter, setMealFilter] = useState<'all' | 'breakfast' | 'lunch' | 'dinner'>('all');
  const [selectedMealModal, setSelectedMealModal] = useState<MealForecast | null>(null);

  // Progressive disclosure: "Why AI recommends this"
  const [showAiWhy, setShowAiWhy] = useState(false);
  const [acceptedRecommendation, setAcceptedRecommendation] = useState(false);
  const [showAdjustModal, setShowAdjustModal] = useState(false);
  const [adjustedQty, setAdjustedQty] = useState(415);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      const res = await api.getDashboard();
      setData(res);
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 rounded-xl bg-slate-50/60 border border-slate-200" />
          ))}
        </div>
        <div className="h-64 rounded-xl bg-slate-50/60 border border-slate-200" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="p-8 rounded-xl bg-slate-50 border border-slate-200 text-center">
        <p className="text-slate-500">Failed to load dashboard. Ensure the backend server is active.</p>
        <button
          onClick={loadDashboard}
          className="mt-4 px-4 py-2 rounded-lg bg-white text-slate-900 text-xs font-semibold cursor-pointer"
        >
          Retry Connection
        </button>
      </div>
    );
  }

  const { kpis, today_forecast, seven_day_trend, waste_summary } = data;

  // Chart series formatting
  const chartData = seven_day_trend.map((point) => {
    let forecast = point.all_forecast;
    let actual = point.all_actual;
    if (mealFilter === 'breakfast') {
      forecast = point.breakfast_forecast || 0;
      actual = point.breakfast_actual || 0;
    } else if (mealFilter === 'lunch') {
      forecast = point.lunch_forecast || 0;
      actual = point.lunch_actual || 0;
    } else if (mealFilter === 'dinner') {
      forecast = point.dinner_forecast || 0;
      actual = point.dinner_actual || 0;
    }
    return {
      date: point.date,
      day: point.day,
      Forecast: forecast,
      Actual: actual,
      Variance: actual - forecast
    };
  });

  // Animation variants
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
      className="space-y-7"
    >
      {/* 1. ACTION-ORIENTED CRITICAL BANNER: Answers "What needs attention right now?" */}
      <motion.div variants={itemVariants} className="p-5 rounded-2xl bg-gradient-to-r from-rose-50/40 via-white to-slate-100 border-2 border-slate-600 shadow-[0_0_40px_-10px_rgba(225,29,72,0.3)] relative overflow-hidden group">
        <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.03)_50%,transparent_75%,transparent_100%)] bg-[length:250%_250%,100%_100%] animate-[bg-pan_3s_linear_infinite] opacity-0 group-hover:opacity-100 transition-opacity"></div>
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 relative z-10">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="flex h-2.5 w-2.5 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-black0"></span>
              </span>
              <span className="text-[11px] font-extrabold uppercase tracking-widest text-slate-900">
                ACTION REQUIRED • LUNCH POTENTIAL SHORTAGE RISK
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 pt-1">
              <span>Expected: <strong className="text-slate-900">420</strong></span>
              <span>•</span>
              <span>AI Prediction: <strong className="text-indigo-500">405</strong></span>
              <span>•</span>
              <span>Recommended Preparation: <strong className="text-slate-900">415 meals</strong></span>
              <span>•</span>
              <span>Current Batch Target: <strong className="text-slate-900">390</strong></span>
            </div>

            <p className="text-xs text-slate-500">
              Current kitchen batch is 25 meals below the recommended safety buffer. Late student walk-ins may encounter counter shortages.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => onNavigate('/kitchen')}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-black0 hover:bg-white text-slate-900 font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-blue-100 transition-all cursor-pointer"
            >
              VIEW LUNCH PLAN & FIX BATCH <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </motion.div>

      {/* 2. COMPACT QUICK ACTIONS BAR: Instant operations execution */}
      <motion.div variants={itemVariants} className="p-4 rounded-3xl glass-panel border border-slate-200">
        <div className="flex items-center justify-between mb-2 px-1">
          <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500">
            FAST ACTIONS • OPERATIONS SHORTCUTS
          </span>
          <span className="text-[10px] text-slate-500">1-click task launch</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
          <button
            onClick={() => onNavigate('/predictions')}
            className="p-2.5 rounded-xl bg-slate-50/90 hover:bg-slate-100 border border-slate-200 hover:border-indigo-400/40 text-xs font-semibold text-slate-700 hover:text-indigo-500 flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm"
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
            <span>Generate Prediction</span>
          </button>

          <button
            onClick={() => onNavigate('/attendance')}
            className="p-2.5 rounded-xl bg-slate-50/90 hover:bg-slate-100 border border-slate-200 hover:border-slate-300/40 text-xs font-semibold text-slate-700 hover:text-slate-900 flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm"
          >
            <Users className="w-3.5 h-3.5 text-slate-900" />
            <span>Record Attendance</span>
          </button>

          <button
            onClick={() => onNavigate('/meals')}
            className="p-2.5 rounded-xl bg-slate-50/90 hover:bg-slate-100 border border-slate-200 hover:border-indigo-300 text-xs font-semibold text-slate-700 hover:text-indigo-600 flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm"
          >
            <Utensils className="w-3.5 h-3.5 text-indigo-600" />
            <span>Record Meal Data</span>
          </button>

          <button
            onClick={() => onNavigate('/kitchen')}
            className="p-2.5 rounded-xl bg-slate-50/90 hover:bg-slate-100 border border-slate-200 hover:border-slate-300/40 text-xs font-semibold text-slate-700 hover:text-slate-700 flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm"
          >
            <ChefHat className="w-3.5 h-3.5 text-slate-900" />
            <span>Kitchen View</span>
          </button>

          <button
            onClick={() => onNavigate('/waste')}
            className="p-2.5 rounded-xl bg-slate-50/90 hover:bg-slate-100 border border-slate-200 hover:border-slate-600 text-xs font-semibold text-slate-700 hover:text-slate-900 flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm"
          >
            <Recycle className="w-3.5 h-3.5 text-slate-900" />
            <span>Record Waste</span>
          </button>

          <button
            onClick={() => onNavigate('/inventory')}
            className="p-2.5 rounded-xl bg-slate-50/90 hover:bg-slate-100 border border-slate-200 hover:border-slate-200/40 text-xs font-semibold text-slate-700 hover:text-slate-500 flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm"
          >
            <Boxes className="w-3.5 h-3.5 text-slate-500" />
            <span>Check Inventory</span>
          </button>
        </div>
      </motion.div>

      {/* 3. KEY OPERATIONAL METRICS */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Today's Expected Attendance"
          value={kpis.expected_attendance.toLocaleString()}
          subtitle="Registered Active Students"
          icon={Users}
          trend="+1.2% vs last Friday"
          trendPositive={true}
          accentColor="cyan"
          badge="LIVE DATA"
        />
        <MetricCard
          title="Predicted Meals"
          value={kpis.predicted_meals.toLocaleString()}
          subtitle="AI Turnout Forecast"
          icon={Utensils}
          trend="87.9% Turnout Ratio"
          trendPositive={true}
          accentColor="emerald"
          badge="CALCULATED"
        />
        <MetricCard
          title="Food Prepared"
          value={kpis.food_prepared.toLocaleString()}
          subtitle="Cumulative (B + L + D)"
          icon={ChefHat}
          trend="+3.5% Safety Cushion"
          trendPositive={true}
          accentColor="amber"
          badge="RECORDED"
        />
        <MetricCard
          title="Estimated Leftover"
          value={`${kpis.estimated_leftover_kg} kg`}
          subtitle="Projected Variance (2.1%)"
          icon={Recycle}
          trend="Zero-Waste Target Met"
          trendPositive={true}
          accentColor="emerald"
          badge="ESTIMATED"
          delay={0.3}
        />
      </motion.div>

      {/* 4. ACTIONABLE AI RECOMMENDATION CARD: Decide & Apply */}
      <motion.div variants={itemVariants} className="p-6 rounded-3xl glass-panel border border-indigo-400/30 shadow-[0_0_30px_-5px_rgba(6,182,212,0.15)] space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-400/30 flex items-center justify-center text-indigo-500">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-indigo-500 tracking-wider block">
                ACTIVE AI RECOMMENDATION • LUNCH
              </span>
              <h3 className="text-base sm:text-lg font-bold text-slate-900">
                Prepare approximately <span className="text-slate-900">415 meals</span> for lunch service.
              </h3>
            </div>
          </div>

          {/* Action buttons right on the recommendation */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setAcceptedRecommendation(true);
                setTimeout(() => setAcceptedRecommendation(false), 3000);
              }}
              className="px-4 py-2 rounded-xl bg-white hover:bg-black0 text-slate-900 font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-md shadow-slate-800/20"
            >
              {acceptedRecommendation ? (
                <>
                  <Check className="w-4 h-4" /> Recommendation Applied
                </>
              ) : (
                'Accept Recommendation'
              )}
            </button>
            <button
              onClick={() => setShowAdjustModal(true)}
              className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition-colors cursor-pointer border border-slate-300"
            >
              Adjust Quantity
            </button>
          </div>
        </div>

        {/* Progressive Disclosure: "Why?" */}
        <div className="pt-2 border-t border-slate-200">
          <button
            onClick={() => setShowAiWhy(!showAiWhy)}
            className="text-xs font-semibold text-slate-500 hover:text-indigo-500 flex items-center gap-1 cursor-pointer transition-colors"
          >
            <span>Why 415 meals? View operational factors</span>
            {showAiWhy ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>

          {showAiWhy && (
            <div className="mt-3 p-3.5 rounded-xl bg-slate-50/90 border border-slate-200 text-xs text-slate-500 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 animate-in fade-in duration-200">
              <div className="p-2 rounded-lg bg-slate-50/60 border border-slate-200">
                <span className="text-[10px] text-slate-500 uppercase font-bold block mb-0.5">1. Attendance Pool</span>
                <p className="font-medium text-slate-900">420 Expected</p>
                <span className="text-[10px] text-slate-500">Regular campus enrollment</span>
              </div>
              <div className="p-2 rounded-lg bg-slate-50/60 border border-slate-200">
                <span className="text-[10px] text-slate-500 uppercase font-bold block mb-0.5">2. Day of Week Factor</span>
                <p className="font-medium text-indigo-500">-6.8% Friday Dip</p>
                <span className="text-[10px] text-slate-500">Weekend eve travel pattern</span>
              </div>
              <div className="p-2 rounded-lg bg-slate-50/60 border border-slate-200">
                <span className="text-[10px] text-slate-500 uppercase font-bold block mb-0.5">3. Menu Elasticity</span>
                <p className="font-medium text-slate-900">+3.8% Paneer Draw</p>
                <span className="text-[10px] text-slate-500">High recipe popularity</span>
              </div>
              <div className="p-2 rounded-lg bg-slate-50/60 border border-slate-200">
                <span className="text-[10px] text-slate-500 uppercase font-bold block mb-0.5">4. Safe Cushion</span>
                <p className="font-medium text-indigo-600">+10 Buffer Meals</p>
                <span className="text-[10px] text-slate-500">Guarantees zero shortage</span>
              </div>
            </div>
          )}
        </div>
      </motion.div>

      {/* 5. OPERATIONAL MEAL CARDS (Breakfast, Lunch, Dinner with Contextual Actions) */}
      <motion.div variants={itemVariants}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <Calendar className="w-4 h-4 text-slate-900" /> Today's Shift Preparation & Status
            </h3>
            <p className="text-xs text-slate-500">
              Actionable shift targets with live kitchen status indicators
            </p>
          </div>
          <button
            onClick={() => onNavigate('/kitchen')}
            className="text-xs text-slate-900 hover:text-slate-700 font-semibold flex items-center gap-1 cursor-pointer"
          >
            Open Kitchen Workflow <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {today_forecast.map((item, idx) => {
            const isShortage = item.meal === 'Lunch';
            return (
              <motion.div
                key={item.meal}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + (idx * 0.1) }}
                whileHover={{ y: -5 }}
                className={`p-6 rounded-3xl glass-panel transition-all flex flex-col justify-between shadow-lg relative overflow-hidden group ${
                  isShortage ? 'border-slate-600 ring-1 ring-slate-600 shadow-[0_0_30px_-5px_rgba(225,29,72,0.15)]' : 'border-slate-200 hover:border-slate-300 hover:shadow-indigo-500/5'
                }`}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-white/[0.03] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-extrabold uppercase tracking-wider text-slate-900">
                      {item.meal}
                    </span>
                    <StatusBadge status={isShortage ? 'Critical' : 'Optimal'} />
                  </div>

                  <div className="p-2.5 rounded-lg bg-slate-50/80 border border-slate-200/80 mb-4">
                    <span className="text-[10px] uppercase font-bold text-slate-500 block mb-0.5">Menu:</span>
                    <p className="text-xs text-slate-700 font-medium line-clamp-2">{item.menu}</p>
                  </div>

                  {/* Shift Stats Table */}
                  <div className="space-y-1.5 text-xs text-slate-500 mb-4 bg-slate-50/60 p-3 rounded-xl border border-slate-200">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Expected Attendance:</span>
                      <strong className="text-slate-900 font-mono">420</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">AI Predicted Demand:</span>
                      <strong className="text-indigo-500 font-mono">{item.predicted}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Recommended Prep:</span>
                      <strong className="text-slate-900 font-mono">{item.recommended}</strong>
                    </div>
                    <div className="flex justify-between pt-1 border-t border-slate-200">
                      <span className="text-slate-500">Actual Preparation:</span>
                      <strong className={`font-mono ${isShortage ? 'text-slate-900' : 'text-slate-900'}`}>
                        {isShortage ? '390 (Under)' : `${item.recommended}`}
                      </strong>
                    </div>
                  </div>
                </div>

                {/* Contextual Actions */}
                <div className="pt-4 border-t border-slate-200/80 flex items-center justify-between gap-2 relative z-10">
                  <button
                    onClick={() => setSelectedMealModal(item)}
                    className="px-4 py-2 rounded-xl bg-slate-100/80 hover:bg-slate-200 text-slate-500 hover:text-slate-900 text-xs font-semibold cursor-pointer transition-colors"
                  >
                    View Plan
                  </button>
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={() => onNavigate('/kitchen')}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      isShortage
                        ? 'bg-black0 hover:bg-white text-slate-900 shadow-[0_0_15px_-3px_rgba(225,29,72,0.4)]'
                        : 'bg-white/10 hover:bg-white/20 text-slate-900 border border-slate-300/30'
                    }`}
                  >
                    {isShortage ? 'Fix Shortage' : 'Send to Kitchen'}
                  </motion.button>
                </div>
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      {/* 6. DEMAND TREND RECHARTS WITH FILTERS */}
      <motion.div variants={itemVariants} className="p-7 rounded-3xl glass-panel border border-slate-200 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
          <div>
            <h3 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-indigo-500" /> 7-Day Forecast vs Actual Turnout
            </h3>
            <p className="text-xs text-slate-500">
              Tracks continuous variance and models learning feedback
            </p>
          </div>

          <div className="inline-flex p-1 rounded-lg bg-slate-50 border border-slate-200 self-start sm:self-auto">
            {(['all', 'breakfast', 'lunch', 'dinner'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setMealFilter(tab)}
                className={`px-3 py-1 rounded-md text-xs font-semibold capitalize transition-colors cursor-pointer ${
                  mealFilter === tab
                    ? 'bg-slate-100 text-slate-900 shadow-sm'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                {tab === 'all' ? 'All Meals' : tab}
              </button>
            ))}
          </div>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
              <XAxis dataKey="day" stroke="#64748B" fontSize={11} tickLine={false} />
              <YAxis stroke="#64748B" fontSize={11} tickLine={false} />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    const forecastVal = payload[0]?.value;
                    const actualVal = payload[1]?.value;
                    const variance = Number(actualVal) - Number(forecastVal);
                    return (
                      <div className="p-3 rounded-xl bg-slate-50 border border-slate-300 shadow-2xl text-xs space-y-1">
                        <p className="font-bold text-slate-700">{label} ({payload[0]?.payload?.date})</p>
                        <p className="text-indigo-500">Forecast: <strong>{forecastVal}</strong> meals</p>
                        <p className="text-slate-900">Actual: <strong>{actualVal}</strong> meals</p>
                        <p className={`font-semibold ${variance >= 0 ? 'text-indigo-600' : 'text-slate-500'}`}>
                          Variance: {variance > 0 ? `+${variance}` : variance} portions
                        </p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Legend verticalAlign="top" height={32} wrapperStyle={{ fontSize: '11px' }} />
              <Line
                type="monotone"
                dataKey="Forecast"
                stroke="#06B6D4"
                strokeWidth={2.5}
                dot={{ r: 3, fill: '#06B6D4' }}
                activeDot={{ r: 5 }}
              />
              <Line
                type="monotone"
                dataKey="Actual"
                stroke="#10B981"
                strokeWidth={2.5}
                dot={{ r: 3, fill: '#10B981' }}
                activeDot={{ r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* 5. ARCHITECTURE DATA FLOW (NEW) */}
      <motion.div variants={itemVariants}>
        <DataFlowVisualization />
      </motion.div>

      {/* Adjust Quantity Modal */}
      <AnimatePresence>
      {showAdjustModal && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4"
        >
          <motion.div 
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            className="w-full max-w-md glass-panel-heavy border border-slate-300 rounded-3xl p-7 shadow-2xl relative"
          >
            <button
              onClick={() => setShowAdjustModal(false)}
              className="absolute top-4 right-4 text-slate-500 hover:text-slate-900 p-1 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-base font-bold text-slate-900 mb-1">Override Kitchen Preparation Target</h3>
            <p className="text-xs text-slate-500 mb-4">Adjust target batch for Today's Lunch</p>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-500 font-medium mb-1">Planned Meals to Cook</label>
                <input
                  type="number"
                  value={adjustedQty}
                  onChange={(e) => setAdjustedQty(Number(e.target.value))}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 font-mono text-lg font-bold"
                />
              </div>

              <div className="p-3 rounded-lg bg-slate-50/60 border border-slate-200 text-slate-500 text-[11px] space-y-1">
                <p>• AI Recommended: <strong>415 meals</strong></p>
                <p>• Difference: <strong className="text-indigo-500">{adjustedQty - 415 > 0 ? `+${adjustedQty - 415}` : adjustedQty - 415} meals</strong></p>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAdjustModal(false)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowAdjustModal(false);
                    onNavigate('/kitchen');
                  }}
                  className="flex-1 py-2.5 rounded-xl bg-white hover:bg-black0 text-slate-900 font-bold"
                >
                  Confirm & Push to Kitchen
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Modal for Meal Details */}
      {selectedMealModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-slate-50 border border-slate-300 rounded-2xl p-6 shadow-2xl relative">
            <button
              onClick={() => setSelectedMealModal(null)}
              className="absolute top-4 right-4 text-slate-500 hover:text-slate-900 p-1 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-bold px-2 py-0.5 rounded bg-blue-100 text-slate-900 border border-blue-200">
                {selectedMealModal.meal}
              </span>
              <StatusBadge status={selectedMealModal.confidence} />
            </div>

            <h3 className="text-lg font-bold text-slate-900 mb-2">Meal Service Parameters</h3>
            <p className="text-xs text-slate-500 bg-slate-50 p-3 rounded-xl border border-slate-200 mb-4">
              <strong>Menu:</strong> {selectedMealModal.menu}
            </p>

            <div className="grid grid-cols-2 gap-3 mb-4 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-slate-500 block">Baseline Expected</span>
                <span className="text-xl font-bold text-slate-900 font-mono">{selectedMealModal.predicted}</span>
              </div>
              <div className="p-3 rounded-xl bg-blue-100/40 border border-blue-200/40">
                <span className="text-slate-700 block">Kitchen Preparation Cap</span>
                <span className="text-xl font-bold text-slate-900 font-mono">{selectedMealModal.recommended}</span>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => {
                  setSelectedMealModal(null);
                  onNavigate('/kitchen');
                }}
                className="w-full py-3 rounded-xl bg-white hover:bg-black0 text-slate-900 font-bold text-sm cursor-pointer shadow-[0_0_20px_-5px_rgba(16,185,129,0.4)] transition-all"
              >
                Go to Kitchen Prep
              </button>
            </div>
          </div>
        </div>
      )}
      </AnimatePresence>
    </motion.div>
  );
};

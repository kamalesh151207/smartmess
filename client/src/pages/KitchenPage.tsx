import React, { useState } from 'react';
import {
  ChefHat,
  Clock,
  CheckCircle2,
  AlertCircle,
  Play,
  Save,
  Check,
  Utensils,
  ArrowRight,
  Flame,
  Scale
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../services/api';

interface KitchenPageProps {
  onNavigate?: (route: string) => void;
}

export const KitchenPage: React.FC<KitchenPageProps> = ({ onNavigate }) => {
  const [activeShift, setActiveShift] = useState<'Breakfast' | 'Lunch' | 'Dinner'>('Lunch');
  const [prepStatus, setPrepStatus] = useState<'idle' | 'in_prep' | 'cooked' | 'service_done' | 'completed'>('idle');

  // Meal shift data
  const shiftConfigs = {
    Breakfast: {
      expected: 380,
      predicted: 360,
      recommended: 375,
      menu: ['Idli & Medu Vada', 'Sambar Gravy', 'Coconut Chutney', 'Filter Coffee'],
      timeWindow: '07:30 AM – 09:45 AM'
    },
    Lunch: {
      expected: 420,
      predicted: 405,
      recommended: 415,
      menu: ['Steamed Basmati Rice', 'Dal Makhani / Tadka', 'Paneer Butter Masala', 'Boondi Raita & Salad'],
      timeWindow: '12:15 PM – 02:30 PM'
    },
    Dinner: {
      expected: 395,
      predicted: 385,
      recommended: 400,
      menu: ['Tawa Phulkas / Naan', 'Moong Dal Khichdi', 'Mixed Vegetable Curry', 'Kheer / Sweet'],
      timeWindow: '07:45 PM – 10:00 PM'
    }
  };

  const currentShift = shiftConfigs[activeShift];

  const [preparedQty, setPreparedQty] = useState<number>(currentShift.recommended);
  const [consumedQty, setConsumedQty] = useState<number>(currentShift.predicted);
  const [leftoverQty, setLeftoverQty] = useState<number>(preparedQty - consumedQty);
  const [submitted, setSubmitted] = useState(false);

  const handleShiftChange = (shift: 'Breakfast' | 'Lunch' | 'Dinner') => {
    setActiveShift(shift);
    const newConfig = shiftConfigs[shift];
    setPreparedQty(newConfig.recommended);
    setConsumedQty(newConfig.predicted);
    setLeftoverQty(newConfig.recommended - newConfig.predicted);
    setPrepStatus('idle');
    setSubmitted(false);
  };

  const handleStartPrep = () => {
    setPrepStatus('in_prep');
  };

  const handleConfirmPrepared = () => {
    setPrepStatus('cooked');
  };

  const handleServiceComplete = () => {
    setLeftoverQty(Math.max(0, preparedQty - consumedQty));
    setPrepStatus('service_done');
  };

  const handleSubmitAll = async () => {
    try {
      await api.createMeal({
        date: '2026-09-04',
        meal: activeShift,
        menu: currentShift.menu.join(', '),
        planned_qty: currentShift.recommended,
        predicted_qty: currentShift.predicted,
        recommended_qty: currentShift.recommended,
        prepared_qty: Number(preparedQty),
        consumed_qty: Number(consumedQty),
        leftover_qty: Number(leftoverQty),
        notes: `Submitted by kitchen shift team for ${activeShift}`
      });
      setSubmitted(true);
      setPrepStatus('completed');
    } catch (err) {
      console.error(err);
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
      className="space-y-6 max-w-4xl mx-auto"
    >
      {/* Shift Switcher */}
      <motion.div variants={itemVariants} className="p-4 rounded-3xl glass-panel border border-slate-200 shadow-lg flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
          <ChefHat className="w-5 h-5 text-slate-900" />
          <span>KITCHEN OPERATIONS SHIFT</span>
        </div>

        <div className="inline-flex p-1 rounded-xl bg-slate-50 border border-slate-200">
          {(['Breakfast', 'Lunch', 'Dinner'] as const).map((shift) => (
            <button
              key={shift}
              onClick={() => handleShiftChange(shift)}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeShift === shift
                  ? 'bg-white text-slate-900 shadow-md'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              {shift}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Main Target Card for Mess Staff */}
      <motion.div variants={itemVariants} className="p-7 rounded-3xl bg-gradient-to-br from-[#0F172A] via-[#102235] to-indigo-50 border-2 border-slate-300/40 shadow-[0_0_40px_-10px_rgba(16,185,129,0.2)] relative overflow-hidden group">
        <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.03)_50%,transparent_75%,transparent_100%)] bg-[length:250%_250%,100%_100%] animate-[bg-pan_3s_linear_infinite] opacity-0 group-hover:opacity-100 transition-opacity duration-1000"></div>
        <div className="relative z-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <span className="text-[11px] uppercase font-bold tracking-widest text-slate-900 block mb-1">
              TODAY'S {activeShift.toUpperCase()} SERVICE TARGET
            </span>
            <div className="flex items-center gap-3 text-xs text-slate-500">
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-slate-500" /> {currentShift.timeWindow}
              </span>
              <span>•</span>
              <span>Expected Students: <strong className="text-slate-900">{currentShift.expected}</strong></span>
              <span>•</span>
              <span>AI Prediction: <strong className="text-indigo-500">{currentShift.predicted}</strong></span>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-blue-100/60 border border-slate-300/50 text-center md:text-right">
            <span className="text-xs uppercase font-bold text-slate-700 block mb-0.5">
              RECOMMENDED PREPARATION
            </span>
            <span className="text-4xl font-extrabold text-slate-900 tracking-tight">
              {currentShift.recommended} <span className="text-lg text-slate-900 font-normal">MEALS</span>
            </span>
            <span className="text-[10px] text-slate-900/80 block mt-0.5">
              Includes +{currentShift.recommended - currentShift.predicted} portion safety cushion
            </span>
          </div>
        </div>

        {/* Menu Items to Cook */}
        <div className="p-4 rounded-xl bg-slate-50/80 border border-slate-200 mb-6">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-2">
            Approved Shift Menu:
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {currentShift.menu.map((dish, i) => (
              <div key={i} className="p-2.5 rounded-lg bg-slate-50/80 border border-slate-200 text-xs font-semibold text-slate-700 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-black0"></span>
                <span className="truncate">{dish}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Step-by-Step Cooking & Logging Workflow */}
        <div className="space-y-4 pt-2 border-t border-slate-200/80">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span className="font-bold text-slate-900 uppercase tracking-wider">Service Progress</span>
            <span className="font-mono text-slate-900">
              {prepStatus === 'idle' && 'Step 1 of 4: Start Prep'}
              {prepStatus === 'in_prep' && 'Step 2 of 4: Cooking Active'}
              {prepStatus === 'cooked' && 'Step 3 of 4: Service Running'}
              {prepStatus === 'service_done' && 'Step 4 of 4: Final Reconciliation'}
              {prepStatus === 'completed' && 'Service Submitted'}
            </span>
          </div>

          <AnimatePresence mode="wait">
          {/* Action Step 1: Start Preparation */}
          {prepStatus === 'idle' && (
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="p-5 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-lg"
            >
              <div>
                <h4 className="text-sm font-bold text-slate-900">Ready to begin batch cooking?</h4>
                <p className="text-xs text-slate-500">Lock target at {currentShift.recommended} meals and notify dining coordinator.</p>
              </div>
              <button
                onClick={handleStartPrep}
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg shadow-slate-800/20"
              >
                <Play className="w-4 h-4" /> START PREPARATION
              </button>
            </motion.div>
          )}

          {/* Action Step 2: Record Prepared Quantity */}
          {prepStatus === 'in_prep' && (
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-4 shadow-lg"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <Flame className="w-4 h-4 text-indigo-600" /> Cooking in Progress
                  </h4>
                  <p className="text-xs text-slate-500">Verify actual prepared count before sending to service counters.</p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-3">
                <div className="flex-1 w-full">
                  <label className="block text-xs text-slate-500 font-medium mb-1">Actual Prepared Quantity (Meals)</label>
                  <input
                    type="number"
                    value={preparedQty}
                    onChange={(e) => setPreparedQty(Number(e.target.value))}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 font-mono text-base font-bold"
                  />
                </div>
                <button
                  onClick={handleConfirmPrepared}
                  className="w-full sm:w-auto mt-auto px-6 py-2.5 rounded-xl bg-indigo-500 hover:bg-indigo-400 text-slate-900 font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                >
                  <Check className="w-4 h-4" /> Confirm Prepared ({preparedQty})
                </button>
              </div>
            </motion.div>
          )}

          {/* Action Step 3: Service Running -> Record Consumption */}
          {prepStatus === 'cooked' && (
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-4 shadow-lg"
            >
              <div>
                <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Utensils className="w-4 h-4 text-slate-900" /> Meal Service Active
                </h4>
                <p className="text-xs text-slate-500">Prepared: <strong>{preparedQty} meals</strong>. When meal counter closes, enter total student turnout.</p>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-3">
                <div className="flex-1 w-full">
                  <label className="block text-xs text-slate-500 font-medium mb-1">Total Consumed Meals (Student Turnout)</label>
                  <input
                    type="number"
                    value={consumedQty}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      setConsumedQty(val);
                      setLeftoverQty(Math.max(0, preparedQty - val));
                    }}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 font-mono text-base font-bold"
                  />
                </div>
                <button
                  onClick={handleServiceComplete}
                  className="w-full sm:w-auto mt-auto px-6 py-2.5 rounded-xl bg-indigo-500 hover:bg-amber-400 text-slate-900 font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                >
                  Close Service & Measure Leftovers
                </button>
              </div>
            </motion.div>
          )}

          {/* Action Step 4: Record Leftovers & Submit */}
          {prepStatus === 'service_done' && (
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-5 shadow-lg"
            >
              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                  <span className="text-[10px] text-slate-500 uppercase block">Prepared</span>
                  <span className="text-lg font-bold text-slate-900">{preparedQty}</span>
                </div>
                <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                  <span className="text-[10px] text-slate-500 uppercase block">Consumed</span>
                  <span className="text-lg font-bold text-slate-900">{consumedQty}</span>
                </div>
                <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                  <span className="text-[10px] text-slate-500 uppercase block">Leftover</span>
                  <span className="text-lg font-bold text-indigo-600">{leftoverQty} portions</span>
                </div>
              </div>

              <div>
                <label className="block text-xs text-slate-500 font-medium mb-1">Verify Leftover Portions</label>
                <input
                  type="number"
                  value={leftoverQty}
                  onChange={(e) => setLeftoverQty(Number(e.target.value))}
                  className="w-full px-4 py-2 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 font-mono text-sm"
                />
              </div>

              <button
                onClick={handleSubmitAll}
                className="w-full py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg shadow-slate-800/20"
              >
                <Save className="w-4 h-4" /> SUBMIT MEAL DATA TO RECONCILIATION
              </button>
            </motion.div>
          )}

          {/* Completed State */}
          {prepStatus === 'completed' && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-6 rounded-2xl bg-blue-100/50 border border-blue-200/60 text-center space-y-3 shadow-lg"
            >
              <CheckCircle2 className="w-8 h-8 text-slate-900 mx-auto" />
              <h4 className="text-sm font-bold text-slate-900">{activeShift} Service Logged Successfully!</h4>
              <p className="text-xs text-slate-500">
                Data reconciled into meals database, waste audits updated, and inventory consumption recorded.
              </p>
              <button
                onClick={() => handleShiftChange(activeShift === 'Lunch' ? 'Dinner' : 'Lunch')}
                className="mt-2 px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-xs font-semibold text-slate-900 cursor-pointer"
              >
                Prepare Next Shift
              </button>
            </motion.div>
          )}
          </AnimatePresence>
          </div>
        </div>
      </motion.div>

      {/* Quick Kitchen Portioning Guides */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
          <span className="font-bold text-slate-900 block mb-1">Rice Ratio</span>
          <p className="text-slate-500">80g raw rice per standard student portion. 415 meals = ~33.2 kg raw rice.</p>
        </div>
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
          <span className="font-bold text-slate-900 block mb-1">Dal Gravy</span>
          <p className="text-slate-500">35g raw dal per portion. 415 meals = ~14.5 kg Toor/Moong dal.</p>
        </div>
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
          <span className="font-bold text-slate-900 block mb-1">Clean Leftover Handling</span>
          <p className="text-slate-500">Store unserved cooked rice in cold storage within 45 mins for zero contamination.</p>
        </div>
      </motion.div>
    </motion.div>
  );
};

import React, { useState, useEffect } from 'react';
import {
  UtensilsCrossed,
  Plus,
  Calendar,
  ChefHat,
  Scale,
  CheckCircle2,
  AlertTriangle,
  X,
  Filter
} from 'lucide-react';
import { StatusBadge } from '../components/ui/StatusBadge';
import { MealRecord } from '../types';
import { api } from '../services/api';

export const MealsPage: React.FC = () => {
  const [meals, setMeals] = useState<MealRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState('');
  const [filterMeal, setFilterMeal] = useState('All');

  // Add meal modal
  const [showModal, setShowModal] = useState(false);
  const [modalDate, setModalDate] = useState('2026-09-04');
  const [modalMealType, setModalMealType] = useState<'Breakfast' | 'Lunch' | 'Dinner'>('Dinner');
  const [modalMenu, setModalMenu] = useState('');
  const [modalPlanned, setModalPlanned] = useState(410);
  const [modalPrepared, setModalPrepared] = useState(415);
  const [modalConsumed, setModalConsumed] = useState(402);
  const [modalNotes, setModalNotes] = useState('');

  useEffect(() => {
    loadMeals();
  }, [selectedDate]);

  const loadMeals = async () => {
    setLoading(true);
    try {
      const data = await api.getMeals(selectedDate || undefined);
      setMeals(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateMeal = async (e: React.FormEvent) => {
    e.preventDefault();
    const leftover = Math.max(0, modalPrepared - modalConsumed);
    try {
      await api.createMeal({
        date: modalDate,
        meal: modalMealType,
        menu: modalMenu || 'Special Dinner Service',
        planned_qty: Number(modalPlanned),
        predicted_qty: Number(modalPlanned) - 10,
        recommended_qty: Number(modalPlanned),
        prepared_qty: Number(modalPrepared),
        consumed_qty: Number(modalConsumed),
        leftover_qty: leftover,
        notes: modalNotes
      });
      setShowModal(false);
      loadMeals();
    } catch (err) {
      console.error(err);
    }
  };

  const filteredMeals = meals.filter((m) => {
    if (filterMeal !== 'All' && m.meal !== filterMeal) return false;
    return true;
  });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-xl lg:text-2xl font-bold text-slate-50 tracking-tight flex items-center gap-2">
              <UtensilsCrossed className="w-6 h-6 text-indigo-600" /> Meal Management & Preparation Ledger
            </h2>
            <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-indigo-100 text-indigo-600 border border-indigo-300">
              DEMO DATA
            </span>
          </div>
          <p className="text-xs text-slate-400">
            Log and reconcile planned quantities against actual kitchen preparation and leftovers
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2 rounded-xl bg-slate-950 hover:bg-slate-800 text-slate-50 text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-slate-800/20 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" /> Log New Meal Service
        </button>
      </div>

      {/* Filter Bar */}
      <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-lg flex flex-wrap gap-4 items-center justify-between">
        <div className="flex items-center gap-3">
          <label className="text-xs font-medium text-slate-400">Filter Date:</label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-200 focus:outline-none"
          />
          {selectedDate && (
            <button
              onClick={() => setSelectedDate('')}
              className="text-xs text-slate-400 hover:text-slate-50"
            >
              Clear
            </button>
          )}
        </div>

        <div className="inline-flex p-1 rounded-lg bg-slate-900 border border-slate-800">
          {['All', 'Breakfast', 'Lunch', 'Dinner'].map((type) => (
            <button
              key={type}
              onClick={() => setFilterMeal(type)}
              className={`px-3 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                filterMeal === type
                  ? 'bg-slate-800 text-slate-50 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {/* Meals Table */}
      <div className="rounded-2xl bg-slate-900/90 border border-slate-800 shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="text-slate-400 uppercase bg-slate-900/80 border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Meal</th>
                <th className="py-3 px-4">Menu Items</th>
                <th className="py-3 px-4 text-center">Predicted</th>
                <th className="py-3 px-4 text-center">Recommended</th>
                <th className="py-3 px-4 text-center">Prepared</th>
                <th className="py-3 px-4 text-center">Consumed</th>
                <th className="py-3 px-4 text-center">Leftover</th>
                <th className="py-3 px-4">Service Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-400">
              {loading ? (
                <tr>
                  <td colSpan={9} className="text-center py-8 text-slate-400">
                    Loading meal ledger...
                  </td>
                </tr>
              ) : filteredMeals.length === 0 ? (
                <tr>
                  <td colSpan={9} className="text-center py-8 text-slate-400">
                    No meal records match the criteria.
                  </td>
                </tr>
              ) : (
                filteredMeals.map((m) => (
                  <tr key={m.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-3 px-4 font-mono">{m.date}</td>
                    <td className="py-3 px-4 font-bold text-slate-50">{m.meal}</td>
                    <td className="py-3 px-4 max-w-xs truncate text-slate-400" title={m.menu}>
                      {m.menu}
                    </td>
                    <td className="py-3 px-4 text-center font-mono text-indigo-500">{m.predicted_qty}</td>
                    <td className="py-3 px-4 text-center font-mono text-slate-50 font-semibold">{m.recommended_qty}</td>
                    <td className="py-3 px-4 text-center font-mono text-slate-50 font-bold">{m.prepared_qty}</td>
                    <td className="py-3 px-4 text-center font-mono text-slate-200">{m.consumed_qty}</td>
                    <td className="py-3 px-4 text-center font-mono">
                      <span className={m.leftover_qty > 20 ? 'text-slate-50 font-bold' : 'text-slate-400'}>
                        {m.leftover_qty}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <StatusBadge status={m.status} />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Meal Service Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-700 rounded-2xl p-6 shadow-2xl relative">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-50 p-1 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-slate-50 mb-1">Record Meal Preparation</h3>
            <p className="text-xs text-slate-400 mb-4">Input kitchen shift metrics and leftovers</p>

            <form onSubmit={handleCreateMeal} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-medium mb-1">Date</label>
                  <input
                    type="date"
                    required
                    value={modalDate}
                    onChange={(e) => setModalDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-200"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-medium mb-1">Meal Slot</label>
                  <select
                    value={modalMealType}
                    onChange={(e) => setModalMealType(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-200"
                  >
                    <option value="Breakfast">Breakfast</option>
                    <option value="Lunch">Lunch</option>
                    <option value="Dinner">Dinner</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1">Menu Description</label>
                <input
                  type="text"
                  required
                  value={modalMenu}
                  onChange={(e) => setModalMenu(e.target.value)}
                  placeholder="e.g. Palak Paneer, Jeera Rice, Tawa Roti & Gulab Jamun"
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-200"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-400 font-medium mb-1">Planned</label>
                  <input
                    type="number"
                    value={modalPlanned}
                    onChange={(e) => setModalPlanned(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-200 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-medium mb-1">Prepared</label>
                  <input
                    type="number"
                    value={modalPrepared}
                    onChange={(e) => setModalPrepared(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-200 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-medium mb-1">Consumed</label>
                  <input
                    type="number"
                    value={modalConsumed}
                    onChange={(e) => setModalConsumed(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-200 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1">Kitchen Notes</label>
                <input
                  type="text"
                  value={modalNotes}
                  onChange={(e) => setModalNotes(e.target.value)}
                  placeholder="e.g. Smooth service, rain delayed turnout by 20 mins"
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-200"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-slate-950 hover:bg-slate-800 text-slate-50 font-bold text-xs transition-colors cursor-pointer mt-2"
              >
                Save Meal Ledger Entry
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

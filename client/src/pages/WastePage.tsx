import React, { useState, useEffect } from 'react';
import {
  Recycle,
  Trash2,
  TrendingDown,
  Scale,
  Plus,
  AlertTriangle,
  Lightbulb,
  Search,
  ArrowRight,
  Check,
  CheckCircle2,
  ArrowUpDown,
  X
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import { MetricCard } from '../components/ui/MetricCard';
import { WasteLog } from '../types';
import { api } from '../services/api';

export const WastePage: React.FC = () => {
  const [metrics, setMetrics] = useState({
    total_leftover_kg: 184,
    avg_waste_pct: 2.3,
    highest_waste_meal: 'Lunch — Friday',
    saved_meals_estimate: 840
  });
  const [topItems, setTopItems] = useState<Array<{ item: string; kg_wasted: number; frequency: string }>>([]);
  const [logs, setLogs] = useState<WasteLog[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters, search, and sorting
  const [filterMeal, setFilterMeal] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'date' | 'waste_pct' | 'leftover'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Action status
  const [appliedBuffer, setAppliedBuffer] = useState(false);

  // Log waste modal
  const [showModal, setShowModal] = useState(false);
  const [modalDate, setModalDate] = useState('2026-09-04');
  const [modalMeal, setModalMeal] = useState('Lunch');
  const [modalPrepared, setModalPrepared] = useState(415);
  const [modalConsumed, setModalConsumed] = useState(400);
  const [modalLeftover, setModalLeftover] = useState(15);
  const [modalHighestItem, setModalHighestItem] = useState('Cooked Basmati Rice');
  const [modalCause, setModalCause] = useState('Turnout drop on Friday afternoon');

  useEffect(() => {
    loadWaste();
  }, []);

  const loadWaste = async () => {
    setLoading(true);
    try {
      const data = await api.getWaste();
      setMetrics(data.metrics);
      setTopItems(data.highest_waste_items);
      setLogs(data.logs);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogWaste = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.logWaste({
        date: modalDate,
        meal: modalMeal,
        prepared_qty: Number(modalPrepared),
        consumed_qty: Number(modalConsumed),
        leftover_qty: Number(modalLeftover),
        highest_waste_item: modalHighestItem,
        cause: modalCause
      });
      setShowModal(false);
      loadWaste();
    } catch (err) {
      console.error(err);
    }
  };

  const handleApplyBufferAdjustment = () => {
    setAppliedBuffer(true);
    setTimeout(() => setAppliedBuffer(false), 3000);
  };

  // Filter and sort logs
  const filteredAndSortedLogs = logs
    .filter((l) => {
      if (filterMeal !== 'All' && l.meal !== filterMeal) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          l.highest_waste_item?.toLowerCase().includes(q) ||
          l.date.includes(q) ||
          l.meal.toLowerCase().includes(q) ||
          l.cause?.toLowerCase().includes(q)
        );
      }
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'waste_pct') {
        return sortOrder === 'desc'
          ? b.waste_percentage - a.waste_percentage
          : a.waste_percentage - b.waste_percentage;
      }
      if (sortBy === 'leftover') {
        return sortOrder === 'desc'
          ? b.leftover_qty - a.leftover_qty
          : a.leftover_qty - b.leftover_qty;
      }
      // date
      return sortOrder === 'desc'
        ? b.date.localeCompare(a.date)
        : a.date.localeCompare(b.date);
    });

  const trendData = logs
    .slice(0, 14)
    .reverse()
    .map((l) => ({
      date: l.date.slice(5),
      meal: l.meal,
      waste_percentage: l.waste_percentage,
      leftover: l.leftover_qty
    }));

  return (
    <div className="space-y-7">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-xl lg:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <Recycle className="w-6 h-6 text-slate-900" /> Food Waste Auditing & Reduction
            </h2>
            <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-indigo-100 text-indigo-600 border border-indigo-300">
              OPERATIONAL AUDIT
            </span>
          </div>
          <p className="text-xs text-slate-500">
            Identify repeat leftovers, adjust kitchen batch thresholds, and ensure zero-waste standards
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-slate-800/20 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" /> Log Waste Audit
        </button>
      </div>

      {/* ACTIONABLE WASTE INSIGHT CARDS (Per Prompt Section 9) */}
      <div className="p-5 rounded-2xl bg-slate-50/90 border border-slate-300/30 shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-blue-100 text-slate-900 border border-blue-200/60">
                ACTIONABLE WASTE INSIGHT
              </span>
              <span className="text-xs text-slate-500">Dinner Shift Pattern</span>
            </div>
            <h3 className="text-base font-bold text-slate-900">
              “Dinner leftovers have increased slightly during the last 3 days (+14 portions average).”
            </h3>
            <p className="text-xs text-slate-500">
              <strong className="text-slate-900">Recommendation:</strong> Consider reducing the dinner preparation buffer from 3.5% down to 2.2% for upcoming regular weeknights.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleApplyBufferAdjustment}
              className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-md shadow-slate-800/20"
            >
              {appliedBuffer ? (
                <>
                  <Check className="w-4 h-4" /> Dinner Buffer Adjusted (-1.3%)
                </>
              ) : (
                'Apply Recommended Buffer'
              )}
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total Recorded Leftover"
          value={`${metrics.total_leftover_kg} portions`}
          subtitle="Past 14 Days Aggregated"
          icon={Trash2}
          accentColor="slate"
        />
        <MetricCard
          title="Average Waste Ratio"
          value={`${metrics.avg_waste_pct}%`}
          subtitle="Campus Benchmark < 3.0%"
          icon={Scale}
          trend="-1.4% vs last month"
          trendPositive={true}
          accentColor="emerald"
        />
        <MetricCard
          title="Highest Waste Slot"
          value={metrics.highest_waste_meal}
          subtitle="Friday Afternoon Dip"
          icon={AlertTriangle}
          accentColor="amber"
        />
        <MetricCard
          title="Meals Saved by AI"
          value={`~${metrics.saved_meals_estimate}`}
          subtitle="Estimated vs Static Cooking"
          icon={TrendingDown}
          trend="Saved ₹72,400 in rations"
          trendPositive={true}
          accentColor="cyan"
        />
      </div>

      {/* Charts: 14-Day Waste Trend Area Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 p-6 rounded-2xl bg-slate-50/90 border border-slate-200 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 tracking-tight">
                Food Leftover Trend (% of Prepared Volume)
              </h3>
              <p className="text-xs text-slate-500">Aiming for university zero-waste certification (&lt;2.5%)</p>
            </div>
            <span className="text-xs text-slate-900 font-mono font-bold">Target: &lt; 2.5%</span>
          </div>

          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="wasteGrad2" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
                <XAxis dataKey="date" stroke="#64748B" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748B" fontSize={11} tickLine={false} domain={[0, 6]} />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-300 text-xs">
                          <p className="font-bold text-slate-900">{label}</p>
                          <p className="text-slate-900">Waste: {payload[0]?.value}%</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="waste_percentage"
                  stroke="#10B981"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#wasteGrad2)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Leftover Commodities */}
        <div className="lg:col-span-5 p-6 rounded-2xl bg-slate-50/90 border border-slate-200 shadow-xl flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 tracking-tight mb-1">
              Top Leftover Preparation Items
            </h3>
            <p className="text-xs text-slate-500 mb-3">
              Items most frequently returned to kitchen cold storage
            </p>

            <div className="space-y-2.5">
              {topItems.map((item, idx) => (
                <div
                  key={item.item}
                  className="p-2.5 rounded-xl bg-slate-50/80 border border-slate-200 flex items-center justify-between"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-5 h-5 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center text-xs font-bold">
                      {idx + 1}
                    </div>
                    <div>
                      <span className="text-xs font-bold text-slate-900 block">{item.item}</span>
                      <span className="text-[10px] text-slate-500">{item.frequency}</span>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-indigo-600 font-mono">{item.kg_wasted} kg</span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 p-3 rounded-xl bg-blue-100/40 border border-blue-200/40 text-[11px] text-slate-700">
            <strong>Action Trigger:</strong> Items with &gt; 25 kg return trigger an automatic recipe yield revision for kitchen staff.
          </div>
        </div>
      </div>

      {/* FILTERABLE & SEARCHABLE WASTE AUDIT TABLE */}
      <div className="rounded-2xl bg-slate-50/90 border border-slate-200 shadow-lg overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Search */}
          <div className="relative flex-1 max-w-sm">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search date, meal, item, or cause..."
              className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-700 focus:outline-none focus:border-slate-300"
            />
          </div>

          {/* Meal Filter Tabs */}
          <div className="flex items-center gap-2">
            <div className="inline-flex p-1 rounded-lg bg-slate-50 border border-slate-200 text-xs">
              {['All', 'Breakfast', 'Lunch', 'Dinner'].map((t) => (
                <button
                  key={t}
                  onClick={() => setFilterMeal(t)}
                  className={`px-3 py-1 rounded-md font-medium transition-colors cursor-pointer ${
                    filterMeal === t
                      ? 'bg-slate-100 text-slate-900 shadow-sm'
                      : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>

            {/* Sort Toggle */}
            <button
              onClick={() => {
                if (sortBy === 'waste_pct') {
                  setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc');
                } else {
                  setSortBy('waste_pct');
                  setSortOrder('desc');
                }
              }}
              className="px-2.5 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-500 hover:text-slate-900 flex items-center gap-1 cursor-pointer"
              title="Sort by Waste %"
            >
              <ArrowUpDown className="w-3.5 h-3.5 text-slate-900" />
              <span>Waste %</span>
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="text-slate-500 uppercase bg-slate-50/80 border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Meal</th>
                <th className="py-3 px-4 text-center">Prepared</th>
                <th className="py-3 px-4 text-center">Consumed</th>
                <th className="py-3 px-4 text-center">Leftover</th>
                <th className="py-3 px-4 text-center">Waste %</th>
                <th className="py-3 px-4">Primary Leftover Item</th>
                <th className="py-3 px-4">Attributed Cause</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-500">
              {filteredAndSortedLogs.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-500">
                    No matching waste records found.
                  </td>
                </tr>
              ) : (
                filteredAndSortedLogs.map((l) => (
                  <tr key={l.id} className="hover:bg-slate-100/30 transition-colors">
                    <td className="py-3 px-4 font-mono">{l.date}</td>
                    <td className="py-3 px-4 font-bold text-slate-900">{l.meal}</td>
                    <td className="py-3 px-4 text-center font-mono">{l.prepared_qty}</td>
                    <td className="py-3 px-4 text-center font-mono text-slate-700">{l.consumed_qty}</td>
                    <td className="py-3 px-4 text-center font-mono text-indigo-600 font-bold">{l.leftover_qty}</td>
                    <td className="py-3 px-4 text-center font-mono">
                      <span
                        className={`px-2 py-0.5 rounded font-bold ${
                          l.waste_percentage > 4.0
                            ? 'bg-black text-slate-900 border border-blue-200'
                            : 'bg-blue-100 text-slate-900 border border-blue-200'
                        }`}
                      >
                        {l.waste_percentage}%
                      </span>
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-500">{l.highest_waste_item || 'Mixed'}</td>
                    <td className="py-3 px-4 text-slate-500 max-w-xs truncate">{l.cause || 'Standard variance'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Log Waste Audit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-slate-50 border border-slate-300 rounded-2xl p-6 shadow-2xl relative">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 text-slate-500 hover:text-slate-900 p-1 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-slate-900 mb-1">Log Food Waste Audit</h3>
            <p className="text-xs text-slate-500 mb-4">Record weigh-scale findings at kitchen return counter</p>

            <form onSubmit={handleLogWaste} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-500 font-medium mb-1">Date</label>
                  <input
                    type="date"
                    required
                    value={modalDate}
                    onChange={(e) => setModalDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-slate-700"
                  />
                </div>
                <div>
                  <label className="block text-slate-500 font-medium mb-1">Meal</label>
                  <select
                    value={modalMeal}
                    onChange={(e) => setModalMeal(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-slate-700"
                  >
                    <option value="Breakfast">Breakfast</option>
                    <option value="Lunch">Lunch</option>
                    <option value="Dinner">Dinner</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-500 font-medium mb-1">Prepared</label>
                  <input
                    type="number"
                    value={modalPrepared}
                    onChange={(e) => setModalPrepared(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-slate-700 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-500 font-medium mb-1">Consumed</label>
                  <input
                    type="number"
                    value={modalConsumed}
                    onChange={(e) => setModalConsumed(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-slate-700 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-500 font-medium mb-1">Leftover</label>
                  <input
                    type="number"
                    value={modalLeftover}
                    onChange={(e) => setModalLeftover(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-slate-700 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-500 font-medium mb-1">Highest Waste Item</label>
                <input
                  type="text"
                  value={modalHighestItem}
                  onChange={(e) => setModalHighestItem(e.target.value)}
                  placeholder="e.g. Cooked Basmati Rice, Sambar"
                  className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-slate-700"
                />
              </div>

              <div>
                <label className="block text-slate-500 font-medium mb-1">Primary Cause</label>
                <input
                  type="text"
                  value={modalCause}
                  onChange={(e) => setModalCause(e.target.value)}
                  placeholder="e.g. Turnout drop, recipe portion overestimation"
                  className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-slate-700"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition-colors cursor-pointer mt-2"
              >
                Submit Waste Audit
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

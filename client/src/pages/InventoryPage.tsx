import React, { useState, useEffect } from 'react';
import {
  Boxes,
  AlertTriangle,
  CheckCircle2,
  Search,
  ShoppingCart,
  Edit2,
  RefreshCw,
  Info,
  Check,
  BellRing,
  ArrowUpDown,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { MetricCard } from '../components/ui/MetricCard';
import { StatusBadge } from '../components/ui/StatusBadge';
import { InventoryItem } from '../types';
import { api } from '../services/api';

export const InventoryPage: React.FC = () => {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterCategory, setFilterCategory] = useState('All');
  const [filterStatus, setFilterStatus] = useState<'All' | 'Critical' | 'Low Stock' | 'Healthy'>('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Alerts triggered
  const [alertSentId, setAlertSentId] = useState<string | null>(null);

  // Edit stock modal
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [newStock, setNewStock] = useState<number>(0);
  const [newPurchase, setNewPurchase] = useState<number>(0);

  useEffect(() => {
    loadInventory();
  }, []);

  const loadInventory = async () => {
    setLoading(true);
    try {
      const data = await api.getInventory();
      setItems(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const openEditModal = (item: InventoryItem) => {
    setSelectedItem(item);
    setNewStock(item.current_stock);
    setNewPurchase(item.recommended_purchase);
  };

  const handleUpdateStock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItem) return;

    try {
      await api.updateInventory(selectedItem.id, Number(newStock), Number(newPurchase));
      setSelectedItem(null);
      loadInventory();
    } catch (err) {
      console.error(err);
    }
  };

  const handleTriggerPurchaseAlert = (item: InventoryItem) => {
    setAlertSentId(item.id);
    setTimeout(() => setAlertSentId(null), 3000);
  };

  const categories = ['All', 'Grains', 'Pulses', 'Dairy', 'Vegetables', 'Oils', 'Spices', 'Poultry'];

  const filteredItems = items.filter((i) => {
    if (filterCategory !== 'All' && i.category !== filterCategory) return false;
    if (filterStatus !== 'All' && i.status !== filterStatus) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return i.item_name.toLowerCase().includes(q) || i.category.toLowerCase().includes(q);
    }
    return true;
  });

  const criticalCount = items.filter((i) => i.status === 'Critical').length;
  const lowCount = items.filter((i) => i.status === 'Low Stock').length;
  const healthyCount = items.filter((i) => i.status === 'Healthy').length;

  // Expected requirement calculation based on today's predicted meals (1,182 total across 3 meals)
  // Maps commodity to daily expected requirement
  const getExpectedRequirement = (item: InventoryItem) => {
    switch (item.item_name) {
      case 'Basmati Rice (Long Grain)':
        return { req: 85, status: 'Sufficient' };
      case 'Fresh Paneer':
        return { req: 36, status: 'Deficit (18 kg shortage)' };
      case 'Toor Dal (Arhar)':
        return { req: 40, status: 'Tight Margin' };
      case 'Fresh Tomatoes':
        return { req: 45, status: 'Deficit (5 kg shortage)' };
      case 'Fresh Milk (Double Toned)':
        return { req: 75, status: 'Deficit (20 L shortage)' };
      default:
        return { req: Math.round(item.daily_avg_consumption), status: 'Sufficient' };
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
      className="space-y-7"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-xl lg:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <Boxes className="w-6 h-6 text-indigo-500" /> Smart Inventory & Rations Sufficiency
            </h2>
            <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-indigo-100 text-indigo-600 border border-indigo-300">
              SUPPLY CHAIN
            </span>
          </div>
          <p className="text-xs text-slate-500">
            Answers: <em>"Do we have enough raw ingredients in storage for the AI-predicted meal demand?"</em>
          </p>
        </div>

        <button
          onClick={loadInventory}
          className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer border border-slate-300"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} /> Refresh Stock Levels
        </button>
      </div>

      {/* KPI Cards */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Tracked Commodities"
          value={items.length}
          subtitle="Essential Campus Rations"
          icon={Boxes}
          accentColor="slate"
        />
        <MetricCard
          title="Critical Shortage Alert"
          value={criticalCount}
          subtitle="Requires Immediate PO"
          icon={AlertTriangle}
          trend={criticalCount > 0 ? 'Paneer below threshold' : 'All clear'}
          trendPositive={criticalCount === 0}
          accentColor={criticalCount > 0 ? 'rose' : 'emerald'}
        />
        <MetricCard
          title="Low Stock Warnings"
          value={lowCount}
          subtitle="Approaching Reorder Line"
          icon={AlertTriangle}
          accentColor="amber"
        />
        <MetricCard
          title="Sufficient Inventory"
          value={healthyCount}
          subtitle="Safe for > 3 days demand"
          icon={CheckCircle2}
          accentColor="emerald"
          delay={0.3}
        />
      </motion.div>

      {/* CRITICAL DEMAND SUFFICIENCY BANNER (Per Prompt Section 10) */}
      <motion.div variants={itemVariants} className="p-6 rounded-3xl glass-panel border border-slate-600 shadow-[0_0_30px_-5px_rgba(225,29,72,0.15)] space-y-4">
        <div className="flex items-center justify-between border-b border-slate-200/80 pb-3">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-black text-slate-900 border border-blue-200">
              SUFFICIENCY AUDIT FOR TODAY'S FORECAST
            </span>
            <span className="text-xs text-slate-500">Target: 415 Lunch & 400 Dinner Meals</span>
          </div>
          <span className="text-xs font-bold text-slate-900">2 Items Require Immediate Purchase Alert</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-1">
          {/* Item 1: Rice (Sufficient) */}
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-slate-900 block">Basmati Rice</span>
              <span className="text-[11px] text-slate-500">Stock: 380 kg • Demand: 85 kg</span>
            </div>
            <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-blue-100 text-slate-900 border border-blue-200">
              🟢 Sufficient
            </span>
          </div>

          {/* Item 2: Paneer (Critical) */}
          <div className="p-3 rounded-xl bg-black border border-slate-600 flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-slate-900 block">Fresh Paneer</span>
              <span className="text-[11px] text-blue-700">Stock: 18 kg • Demand: 36 kg</span>
            </div>
            <button
              onClick={() => handleTriggerPurchaseAlert(items.find((i) => i.item_name === 'Fresh Paneer') || items[0])}
              className="px-2.5 py-1 rounded-lg bg-black0 hover:bg-blue-600 text-white text-[11px] font-bold transition-all cursor-pointer"
            >
              {alertSentId === 'inv_5' ? 'Alert Sent ✓' : 'CREATE ALERT'}
            </button>
          </div>

          {/* Item 3: Milk (Low Stock) */}
          <div className="p-3 rounded-xl bg-indigo-50 border border-indigo-300 flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-slate-900 block">Fresh Milk</span>
              <span className="text-[11px] text-indigo-700">Stock: 55 L • Demand: 75 L</span>
            </div>
            <button
              onClick={() => handleTriggerPurchaseAlert(items.find((i) => i.item_name.includes('Milk')) || items[0])}
              className="px-2.5 py-1 rounded-lg bg-indigo-500 hover:bg-amber-400 text-slate-900 text-[11px] font-bold transition-all cursor-pointer"
            >
              {alertSentId === 'inv_11' ? 'Alert Sent ✓' : 'CREATE ALERT'}
            </button>
          </div>
        </div>
      </motion.div>

      {/* FILTER & SEARCH BAR */}
      <motion.div variants={itemVariants} className="p-4 rounded-3xl glass-panel border border-slate-200 shadow-lg flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        {/* Search */}
        <div className="relative flex-1 max-w-sm">
          <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search ingredient (e.g. Rice, Paneer)..."
            className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-700 focus:outline-none focus:border-indigo-400"
          />
        </div>

        {/* Status Filters */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="inline-flex p-1 rounded-lg bg-slate-50 border border-slate-200 text-xs">
            {(['All', 'Critical', 'Low Stock', 'Healthy'] as const).map((s) => (
              <button
                key={s}
                onClick={() => setFilterStatus(s)}
                className={`px-3 py-1 rounded-md font-semibold transition-colors cursor-pointer ${
                  filterStatus === s
                    ? 'bg-slate-100 text-slate-900 shadow-sm'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Categories Tabs */}
      <motion.div variants={itemVariants} className="flex flex-wrap gap-1.5 text-xs">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setFilterCategory(cat)}
            className={`px-3 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
              filterCategory === cat
                ? 'bg-slate-100 text-slate-900 border border-slate-300/40'
                : 'text-slate-500 hover:text-slate-900 bg-slate-50/60 border border-slate-200'
            }`}
          >
            {cat}
          </button>
        ))}
      </motion.div>

      {/* Full Inventory Table */}
      <motion.div variants={itemVariants} className="rounded-3xl glass-panel border border-slate-200 shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="text-slate-500 uppercase bg-slate-50/80 border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Ingredient</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4 text-center">Current Stock</th>
                <th className="py-3 px-4 text-center">Predicted Requirement</th>
                <th className="py-3 px-4 text-center">Sufficiency Status</th>
                <th className="py-3 px-4 text-center">Recommended Purchase</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-500">
              {filteredItems.map((item) => {
                const reqData = getExpectedRequirement(item);
                const isShortage = item.status === 'Critical' || item.status === 'Low Stock';
                return (
                  <tr key={item.id} className="hover:bg-slate-100/30 transition-colors">
                    <td className="py-3 px-4 font-bold text-slate-900">{item.item_name}</td>
                    <td className="py-3 px-4 text-slate-500">{item.category}</td>
                    <td className="py-3 px-4 text-center font-mono font-bold text-slate-900">
                      {item.current_stock} <span className="text-[10px] text-slate-500">{item.unit}</span>
                    </td>
                    <td className="py-3 px-4 text-center font-mono text-indigo-500">
                      {reqData.req} {item.unit}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <StatusBadge status={item.status} />
                    </td>
                    <td className="py-3 px-4 text-center font-mono font-bold">
                      {item.recommended_purchase > 0 ? (
                        <span className="text-slate-900">+{item.recommended_purchase} {item.unit}</span>
                      ) : (
                        <span className="text-slate-500">—</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {isShortage && (
                          <button
                            onClick={() => handleTriggerPurchaseAlert(item)}
                            className="px-2.5 py-1 rounded-md bg-blue-100 hover:bg-blue-100 text-slate-900 border border-slate-600 text-[11px] font-bold cursor-pointer transition-colors"
                          >
                            {alertSentId === item.id ? 'Sent ✓' : 'Alert PO'}
                          </button>
                        )}
                        <button
                          onClick={() => openEditModal(item)}
                          className="p-1 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors cursor-pointer"
                          title="Edit Stock"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Edit Stock Modal */}
      <AnimatePresence>
      {selectedItem && (
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
              onClick={() => setSelectedItem(null)}
              className="absolute top-4 right-4 text-slate-500 hover:text-slate-900 p-1 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-slate-900 mb-1">Adjust Storage Stock</h3>
            <p className="text-xs text-slate-500 mb-4">{selectedItem.item_name}</p>

            <form onSubmit={handleUpdateStock} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-500 font-medium mb-1">
                  Current Stock on Hand ({selectedItem.unit})
                </label>
                <input
                  type="number"
                  step="0.5"
                  required
                  value={newStock}
                  onChange={(e) => setNewStock(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-slate-700 font-mono text-base"
                />
              </div>

              <div>
                <label className="block text-slate-500 font-medium mb-1">
                  Purchase Order Quantity ({selectedItem.unit})
                </label>
                <input
                  type="number"
                  step="1"
                  value={newPurchase}
                  onChange={(e) => setNewPurchase(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-slate-700 font-mono"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm transition-all cursor-pointer mt-2 shadow-[0_0_20px_-5px_rgba(16,185,129,0.4)]"
              >
                Update Commodity Level
              </button>
            </form>
          </motion.div>
        </motion.div>
      )}
      </AnimatePresence>
    </motion.div>
  );
};

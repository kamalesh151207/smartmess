import React, { useState, useEffect } from 'react';
import {
  Settings,
  Shield,
  Sliders,
  Bell,
  Database,
  Building,
  Save,
  CheckCircle2,
  RefreshCw,
  Sparkles
} from 'lucide-react';
import { api } from '../services/api';

export const SettingsPage: React.FC = () => {
  const [settings, setSettings] = useState<Record<string, string>>({
    safety_buffer_percent: '3.5',
    hostel_name: 'Aryabhata Central Dining Hall',
    total_capacity: '1400',
    current_registered_students: '1215',
    mess_manager: 'Prof. R. Venkatesh / Dr. K. Sharma',
    active_academic_term: 'Autumn Semester 2026',
    notifications_email: 'true',
    notifications_critical_alerts: 'true'
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [resetting, setResetting] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setLoading(true);
    try {
      const data = await api.getSettings();
      if (Object.keys(data).length > 0) {
        setSettings((prev) => ({ ...prev, ...data }));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaveSuccess(false);
    try {
      await api.saveSettings(settings);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleResetDemoData = async () => {
    if (!window.confirm('Reset all demo records back to baseline hostel dataset?')) return;
    setResetting(true);
    try {
      await api.reloadDemoData();
      alert('Demo data successfully re-seeded!');
      window.location.reload();
    } catch (err) {
      console.error(err);
    } finally {
      setResetting(false);
    }
  };

  return (
    <div className="space-y-8 max-w-4xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-xl lg:text-2xl font-bold text-slate-50 tracking-tight flex items-center gap-2">
              <Settings className="w-6 h-6 text-slate-400" /> Platform Configuration & Operational Settings
            </h2>
            <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-indigo-100 text-indigo-600 border border-indigo-300">
              DEMO DATA
            </span>
          </div>
          <p className="text-xs text-slate-400">
            Tune algorithmic safety buffers, dining hall parameters, and alerting thresholds
          </p>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6 text-xs">
        {/* Safety Buffer Tuning Card */}
        <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-700/30 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Sliders className="w-5 h-5 text-slate-50" />
              <h3 className="text-sm font-bold text-slate-50 tracking-tight">
                AI Recommendation Safety Buffer Configuration
              </h3>
            </div>
            <span className="font-mono text-slate-50 font-bold text-sm">
              +{settings.safety_buffer_percent || '3.5'}%
            </span>
          </div>

          <p className="text-slate-400 text-xs leading-relaxed">
            The safety buffer sets the extra headroom added to raw ML predicted demand to protect against unanticipated turnout bursts without causing massive overproduction.
          </p>

          <div>
            <div className="flex justify-between font-medium text-slate-400 mb-1.5">
              <span>Dynamic Headroom Ratio</span>
              <span className="text-slate-50 font-mono font-bold">
                {settings.safety_buffer_percent || '3.5'}% recommended margin
              </span>
            </div>
            <input
              type="range"
              min="1.0"
              max="8.0"
              step="0.5"
              value={settings.safety_buffer_percent || '3.5'}
              onChange={(e) =>
                setSettings({ ...settings, safety_buffer_percent: e.target.value })
              }
              className="w-full accent-slate-800 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400 mt-1 font-mono">
              <span>1.0% (Aggressive zero-waste)</span>
              <span>3.5% (SIH Gold Standard)</span>
              <span>8.0% (Risk-averse / festivals)</span>
            </div>
          </div>
        </div>

        {/* Mess Infrastructure Information */}
        <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
            <Building className="w-5 h-5 text-indigo-500" />
            <h3 className="text-sm font-bold text-slate-50 tracking-tight">
              Hostel Facility Parameters
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-400 font-medium mb-1">Central Dining Hall Name</label>
              <input
                type="text"
                value={settings.hostel_name || ''}
                onChange={(e) => setSettings({ ...settings, hostel_name: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-200"
              />
            </div>

            <div>
              <label className="block text-slate-400 font-medium mb-1">Active Academic Term</label>
              <input
                type="text"
                value={settings.active_academic_term || ''}
                onChange={(e) => setSettings({ ...settings, active_academic_term: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-200"
              />
            </div>

            <div>
              <label className="block text-slate-400 font-medium mb-1">Total Seating Capacity</label>
              <input
                type="number"
                value={settings.total_capacity || '1400'}
                onChange={(e) => setSettings({ ...settings, total_capacity: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-200 font-mono"
              />
            </div>

            <div>
              <label className="block text-slate-400 font-medium mb-1">Currently Registered Students</label>
              <input
                type="number"
                value={settings.current_registered_students || '1215'}
                onChange={(e) => setSettings({ ...settings, current_registered_students: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-200 font-mono"
              />
            </div>
          </div>
        </div>

        {/* Notifications & System Preferences */}
        <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
            <Bell className="w-5 h-5 text-indigo-600" />
            <h3 className="text-sm font-bold text-slate-50 tracking-tight">
              Operational Alert Subscriptions
            </h3>
          </div>

          <div className="space-y-3">
            <label className="flex items-center justify-between p-3 rounded-xl bg-slate-900/60 border border-slate-800 cursor-pointer">
              <div>
                <span className="font-semibold text-slate-200 block">Critical Inventory Depletion Alerts</span>
                <span className="text-[11px] text-slate-400">Notify kitchen warden when milk/paneer stock drops below 24-hr demand</span>
              </div>
              <input
                type="checkbox"
                defaultChecked
                className="rounded accent-slate-800 w-4 h-4"
              />
            </label>

            <label className="flex items-center justify-between p-3 rounded-xl bg-slate-900/60 border border-slate-800 cursor-pointer">
              <div>
                <span className="font-semibold text-slate-200 block">Exam Schedule Turnout Surge Warnings</span>
                <span className="text-[11px] text-slate-400">Trigger automatic buffer increment (+5%) during announced exam weeks</span>
              </div>
              <input
                type="checkbox"
                defaultChecked
                className="rounded accent-slate-800 w-4 h-4"
              />
            </label>
          </div>
        </div>

        {/* Save Bar */}
        <div className="flex items-center justify-between pt-2">
          <div>
            {saveSuccess && (
              <span className="text-slate-50 font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4" /> Settings updated successfully!
              </span>
            )}
          </div>
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 rounded-xl bg-slate-950 hover:bg-slate-800 text-slate-50 font-bold text-xs flex items-center gap-2 shadow-lg shadow-slate-800/20 transition-all cursor-pointer"
          >
            <Save className="w-4 h-4" /> {saving ? 'Saving...' : 'Save Configuration'}
          </button>
        </div>
      </form>

      {/* Data Management & Seed Reset */}
      <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 shadow-xl space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Database className="w-5 h-5 text-slate-400" />
            <h3 className="text-sm font-bold text-slate-50 tracking-tight">
              Evaluation Data Management
            </h3>
          </div>
          <span className="text-[10px] text-slate-400 font-mono">SQLite Local DB</span>
        </div>
        <p className="text-xs text-slate-400">
          Reset all attendance records, meal orders, food waste audits, and inventory levels back to clean SIH evaluation state.
        </p>
        <button
          type="button"
          onClick={handleResetDemoData}
          disabled={resetting}
          className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-blue-700 border border-slate-700 text-xs font-semibold flex items-center gap-2 transition-colors cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${resetting ? 'animate-spin' : ''}`} />
          {resetting ? 'Reseeding SQLite DB...' : 'Reset & Seed Demo Data'}
        </button>
      </div>
    </div>
  );
};

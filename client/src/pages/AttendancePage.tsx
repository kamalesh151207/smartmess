import React, { useState, useEffect } from 'react';
import {
  Users,
  Search,
  Filter,
  Plus,
  FileSpreadsheet,
  Calendar,
  CheckCircle2,
  XCircle,
  X,
  UploadCloud,
  Check,
  Radio,
  ShieldCheck,
  AlertTriangle,
  FileText,
  Activity,
  Layers,
  ArrowRight,
  Database,
  Workflow,
  CheckCircle
} from 'lucide-react';
import { MetricCard } from '../components/ui/MetricCard';
import { StatusBadge } from '../components/ui/StatusBadge';
import { AttendanceRecord, AttendanceStats, DataQualityReport, IngestionSummary } from '../types';
import { api } from '../services/api';

export const AttendancePage: React.FC = () => {
  const [date, setDate] = useState('2026-09-04');
  const [meal, setMeal] = useState('All');
  const [hostel, setHostel] = useState('All');
  const [source, setSource] = useState('All');
  const [search, setSearch] = useState('');

  const [stats, setStats] = useState<AttendanceStats>({
    total_students: 1215,
    breakfast_attendance: 980,
    lunch_attendance: 1045,
    dinner_attendance: 1110
  });
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [dataQuality, setDataQuality] = useState<DataQualityReport | null>(null);
  const [loading, setLoading] = useState(true);

  // Manual Add Modal state
  const [showAddModal, setShowAddModal] = useState(false);
  const [newStudentId, setNewStudentId] = useState('');
  const [newStudentName, setNewStudentName] = useState('');
  const [newHostel, setNewHostel] = useState('Aryabhata North');
  const [newRoom, setNewRoom] = useState('A-201');
  const [newMeal, setNewMeal] = useState('Lunch');
  const [newStatus, setNewStatus] = useState<'Present' | 'Absent'>('Present');
  const [addError, setAddError] = useState<string | null>(null);

  // Bulk Ingestion Modal state
  const [showCsvModal, setShowCsvModal] = useState(false);
  const [csvText, setCsvText] = useState(
    "student_id,student_name,hostel,room,date,meal,status\nSTU-2024-031,Rohan Verma,Aryabhata North,A-301,2026-09-04,Lunch,Present\nSTU-2024-032,Priya Nair,Kalpana Chawla,B-205,2026-09-04,Lunch,Present\nSTU-2024-033,Aditya Joshi,Sarabhai West,C-104,2026-09-04,Lunch,Present\nSTU-2024-001,Aarav Sharma,Aryabhata North,A-204,2026-09-04,Lunch,Present"
  );
  const [ingestionResult, setIngestionResult] = useState<{
    summary: IngestionSummary;
    errors: Array<{ row: number; student_id: string; error: string }>;
  } | null>(null);
  const [isIngesting, setIsIngesting] = useState(false);

  useEffect(() => {
    loadData();
  }, [date, meal, hostel, source, search]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [attRes, dqRes] = await Promise.all([
        api.getAttendance({
          date: date || undefined,
          meal: meal !== 'All' ? meal : undefined,
          hostel: hostel !== 'All' ? hostel : undefined,
          source: source !== 'All' ? source : undefined,
          search: search || undefined
        }),
        api.getDataQuality()
      ]);
      setStats(attRes.stats);
      setRecords(attRes.records);
      setDataQuality(dqRes);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleManualAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStudentId || !newStudentName) return;
    setAddError(null);

    try {
      const res = await api.markAttendance({
        date,
        meal: newMeal,
        student_id: newStudentId,
        student_name: newStudentName,
        hostel: newHostel,
        room: newRoom,
        status: newStatus,
        source: 'manual'
      });

      if (!res.success && res.error) {
        setAddError(res.error.message || 'Duplicate swipe or validation error');
        return;
      }

      setShowAddModal(false);
      setNewStudentId('');
      setNewStudentName('');
      loadData();
    } catch (err: any) {
      setAddError(err.message || 'Error recording attendance');
    }
  };

  const handleRunIngestion = async () => {
    setIsIngesting(true);
    try {
      const res = await api.ingestBulkAttendance(csvText, 'turnstile_biometric', 'rfid_turnstile_batch.csv');
      if (res.success) {
        setIngestionResult({
          summary: res.summary,
          errors: res.errors
        });
        loadData();
      }
    } catch (err: any) {
      alert(`Ingestion failed: ${err.message}`);
    } finally {
      setIsIngesting(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-xl lg:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <Users className="w-6 h-6 text-indigo-600" /> Student Attendance Operations & Ingestion Pipeline
            </h2>
            <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-200">
              LIVE DATABASE
            </span>
          </div>
          <p className="text-xs text-slate-500">
            Biometric RFID dining turnstiles and manual check-in points synchronized with deduplication pipeline.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              setIngestionResult(null);
              setShowCsvModal(true);
            }}
            className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer border border-slate-300 shadow-sm"
          >
            <FileSpreadsheet className="w-4 h-4 text-indigo-600" /> Bulk CSV Ingestion
          </button>
          <button
            onClick={() => {
              setAddError(null);
              setShowAddModal(true);
            }}
            className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Add Attendance
          </button>
        </div>
      </div>

      {/* Attendance Pipeline Visualization Banner (Section 8) */}
      <div className="p-6 rounded-2xl bg-gradient-to-br from-slate-900 to-indigo-950 text-white shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h3 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
            <Workflow className="w-4 h-4 text-indigo-400" /> Attendance Data Collection & Ingestion Pipeline Architecture
          </h3>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-900 text-indigo-300 border border-indigo-700">
            Data Engineering Flow
          </span>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700 font-mono text-xs text-slate-200">
          <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
            <span className="px-2 py-1 rounded bg-slate-900 text-cyan-300 font-bold">BIOMETRIC / GATE LOGS</span>
            <span>→</span>
            <span className="px-2 py-1 rounded bg-slate-900 text-indigo-300 font-bold">CSV / REST INGESTION</span>
            <span>→</span>
            <span className="px-2 py-1 rounded bg-slate-900 text-blue-300 font-bold">SCHEMA VALIDATION</span>
            <span>→</span>
            <span className="px-2 py-1 rounded bg-slate-900 text-amber-300 font-bold">TIMESTAMP NORMALIZATION</span>
            <span>→</span>
            <span className="px-2 py-1 rounded bg-slate-900 text-rose-300 font-bold">DUPLICATE DETECTION</span>
            <span>→</span>
            <span className="px-2 py-1 rounded bg-slate-900 text-emerald-300 font-bold">DATA QUALITY CHECK</span>
            <span>→</span>
            <span className="px-2 py-1 rounded bg-slate-900 text-purple-300 font-bold">SQLITE DATABASE</span>
            <span>→</span>
            <span className="px-2 py-1 rounded bg-slate-900 text-cyan-300 font-bold">FEATURE MATRIX</span>
            <span>→</span>
            <span className="px-2 py-1 rounded bg-emerald-900 text-emerald-200 font-bold">ML DEMAND FORECAST</span>
          </div>
        </div>
      </div>

      {/* Attendance Data Quality Scorecard & Checks (Section 9) */}
      {dataQuality && (
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-indigo-600" />
              <div>
                <h3 className="text-sm font-bold text-slate-900 tracking-tight">
                  ATTENDANCE DATA QUALITY & INTEGRITY DIAGNOSTICS
                </h3>
                <p className="text-xs text-slate-500">{dataQuality.status_message}</p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-auto">
              <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full border flex items-center gap-1.5 ${
                dataQuality.status === 'GOOD'
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : dataQuality.status === 'WARNING'
                  ? 'bg-amber-50 text-amber-700 border-amber-200'
                  : 'bg-rose-50 text-rose-700 border-rose-200'
              }`}>
                <span className={`w-2 h-2 rounded-full ${
                  dataQuality.status === 'GOOD' ? 'bg-emerald-500' : dataQuality.status === 'WARNING' ? 'bg-amber-500' : 'bg-rose-500'
                }`} />
                QUALITY: {dataQuality.status}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-slate-400 block text-[11px] mb-0.5">Total Records</span>
              <span className="text-base font-bold text-slate-900 font-mono">{dataQuality.metrics.total_attendance_records}</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-slate-400 block text-[11px] mb-0.5">Records Today</span>
              <span className="text-base font-bold text-indigo-600 font-mono">{dataQuality.metrics.records_today}</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-slate-400 block text-[11px] mb-0.5">Missing Values</span>
              <span className="text-base font-bold text-emerald-600 font-mono">{dataQuality.metrics.missing_values_count} (0.0%)</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-slate-400 block text-[11px] mb-0.5">Duplicates Blocked</span>
              <span className="text-base font-bold text-blue-600 font-mono">{dataQuality.metrics.duplicates_intercepted}</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-slate-400 block text-[11px] mb-0.5">Coverage Rate</span>
              <span className="text-base font-bold text-slate-900 font-mono">{dataQuality.metrics.attendance_coverage_percent}%</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-slate-400 block text-[11px] mb-0.5">Data Freshness</span>
              <span className="text-base font-bold text-slate-900 font-mono">{dataQuality.metrics.data_freshness}</span>
            </div>
          </div>

          {/* Implemented Data Quality Checks Explanation (Section 9) */}
          <div className="border-t border-slate-100 pt-3">
            <span className="text-[11px] font-bold text-slate-700 block mb-1.5">Automated Active Ingestion Quality Checks:</span>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-[11px] text-slate-600">
              <div className="flex items-center gap-1.5">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                <span>Missing required fields validation</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                <span>ISO 8601 malformed timestamp check</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                <span>Unique (student_id, date, meal) deduplication</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                <span>Invalid student ID format check</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                <span>Invalid meal slot type validation</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                <span>Malformed CSV row rejection & audit logging</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total Registered Students"
          value={stats.total_students.toLocaleString()}
          subtitle="Campus Dining Hall Pool: 1,400"
          icon={Users}
          accentColor="slate"
        />
        <MetricCard
          title="Breakfast Turnout"
          value={stats.breakfast_attendance.toLocaleString()}
          subtitle={`${stats.breakfast_rate || 80.6}% Turnout Rate`}
          icon={Users}
          accentColor="cyan"
        />
        <MetricCard
          title="Lunch Turnout"
          value={stats.lunch_attendance.toLocaleString()}
          subtitle={`${stats.lunch_rate || 86.0}% Turnout Rate`}
          icon={Users}
          accentColor="emerald"
        />
        <MetricCard
          title="Dinner Turnout"
          value={stats.dinner_attendance.toLocaleString()}
          subtitle={`${stats.dinner_rate || 91.3}% Turnout Rate`}
          icon={Users}
          accentColor="amber"
        />
      </div>

      {/* Filter Toolbar */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        <div className="flex-1 flex flex-col sm:flex-row flex-wrap gap-2.5">
          {/* Search */}
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search student name, ID or hostel..."
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Date */}
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 focus:outline-none focus:border-indigo-500"
          />

          {/* Meal Filter */}
          <select
            value={meal}
            onChange={(e) => setMeal(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 focus:outline-none focus:border-indigo-500"
          >
            <option value="All">All Meals</option>
            <option value="Breakfast">Breakfast</option>
            <option value="Lunch">Lunch</option>
            <option value="Dinner">Dinner</option>
          </select>

          {/* Hostel Filter */}
          <select
            value={hostel}
            onChange={(e) => setHostel(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 focus:outline-none focus:border-indigo-500"
          >
            <option value="All">All Hostels</option>
            <option value="Aryabhata North">Aryabhata North</option>
            <option value="Kalpana Chawla">Kalpana Chawla</option>
            <option value="Ramanujan South">Ramanujan South</option>
            <option value="Sarabhai West">Sarabhai West</option>
          </select>

          {/* Source Filter */}
          <select
            value={source}
            onChange={(e) => setSource(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 focus:outline-none focus:border-indigo-500"
          >
            <option value="All">All Ingestion Sources</option>
            <option value="biometric_turnstile">Biometric Turnstile</option>
            <option value="qr">Student QR Swipe</option>
            <option value="manual">Manual Admin Entry</option>
            <option value="import">CSV Bulk Import</option>
          </select>
        </div>
      </div>

      {/* Attendance Roster Table */}
      <div className="rounded-2xl bg-white border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span>Showing {records.length} attendance records</span>
          <span className="font-mono text-[11px] text-indigo-600">Deduplication constraint active</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="text-slate-500 uppercase bg-slate-50 border-b border-slate-200 font-semibold">
              <tr>
                <th className="py-3 px-4">Student ID</th>
                <th className="py-3 px-4">Student Name</th>
                <th className="py-3 px-4">Hostel / Room</th>
                <th className="py-3 px-4">Meal Slot</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Source</th>
                <th className="py-3 px-4">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {loading ? (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-slate-400">
                    Loading attendance records...
                  </td>
                </tr>
              ) : records.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-slate-400">
                    No matching attendance records found for selected filters.
                  </td>
                </tr>
              ) : (
                records.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-4 font-mono text-indigo-600 font-semibold">{r.student_id}</td>
                    <td className="py-3 px-4 font-bold text-slate-900">{r.student_name}</td>
                    <td className="py-3 px-4 text-slate-500">{r.hostel} {r.room ? `(${r.room})` : ''}</td>
                    <td className="py-3 px-4 font-medium text-slate-800">{r.meal}</td>
                    <td className="py-3 px-4">
                      <StatusBadge status={r.status} />
                    </td>
                    <td className="py-3 px-4 font-mono text-[11px] text-slate-500">
                      <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                        {r.source || 'turnstile'}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-500">{r.marked_at}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Manual Add Attendance */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white border border-slate-200 rounded-2xl p-6 shadow-2xl relative">
            <button
              onClick={() => setShowAddModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-slate-900 mb-1">Record Attendance Entry</h3>
            <p className="text-xs text-slate-500 mb-4">Manual counter check-in or turnstile override</p>

            {addError && (
              <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                <span>{addError}</span>
              </div>
            )}

            <form onSubmit={handleManualAdd} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 font-medium mb-1">Student ID</label>
                  <input
                    type="text"
                    required
                    value={newStudentId}
                    onChange={(e) => setNewStudentId(e.target.value)}
                    placeholder="e.g. STU-2024-035"
                    className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-medium mb-1">Student Name</label>
                  <input
                    type="text"
                    required
                    value={newStudentName}
                    onChange={(e) => setNewStudentName(e.target.value)}
                    placeholder="e.g. Vikramaditya"
                    className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 font-medium mb-1">Hostel Block</label>
                  <select
                    value={newHostel}
                    onChange={(e) => setNewHostel(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-slate-900"
                  >
                    <option value="Aryabhata North">Aryabhata North</option>
                    <option value="Kalpana Chawla">Kalpana Chawla</option>
                    <option value="Ramanujan South">Ramanujan South</option>
                    <option value="Sarabhai West">Sarabhai West</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-600 font-medium mb-1">Meal Slot</label>
                  <select
                    value={newMeal}
                    onChange={(e) => setNewMeal(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-slate-900"
                  >
                    <option value="Breakfast">Breakfast</option>
                    <option value="Lunch">Lunch</option>
                    <option value="Dinner">Dinner</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-600 font-medium mb-1">Status</label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value as 'Present' | 'Absent')}
                  className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-slate-900"
                >
                  <option value="Present">Present (Checked In)</option>
                  <option value="Absent">Absent</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-colors cursor-pointer mt-2"
              >
                Submit Attendance Record
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Real Bulk CSV Ingestion Pipeline */}
      {showCsvModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-xl bg-white border border-slate-200 rounded-2xl p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setShowCsvModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-slate-900 mb-1 flex items-center gap-2">
              <FileSpreadsheet className="w-5 h-5 text-indigo-600" /> Attendance Data Ingestion Pipeline
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Ingest turnstile biometric RFID logs with automatic schema validation and duplicate suppression.
            </p>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">CSV Log Content (Headers required):</label>
                <textarea
                  rows={6}
                  value={csvText}
                  onChange={(e) => setCsvText(e.target.value)}
                  className="w-full p-3 rounded-xl bg-slate-900 text-slate-200 font-mono text-xs focus:outline-none focus:border-indigo-500 border border-slate-800"
                />
              </div>

              <button
                onClick={handleRunIngestion}
                disabled={isIngesting}
                className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer shadow"
              >
                <UploadCloud className={`w-4 h-4 ${isIngesting ? 'animate-bounce' : ''}`} />
                <span>{isIngesting ? 'Executing Pipeline Validation...' : 'Run CSV Ingestion Pipeline'}</span>
              </button>

              {/* Ingestion Results Breakdown */}
              {ingestionResult && (
                <div className="space-y-3 border-t border-slate-200 pt-4">
                  <h4 className="font-bold text-slate-900 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Ingestion Summary Report
                  </h4>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
                    <div className="p-2 rounded-lg bg-slate-50 border border-slate-200">
                      <span className="text-slate-400 block text-[10px]">Total Rows</span>
                      <span className="font-bold text-slate-900 font-mono text-sm">{ingestionResult.summary.total_rows}</span>
                    </div>
                    <div className="p-2 rounded-lg bg-emerald-50 border border-emerald-200">
                      <span className="text-emerald-600 block text-[10px]">Inserted</span>
                      <span className="font-bold text-emerald-800 font-mono text-sm">{ingestionResult.summary.inserted_records}</span>
                    </div>
                    <div className="p-2 rounded-lg bg-blue-50 border border-blue-200">
                      <span className="text-blue-600 block text-[10px]">Duplicates Blocked</span>
                      <span className="font-bold text-blue-800 font-mono text-sm">{ingestionResult.summary.duplicates_filtered}</span>
                    </div>
                    <div className="p-2 rounded-lg bg-rose-50 border border-rose-200">
                      <span className="text-rose-600 block text-[10px]">Invalid Rows</span>
                      <span className="font-bold text-rose-800 font-mono text-sm">{ingestionResult.summary.invalid_rows}</span>
                    </div>
                  </div>

                  {ingestionResult.errors.length > 0 && (
                    <div className="space-y-1">
                      <span className="font-semibold text-slate-700 text-[11px]">Validation & Deduplication Audit Log:</span>
                      <div className="max-h-32 overflow-y-auto space-y-1 bg-slate-50 p-2 rounded-lg border border-slate-200 text-[11px] font-mono">
                        {ingestionResult.errors.map((err, i) => (
                          <div key={i} className="text-slate-600 flex items-start gap-1">
                            <span className="text-rose-600 font-bold">• Row {err.row} ({err.student_id}):</span>
                            <span>{err.error}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

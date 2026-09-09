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
  Check
} from 'lucide-react';
import { MetricCard } from '../components/ui/MetricCard';
import { StatusBadge } from '../components/ui/StatusBadge';
import { AttendanceRecord, AttendanceStats } from '../types';
import { api } from '../services/api';

export const AttendancePage: React.FC = () => {
  const [date, setDate] = useState('2026-09-04');
  const [meal, setMeal] = useState('All');
  const [hostel, setHostel] = useState('All');
  const [search, setSearch] = useState('');

  const [stats, setStats] = useState<AttendanceStats>({
    total_students: 1215,
    breakfast_attendance: 980,
    lunch_attendance: 1045,
    dinner_attendance: 1110
  });
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);

  // Manual Add Modal state
  const [showAddModal, setShowAddModal] = useState(false);
  const [newStudentId, setNewStudentId] = useState('');
  const [newStudentName, setNewStudentName] = useState('');
  const [newHostel, setNewHostel] = useState('Aryabhata North');
  const [newMeal, setNewMeal] = useState('Lunch');
  const [newStatus, setNewStatus] = useState<'Present' | 'Absent'>('Present');

  // CSV Modal state
  const [showCsvModal, setShowCsvModal] = useState(false);
  const [csvSuccess, setCsvSuccess] = useState(false);

  useEffect(() => {
    loadAttendance();
  }, [date, meal, hostel, search]);

  const loadAttendance = async () => {
    setLoading(true);
    try {
      const res = await api.getAttendance({
        date,
        meal: meal !== 'All' ? meal : undefined,
        hostel: hostel !== 'All' ? hostel : undefined,
        search: search || undefined
      });
      setStats(res.stats);
      setRecords(res.records);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleManualAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStudentId || !newStudentName) return;

    try {
      await api.markAttendance({
        date,
        meal: newMeal,
        student_id: newStudentId,
        student_name: newStudentName,
        hostel: newHostel,
        status: newStatus
      });
      setShowAddModal(false);
      setNewStudentId('');
      setNewStudentName('');
      loadAttendance();
    } catch (err) {
      console.error(err);
    }
  };

  const handleSimulateCsv = () => {
    setCsvSuccess(true);
    setTimeout(() => {
      setCsvSuccess(false);
      setShowCsvModal(false);
      loadAttendance();
    }, 1200);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-xl lg:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <Users className="w-6 h-6 text-slate-900" /> Student Attendance Operations
            </h2>
            <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-indigo-100 text-indigo-600 border border-indigo-300">
              DEMO DATA
            </span>
          </div>
          <p className="text-xs text-slate-500">
            Biometric & RFID entry points synced with dining hall counters
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowCsvModal(true)}
            className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer border border-slate-300"
          >
            <FileSpreadsheet className="w-4 h-4 text-indigo-500" /> Import CSV
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-slate-800/20 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Add Attendance
          </button>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total Registered Students"
          value={stats.total_students.toLocaleString()}
          subtitle="Campus Hall Capacity: 1,400"
          icon={Users}
          accentColor="slate"
        />
        <MetricCard
          title="Breakfast Turnout"
          value={stats.breakfast_attendance.toLocaleString()}
          subtitle="80.6% Check-in rate"
          icon={Users}
          accentColor="cyan"
        />
        <MetricCard
          title="Lunch Turnout"
          value={stats.lunch_attendance.toLocaleString()}
          subtitle="86.0% Check-in rate"
          icon={Users}
          accentColor="emerald"
        />
        <MetricCard
          title="Dinner Turnout"
          value={stats.dinner_attendance.toLocaleString()}
          subtitle="91.3% Check-in rate"
          icon={Users}
          accentColor="amber"
        />
      </div>

      {/* Filter Toolbar */}
      <div className="p-4 rounded-2xl bg-slate-50/90 border border-slate-200 shadow-lg flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
        <div className="flex-1 flex flex-col sm:flex-row gap-3">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search student name or ID..."
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 focus:outline-none focus:border-slate-300"
            />
          </div>

          {/* Date */}
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 focus:outline-none focus:border-slate-300"
          />

          {/* Meal Filter */}
          <select
            value={meal}
            onChange={(e) => setMeal(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 focus:outline-none focus:border-slate-300"
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
            className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 focus:outline-none focus:border-slate-300"
          >
            <option value="All">All Hostels</option>
            <option value="Aryabhata North">Aryabhata North</option>
            <option value="Kalpana Chawla">Kalpana Chawla</option>
            <option value="Ramanujan South">Ramanujan South</option>
            <option value="Sarabhai West">Sarabhai West</option>
          </select>
        </div>
      </div>

      {/* Attendance Roster Table */}
      <div className="rounded-2xl bg-slate-50/90 border border-slate-200 shadow-lg overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <span>Showing {records.length} attendance records</span>
          <span className="font-mono text-[11px]">Last biometric sync: 2 mins ago</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="text-slate-500 uppercase bg-slate-50/80 border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Student ID</th>
                <th className="py-3 px-4">Student Name</th>
                <th className="py-3 px-4">Hostel Block</th>
                <th className="py-3 px-4">Meal</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Time Recorded</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-500">
              {loading ? (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-slate-500">
                    Loading attendance records...
                  </td>
                </tr>
              ) : records.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-slate-500">
                    No matching attendance logs found for selected filters.
                  </td>
                </tr>
              ) : (
                records.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-100/40 transition-colors">
                    <td className="py-3 px-4 font-mono text-indigo-500 font-semibold">{r.student_id}</td>
                    <td className="py-3 px-4 font-bold text-slate-900">{r.student_name}</td>
                    <td className="py-3 px-4 text-slate-500">{r.hostel}</td>
                    <td className="py-3 px-4 font-medium text-slate-700">{r.meal}</td>
                    <td className="py-3 px-4">
                      <StatusBadge status={r.status} />
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
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-slate-50 border border-slate-300 rounded-2xl p-6 shadow-2xl relative">
            <button
              onClick={() => setShowAddModal(false)}
              className="absolute top-4 right-4 text-slate-500 hover:text-slate-900 p-1 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-slate-900 mb-1">Add Attendance Record</h3>
            <p className="text-xs text-slate-500 mb-4">Log manual walk-in or RFID override</p>

            <form onSubmit={handleManualAdd} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-500 font-medium mb-1">Student ID</label>
                <input
                  type="text"
                  required
                  value={newStudentId}
                  onChange={(e) => setNewStudentId(e.target.value)}
                  placeholder="e.g. STU-2024-031"
                  className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-slate-700 focus:outline-none focus:border-slate-300"
                />
              </div>

              <div>
                <label className="block text-slate-500 font-medium mb-1">Student Name</label>
                <input
                  type="text"
                  required
                  value={newStudentName}
                  onChange={(e) => setNewStudentName(e.target.value)}
                  placeholder="e.g. Varun Sharma"
                  className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-slate-700 focus:outline-none focus:border-slate-300"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-500 font-medium mb-1">Hostel Block</label>
                  <select
                    value={newHostel}
                    onChange={(e) => setNewHostel(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-slate-700"
                  >
                    <option value="Aryabhata North">Aryabhata North</option>
                    <option value="Kalpana Chawla">Kalpana Chawla</option>
                    <option value="Ramanujan South">Ramanujan South</option>
                    <option value="Sarabhai West">Sarabhai West</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-500 font-medium mb-1">Meal</label>
                  <select
                    value={newMeal}
                    onChange={(e) => setNewMeal(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-slate-700"
                  >
                    <option value="Breakfast">Breakfast</option>
                    <option value="Lunch">Lunch</option>
                    <option value="Dinner">Dinner</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-500 font-medium mb-1">Status</label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value as 'Present' | 'Absent')}
                  className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-slate-700"
                >
                  <option value="Present">Present (Checked In)</option>
                  <option value="Absent">Absent</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition-colors cursor-pointer mt-2"
              >
                Submit Record
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Modal: CSV Upload Simulation */}
      {showCsvModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-slate-50 border border-slate-300 rounded-2xl p-6 shadow-2xl relative">
            <button
              onClick={() => setShowCsvModal(false)}
              className="absolute top-4 right-4 text-slate-500 hover:text-slate-900 p-1 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-slate-900 mb-1">Batch Import CSV Attendance</h3>
            <p className="text-xs text-slate-500 mb-4">
              Upload biometric log files exported from campus turnstiles
            </p>

            <div className="border-2 border-dashed border-slate-300 rounded-2xl p-8 text-center bg-slate-50/60 mb-4">
              <UploadCloud className="w-10 h-10 text-indigo-500 mx-auto mb-2" />
              <p className="text-xs font-semibold text-slate-700">
                Drag and drop student_attendance.csv here
              </p>
              <p className="text-[10px] text-slate-500 mt-1">Columns: ID, Name, Hostel, Meal, Timestamp</p>
            </div>

            {csvSuccess ? (
              <div className="p-3 rounded-xl bg-blue-100/60 border border-blue-200 text-slate-700 text-xs flex items-center justify-center gap-2">
                <Check className="w-4 h-4" />
                <span>Successfully imported 48 records!</span>
              </div>
            ) : (
              <button
                onClick={handleSimulateCsv}
                className="w-full py-2.5 rounded-xl bg-indigo-500 hover:bg-indigo-400 text-slate-900 font-bold text-xs transition-colors cursor-pointer"
              >
                Simulate CSV Ingestion (Demo Mode)
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

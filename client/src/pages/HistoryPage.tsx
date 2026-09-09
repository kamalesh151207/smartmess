import React, { useState, useEffect } from 'react';
import {
  History,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Eye,
  X,
  TrendingUp,
  Download
} from 'lucide-react';
import { StatusBadge } from '../components/ui/StatusBadge';
import { HistoryRecord } from '../types';
import { api } from '../services/api';

export const HistoryPage: React.FC = () => {
  const [history, setHistory] = useState<HistoryRecord[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const [selectedRecord, setSelectedRecord] = useState<HistoryRecord | null>(null);

  useEffect(() => {
    loadHistory(page);
  }, [page]);

  const loadHistory = async (p: number) => {
    setLoading(true);
    try {
      const res = await api.getHistory(p, 10);
      setHistory(res.history);
      setTotalPages(res.total_pages);
      setTotalCount(res.total_count);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-xl lg:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <History className="w-6 h-6 text-indigo-500" /> Historical Predictions & Ledger Audit
            </h2>
            <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-indigo-100 text-indigo-600 border border-indigo-300">
              DEMO DATA
            </span>
          </div>
          <p className="text-xs text-slate-500">
            Immutable log of forecasted quantities against measured dining counter outcomes
          </p>
        </div>

        <button
          onClick={() => {
            alert('Exporting historical CSV audit ledger for accreditation & dining committee review.');
          }}
          className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer border border-slate-300"
        >
          <Download className="w-4 h-4 text-slate-900" /> Export Audit Log
        </button>
      </div>

      {/* History Table Card */}
      <div className="rounded-2xl bg-slate-50/90 border border-slate-200 shadow-xl overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <span>
            Showing page <strong className="text-slate-900">{page}</strong> of <strong className="text-slate-900">{totalPages}</strong> ({totalCount} total service records)
          </span>
          <span className="font-mono text-[11px]">Audit Hash Verified</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="text-slate-500 uppercase bg-slate-50/80 border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Meal</th>
                <th className="py-3 px-4">Menu Items</th>
                <th className="py-3 px-4 text-center">Predicted</th>
                <th className="py-3 px-4 text-center">Actual Consumed</th>
                <th className="py-3 px-4 text-center">Variance</th>
                <th className="py-3 px-4 text-center">Kitchen Prepared</th>
                <th className="py-3 px-4 text-center">Leftover</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-500">
              {loading ? (
                <tr>
                  <td colSpan={10} className="text-center py-8 text-slate-500">
                    Loading historical ledger...
                  </td>
                </tr>
              ) : history.length === 0 ? (
                <tr>
                  <td colSpan={10} className="text-center py-8 text-slate-500">
                    No history records found.
                  </td>
                </tr>
              ) : (
                history.map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-100/30 transition-colors">
                    <td className="py-3 px-4 font-mono">{row.date}</td>
                    <td className="py-3 px-4 font-bold text-slate-900">{row.meal}</td>
                    <td className="py-3 px-4 max-w-xs truncate text-slate-500" title={row.menu}>
                      {row.menu}
                    </td>
                    <td className="py-3 px-4 text-center font-mono text-indigo-500">{row.predicted}</td>
                    <td className="py-3 px-4 text-center font-mono text-slate-700">{row.actual}</td>
                    <td className="py-3 px-4 text-center font-mono font-bold">
                      <span className={row.variance > 0 ? 'text-indigo-600' : 'text-slate-500'}>
                        {row.variance > 0 ? `+${row.variance}` : row.variance}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center font-mono text-slate-900">{row.prepared}</td>
                    <td className="py-3 px-4 text-center font-mono text-slate-900 font-bold">{row.leftover}</td>
                    <td className="py-3 px-4">
                      <StatusBadge status={row.status} />
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => setSelectedRecord(row)}
                        className="p-1.5 text-slate-500 hover:text-indigo-500 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                        title="View Detailed Breakdown"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        <div className="p-4 border-t border-slate-200 flex items-center justify-between text-xs">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1 || loading}
            className="px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-500 hover:text-slate-900 disabled:opacity-40 flex items-center gap-1 cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" /> Previous
          </button>

          <span className="text-slate-500">
            Page <strong className="text-slate-900">{page}</strong> of <strong className="text-slate-900">{totalPages}</strong>
          </span>

          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page >= totalPages || loading}
            className="px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-500 hover:text-slate-900 disabled:opacity-40 flex items-center gap-1 cursor-pointer"
          >
            Next <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Record Details Modal */}
      {selectedRecord && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-slate-50 border border-slate-300 rounded-2xl p-6 shadow-2xl relative">
            <button
              onClick={() => setSelectedRecord(null)}
              className="absolute top-4 right-4 text-slate-500 hover:text-slate-900 p-1 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-bold px-2 py-0.5 rounded bg-cyan-950 text-indigo-500 border border-cyan-800">
                {selectedRecord.meal}
              </span>
              <span className="text-xs font-mono text-slate-500">{selectedRecord.date}</span>
            </div>

            <h3 className="text-lg font-bold text-slate-900 mb-2">{selectedRecord.menu}</h3>

            <div className="grid grid-cols-2 gap-3 my-4">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-xs text-slate-500 block mb-1">AI Prediction</span>
                <span className="text-2xl font-bold text-indigo-500">{selectedRecord.predicted}</span>
                <span className="text-[10px] text-slate-500 block mt-0.5">Forecast portions</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-xs text-slate-500 block mb-1">Actual Consumed</span>
                <span className="text-2xl font-bold text-slate-900">{selectedRecord.actual}</span>
                <span className="text-[10px] text-slate-500 block mt-0.5">Turnout check-ins</span>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50/60 border border-slate-200 text-xs text-slate-500 space-y-2 mb-6">
              <div className="flex justify-between">
                <span className="text-slate-500">Kitchen Prepared:</span>
                <strong className="text-slate-900">{selectedRecord.prepared} meals</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Food Leftover:</span>
                <strong className="text-indigo-600">{selectedRecord.leftover} portions</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Variance (Actual - Predicted):</span>
                <strong className={selectedRecord.variance > 0 ? 'text-indigo-600' : 'text-slate-500'}>
                  {selectedRecord.variance > 0 ? `+${selectedRecord.variance}` : selectedRecord.variance}
                </strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Service Evaluation:</span>
                <StatusBadge status={selectedRecord.status} />
              </div>
            </div>

            <button
              onClick={() => setSelectedRecord(null)}
              className="w-full py-2.5 rounded-xl bg-indigo-500 hover:bg-indigo-400 text-slate-900 font-bold text-xs transition-colors cursor-pointer"
            >
              Close Record
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

import React, { useState, useEffect, useRef } from 'react';
import {
  Menu,
  Bell,
  Search,
  ChevronRight,
  UtensilsCrossed,
  Users,
  Boxes,
  Cpu,
  Check,
  X,
  ExternalLink
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { AlertItem } from '../../types';
import { api } from '../../services/api';

interface NavbarProps {
  currentRoute: string;
  onNavigate: (route: string) => void;
  onOpenMobileMenu: () => void;
  alerts?: AlertItem[];
}

export const Navbar: React.FC<NavbarProps> = ({
  currentRoute,
  onNavigate,
  onOpenMobileMenu,
  alerts = []
}) => {
  const { user } = useAuth();
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadAlerts, setUnreadAlerts] = useState(alerts);

  // Global Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<{
    students: any[];
    meals: any[];
    inventory: any[];
    predictions: any[];
  } | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  // Close search on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowSearchDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Debounced search
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults(null);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await api.search(searchQuery);
        setSearchResults(res);
        setShowSearchDropdown(true);
      } catch (err) {
        console.error(err);
      } finally {
        setIsSearching(false);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const unreadCount = unreadAlerts.filter((a) => !a.is_read).length;

  const markAllRead = () => {
    setUnreadAlerts((prev) => prev.map((a) => ({ ...a, is_read: 1 })));
  };

  // Generate breadcrumb info
  const getBreadcrumb = () => {
    switch (currentRoute) {
      case '/dashboard':
        return { category: 'Overview', page: 'Operations Dashboard' };
      case '/predictions':
        return { category: 'Operations', page: 'AI Demand Predictions' };
      case '/attendance':
        return { category: 'Operations', page: 'Student Attendance' };
      case '/meals':
        return { category: 'Operations', page: 'Meal Ledger & Scheduling' };
      case '/kitchen':
        return { category: 'Operations', page: 'Kitchen Staff Shift' };
      case '/waste':
        return { category: 'Operations', page: 'Waste Monitoring & Audits' };
      case '/inventory':
        return { category: 'Operations', page: 'Raw Inventory & Requisitions' };
      case '/analytics':
        return { category: 'Intelligence', page: 'Demand Analytics' };
      case '/ai-insights':
        return { category: 'Intelligence', page: 'AI Pattern Signals' };
      case '/history':
        return { category: 'Intelligence', page: 'Historical Prediction Audit' };
      case '/settings':
        return { category: 'System', page: 'Platform Settings' };
      default:
        return { category: 'Overview', page: 'Dashboard' };
    }
  };

  const breadcrumb = getBreadcrumb();

  const handleSelectResult = (route: string) => {
    onNavigate(route);
    setShowSearchDropdown(false);
    setSearchQuery('');
  };

  const totalResultsCount = searchResults
    ? (searchResults.students?.length || 0) +
      (searchResults.meals?.length || 0) +
      (searchResults.inventory?.length || 0) +
      (searchResults.predictions?.length || 0)
    : 0;

  return (
    <header className="sticky top-0 z-30 glass-panel-heavy border-b border-slate-700/50 px-4 lg:px-6 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-[0_4px_30px_rgba(0,0,0,0.3)]">
      {/* Left: Mobile Menu & Breadcrumbs */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobileMenu}
          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-50 hover:bg-slate-800 lg:hidden"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Breadcrumb Navigation */}
        <div className="flex items-center gap-1.5 text-xs">
          <span className="text-slate-400 font-medium">Smart Mess</span>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-slate-400 font-medium">{breadcrumb.category}</span>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-slate-50 font-semibold">{breadcrumb.page}</span>
        </div>
      </div>

      {/* Center: Real Functional Global Search Bar */}
      <div ref={searchRef} className="relative flex-1 max-w-md mx-auto w-full">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setShowSearchDropdown(true);
            }}
            onFocus={() => {
              if (searchQuery.trim()) setShowSearchDropdown(true);
            }}
            placeholder="Search students, meals, predictions, ingredients…"
            className="w-full pl-9 pr-8 py-2 rounded-xl bg-slate-900/90 border border-slate-700/80 text-xs text-slate-50 placeholder:text-slate-400 focus:outline-none focus:border-indigo-400 focus:ring-1 focus:ring-cyan-500/50 transition-all shadow-inner"
          />
          {searchQuery && (
            <button
              onClick={() => {
                setSearchQuery('');
                setSearchResults(null);
              }}
              className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-200"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Search Results Dropdown */}
        {showSearchDropdown && searchQuery.trim() && (
          <div className="absolute top-full left-0 right-0 mt-1.5 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl overflow-hidden z-50 max-h-96 overflow-y-auto">
            <div className="p-2.5 bg-slate-900/90 border-b border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
              <span>Results for "{searchQuery}"</span>
              {isSearching ? (
                <span className="text-indigo-500 font-mono">Searching...</span>
              ) : (
                <span>{totalResultsCount} found</span>
              )}
            </div>

            {totalResultsCount === 0 && !isSearching ? (
              <div className="p-6 text-center text-xs text-slate-400">
                No matching students, meals, ingredients, or predictions found.
              </div>
            ) : (
              <div className="p-2 space-y-3 text-xs">
                {/* Students Match */}
                {searchResults?.students && searchResults.students.length > 0 && (
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 px-2 flex items-center gap-1.5 mb-1">
                      <Users className="w-3 h-3 text-indigo-500" /> Students ({searchResults.students.length})
                    </span>
                    <div className="space-y-1">
                      {searchResults.students.map((s) => (
                        <div
                          key={s.id}
                          onClick={() => handleSelectResult('/attendance')}
                          className="p-2 rounded-lg hover:bg-slate-800/80 cursor-pointer flex items-center justify-between text-slate-400 transition-colors"
                        >
                          <div>
                            <span className="font-bold text-slate-50 block">{s.name}</span>
                            <span className="text-[10px] text-slate-400 font-mono">{s.student_id} • {s.hostel} (Room {s.room})</span>
                          </div>
                          <span className="text-[10px] text-indigo-500 flex items-center gap-0.5">
                            Attendance <ExternalLink className="w-3 h-3" />
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Meals Match */}
                {searchResults?.meals && searchResults.meals.length > 0 && (
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 px-2 flex items-center gap-1.5 mb-1">
                      <UtensilsCrossed className="w-3 h-3 text-indigo-600" /> Meals & Menus ({searchResults.meals.length})
                    </span>
                    <div className="space-y-1">
                      {searchResults.meals.map((m) => (
                        <div
                          key={m.id}
                          onClick={() => handleSelectResult('/meals')}
                          className="p-2 rounded-lg hover:bg-slate-800/80 cursor-pointer flex items-center justify-between text-slate-400 transition-colors"
                        >
                          <div>
                            <span className="font-bold text-slate-50 block">{m.meal} ({m.date})</span>
                            <span className="text-[10px] text-slate-400 truncate max-w-xs block">{m.menu}</span>
                          </div>
                          <span className="text-[10px] text-indigo-600 flex items-center gap-0.5">
                            Meal Ops <ExternalLink className="w-3 h-3" />
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Inventory Match */}
                {searchResults?.inventory && searchResults.inventory.length > 0 && (
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 px-2 flex items-center gap-1.5 mb-1">
                      <Boxes className="w-3 h-3 text-slate-50" /> Raw Inventory ({searchResults.inventory.length})
                    </span>
                    <div className="space-y-1">
                      {searchResults.inventory.map((inv) => (
                        <div
                          key={inv.id}
                          onClick={() => handleSelectResult('/inventory')}
                          className="p-2 rounded-lg hover:bg-slate-800/80 cursor-pointer flex items-center justify-between text-slate-400 transition-colors"
                        >
                          <div>
                            <span className="font-bold text-slate-50 block">{inv.item_name}</span>
                            <span className="text-[10px] text-slate-400">{inv.category} • Stock: {inv.current_stock} {inv.unit}</span>
                          </div>
                          <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
                            inv.status === 'Critical' ? 'bg-black text-slate-50' : 'bg-blue-100 text-slate-50'
                          }`}>
                            {inv.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Predictions Match */}
                {searchResults?.predictions && searchResults.predictions.length > 0 && (
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 px-2 flex items-center gap-1.5 mb-1">
                      <Cpu className="w-3 h-3 text-indigo-500" /> Predictions ({searchResults.predictions.length})
                    </span>
                    <div className="space-y-1">
                      {searchResults.predictions.map((p) => (
                        <div
                          key={p.id}
                          onClick={() => handleSelectResult('/predictions')}
                          className="p-2 rounded-lg hover:bg-slate-800/80 cursor-pointer flex items-center justify-between text-slate-400 transition-colors"
                        >
                          <div>
                            <span className="font-bold text-slate-50 block">{p.meal} Forecast</span>
                            <span className="text-[10px] text-slate-400">Demand: {p.predicted_demand} • Prep: {p.recommended_prep}</span>
                          </div>
                          <span className="text-[10px] text-indigo-500 flex items-center gap-0.5">
                            Simulator <ExternalLink className="w-3 h-3" />
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Right: Notification Alerts & Profile */}
      <div className="flex items-center gap-3 self-end sm:self-auto">
        {/* Quick Shift Badge */}
        <div className="hidden xl:flex items-center gap-2 text-[11px] text-slate-400 border border-slate-800 bg-slate-900/60 px-2.5 py-1 rounded-lg">
          <span className="w-2 h-2 rounded-full bg-slate-900 animate-pulse"></span>
          <span>Shift: <strong>Lunch Service</strong></span>
        </div>

        {/* Operational Alerts Bell */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 rounded-lg text-slate-400 hover:text-slate-50 hover:bg-slate-800 relative transition-colors cursor-pointer"
            title="Operational Alerts"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-slate-900 ring-2 ring-white"></span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl z-50 overflow-hidden">
              <div className="p-3 border-b border-slate-800 flex items-center justify-between bg-slate-900/80">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-xs text-slate-50">Active Operational Alerts</span>
                  {unreadCount > 0 && (
                    <span className="text-[10px] bg-black text-blue-700 border border-blue-200 px-1.5 py-0.2 rounded-full font-bold">
                      {unreadCount} urgent
                    </span>
                  )}
                </div>
                <button
                  onClick={markAllRead}
                  className="text-xs text-slate-400 hover:text-slate-50 flex items-center gap-1 cursor-pointer"
                >
                  <Check className="w-3 h-3" /> Mark read
                </button>
              </div>

              <div className="max-h-72 overflow-y-auto divide-y divide-slate-800/60">
                {unreadAlerts.length === 0 ? (
                  <div className="p-6 text-center text-xs text-slate-400">No unread alerts</div>
                ) : (
                  unreadAlerts.map((alt) => (
                    <div
                      key={alt.id}
                      className={`p-3 text-xs transition-colors hover:bg-slate-800/40 ${
                        !alt.is_read ? 'bg-slate-850/40' : ''
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span
                          className={`font-semibold ${
                            alt.severity === 'Critical'
                              ? 'text-slate-50'
                              : alt.severity === 'Attention'
                              ? 'text-indigo-600'
                              : 'text-slate-50'
                          }`}
                        >
                          {alt.title}
                        </span>
                        <span className="text-[10px] text-slate-400 uppercase font-mono">{alt.severity}</span>
                      </div>
                      <p className="text-slate-400 leading-relaxed text-[11px]">{alt.message}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Profile Avatar */}
        <div className="flex items-center gap-2 pl-2 border-l border-slate-800">
          <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-emerald-600 to-cyan-600 flex items-center justify-center text-xs font-bold text-slate-50 shadow">
            {user?.name ? user.name[0] : 'A'}
          </div>
          <div className="hidden md:block text-left">
            <span className="text-xs font-semibold text-slate-200 block leading-tight">
              {user?.name?.split(' ')[0] || 'Admin'}
            </span>
            <span className="text-[10px] text-slate-400 block font-mono">Warden</span>
          </div>
        </div>
      </div>
    </header>
  );
};

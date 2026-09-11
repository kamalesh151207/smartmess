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
  ExternalLink,
  ChevronDown,
  Mail,
  Building2,
  Shield,
  UserCheck,
  LogOut
} from 'lucide-react';
import { useAuth, MOCK_PROFILES } from '../../context/AuthContext';
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
  const { user, logout, switchProfile } = useAuth();
  const [showNotifications, setShowNotifications] = useState<boolean>(false);
  const [showProfileMenu, setShowProfileMenu] = useState<boolean>(false);
  const [unreadAlerts, setUnreadAlerts] = useState<AlertItem[]>(alerts);

  // Global Search state
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [searchResults, setSearchResults] = useState<{
    students: any[];
    meals: any[];
    inventory: any[];
    predictions: any[];
  } | null>(null);
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [showSearchDropdown, setShowSearchDropdown] = useState<boolean>(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  // Close search and profile menu on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowSearchDropdown(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setShowProfileMenu(false);
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

  const unreadCount = unreadAlerts.filter((a: AlertItem) => !a.is_read).length;

  const markAllRead = () => {
    setUnreadAlerts((prev: AlertItem[]) => prev.map((a: AlertItem) => ({ ...a, is_read: 1 })));
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
    <header className="sticky top-0 z-30 glass-panel-heavy border-b border-slate-300/50 px-4 lg:px-6 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-[0_4px_30px_rgba(0,0,0,0.3)] group hover:bg-blue-600 transition-colors duration-300">
      {/* Left: Mobile Menu & Breadcrumbs */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobileMenu}
          className="p-1.5 rounded-lg text-slate-500 group-hover:text-white hover:bg-slate-100 lg:hidden"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Breadcrumb Navigation */}
        <div className="flex items-center gap-1.5 text-xs">
          <span className="text-slate-500 group-hover:text-blue-100 font-medium">Smart Mess</span>
          <ChevronRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-blue-200" />
          <span className="text-slate-500 group-hover:text-blue-100 font-medium">{breadcrumb.category}</span>
          <ChevronRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-blue-200" />
          <span className="text-slate-900 group-hover:text-white font-semibold">{breadcrumb.page}</span>
        </div>
      </div>

      {/* Center: Real Functional Global Search Bar */}
      <div ref={searchRef} className="relative flex-1 max-w-md mx-auto w-full">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
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
            className="w-full pl-9 pr-8 py-2 rounded-xl bg-slate-50/90 border border-slate-300/80 text-xs text-slate-900 placeholder:text-slate-500 focus:outline-none focus:border-indigo-400 focus:ring-1 focus:ring-cyan-500/50 transition-all shadow-inner"
          />
          {searchQuery && (
            <button
              onClick={() => {
                setSearchQuery('');
                setSearchResults(null);
              }}
              className="absolute right-2.5 top-2.5 text-slate-500 hover:text-slate-700"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Search Results Dropdown */}
        {showSearchDropdown && searchQuery.trim() && (
          <div className="absolute top-full left-0 right-0 mt-1.5 bg-slate-50 border border-slate-300 rounded-xl shadow-2xl overflow-hidden z-50 max-h-96 overflow-y-auto">
            <div className="p-2.5 bg-slate-50/90 border-b border-slate-200 text-[11px] text-slate-500 flex items-center justify-between">
              <span>Results for "{searchQuery}"</span>
              {isSearching ? (
                <span className="text-indigo-500 font-mono">Searching...</span>
              ) : (
                <span>{totalResultsCount} found</span>
              )}
            </div>

            {totalResultsCount === 0 && !isSearching ? (
              <div className="p-6 text-center text-xs text-slate-500">
                No matching students, meals, ingredients, or predictions found.
              </div>
            ) : (
              <div className="p-2 space-y-3 text-xs">
                {/* Students Match */}
                {searchResults?.students && searchResults.students.length > 0 && (
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-500 px-2 flex items-center gap-1.5 mb-1">
                      <Users className="w-3 h-3 text-indigo-500" /> Students ({searchResults.students.length})
                    </span>
                    <div className="space-y-1">
                      {searchResults.students.map((s) => (
                        <div
                          key={s.id}
                          onClick={() => handleSelectResult('/attendance')}
                          className="p-2 rounded-lg hover:bg-slate-100/80 cursor-pointer flex items-center justify-between text-slate-500 transition-colors"
                        >
                          <div>
                            <span className="font-bold text-slate-900 block">{s.name}</span>
                            <span className="text-[10px] text-slate-500 font-mono">{s.student_id} • {s.hostel} (Room {s.room})</span>
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
                    <span className="text-[10px] uppercase font-bold text-slate-500 px-2 flex items-center gap-1.5 mb-1">
                      <UtensilsCrossed className="w-3 h-3 text-indigo-600" /> Meals & Menus ({searchResults.meals.length})
                    </span>
                    <div className="space-y-1">
                      {searchResults.meals.map((m) => (
                        <div
                          key={m.id}
                          onClick={() => handleSelectResult('/meals')}
                          className="p-2 rounded-lg hover:bg-slate-100/80 cursor-pointer flex items-center justify-between text-slate-500 transition-colors"
                        >
                          <div>
                            <span className="font-bold text-slate-900 block">{m.meal} ({m.date})</span>
                            <span className="text-[10px] text-slate-500 truncate max-w-xs block">{m.menu}</span>
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
                    <span className="text-[10px] uppercase font-bold text-slate-500 px-2 flex items-center gap-1.5 mb-1">
                      <Boxes className="w-3 h-3 text-slate-900" /> Raw Inventory ({searchResults.inventory.length})
                    </span>
                    <div className="space-y-1">
                      {searchResults.inventory.map((inv) => (
                        <div
                          key={inv.id}
                          onClick={() => handleSelectResult('/inventory')}
                          className="p-2 rounded-lg hover:bg-slate-100/80 cursor-pointer flex items-center justify-between text-slate-500 transition-colors"
                        >
                          <div>
                            <span className="font-bold text-slate-900 block">{inv.item_name}</span>
                            <span className="text-[10px] text-slate-500">{inv.category} • Stock: {inv.current_stock} {inv.unit}</span>
                          </div>
                          <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
                            inv.status === 'Critical' ? 'bg-black text-slate-900' : 'bg-blue-100 text-slate-900'
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
                    <span className="text-[10px] uppercase font-bold text-slate-500 px-2 flex items-center gap-1.5 mb-1">
                      <Cpu className="w-3 h-3 text-indigo-500" /> Predictions ({searchResults.predictions.length})
                    </span>
                    <div className="space-y-1">
                      {searchResults.predictions.map((p) => (
                        <div
                          key={p.id}
                          onClick={() => handleSelectResult('/predictions')}
                          className="p-2 rounded-lg hover:bg-slate-100/80 cursor-pointer flex items-center justify-between text-slate-500 transition-colors"
                        >
                          <div>
                            <span className="font-bold text-slate-900 block">{p.meal} Forecast</span>
                            <span className="text-[10px] text-slate-500">Demand: {p.predicted_demand} • Prep: {p.recommended_prep}</span>
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
        <div className="hidden xl:flex items-center gap-2 text-[11px] text-slate-500 border border-slate-200 bg-slate-50/60 px-2.5 py-1 rounded-lg">
          <span className="w-2 h-2 rounded-full bg-black0 animate-pulse"></span>
          <span>Shift: <strong>Lunch Service</strong></span>
        </div>

        {/* Operational Alerts Bell */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 relative transition-colors cursor-pointer"
            title="Operational Alerts"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-black0 ring-2 ring-white"></span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-slate-50 border border-slate-200 rounded-xl shadow-2xl z-50 overflow-hidden">
              <div className="p-3 border-b border-slate-200 flex items-center justify-between bg-slate-50/80">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-xs text-slate-900">Active Operational Alerts</span>
                  {unreadCount > 0 && (
                    <span className="text-[10px] bg-black text-blue-700 border border-blue-200 px-1.5 py-0.2 rounded-full font-bold">
                      {unreadCount} urgent
                    </span>
                  )}
                </div>
                <button
                  onClick={markAllRead}
                  className="text-xs text-slate-500 hover:text-slate-900 flex items-center gap-1 cursor-pointer"
                >
                  <Check className="w-3 h-3" /> Mark read
                </button>
              </div>

              <div className="max-h-72 overflow-y-auto divide-y divide-slate-800/60">
                {unreadAlerts.length === 0 ? (
                  <div className="p-6 text-center text-xs text-slate-500">No unread alerts</div>
                ) : (
                  unreadAlerts.map((alt) => (
                    <div
                      key={alt.id}
                      className={`p-3 text-xs transition-colors hover:bg-slate-100/40 ${
                        !alt.is_read ? 'bg-slate-850/40' : ''
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span
                          className={`font-semibold ${
                            alt.severity === 'Critical'
                              ? 'text-slate-900'
                              : alt.severity === 'Attention'
                              ? 'text-indigo-600'
                              : 'text-slate-900'
                          }`}
                        >
                          {alt.title}
                        </span>
                        <span className="text-[10px] text-slate-500 uppercase font-mono">{alt.severity}</span>
                      </div>
                      <p className="text-slate-500 leading-relaxed text-[11px]">{alt.message}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Profile Avatar & Interactive Switcher */}
        <div ref={profileRef} className="relative">
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center gap-2.5 pl-2 py-1 pr-2 rounded-xl border border-slate-200/80 bg-white/70 hover:bg-white hover:border-slate-300 shadow-sm transition-all cursor-pointer group/prof"
            title="View profile & switch roles"
          >
            <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-emerald-600 to-cyan-600 flex items-center justify-center text-xs font-bold text-slate-900 shadow">
              {user?.name ? user.name.slice(0, 2).toUpperCase() : 'AD'}
            </div>
            <div className="hidden md:block text-left">
              <span className="text-xs font-semibold text-slate-700 block leading-tight">
                {user?.name || 'Mess Admin'}
              </span>
              <span className="text-[10px] text-slate-500 block font-mono">
                {user?.role || 'Administrator'}
              </span>
            </div>
            <ChevronDown className={`w-3.5 h-3.5 text-slate-400 group-hover/prof:text-slate-600 transition-transform ${showProfileMenu ? 'rotate-180' : ''}`} />
          </button>

          {/* Profile Details & Switcher Dropdown */}
          {showProfileMenu && (
            <div className="absolute right-0 mt-2 w-80 sm:w-88 bg-white border border-slate-200 rounded-2xl shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
              {/* Profile Header Card */}
              <div className="p-4 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white relative overflow-hidden">
                <div className="absolute -right-6 -bottom-6 w-24 h-24 rounded-full bg-cyan-500/10 blur-xl pointer-events-none" />
                <div className="flex items-start gap-3 relative z-10">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-emerald-500 via-teal-400 to-cyan-500 flex items-center justify-center text-base font-bold text-slate-950 shadow-lg flex-shrink-0">
                    {user?.name ? user.name.slice(0, 2).toUpperCase() : 'AD'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <h3 className="font-bold text-sm text-white truncate">{user?.name || 'User Profile'}</h3>
                    </div>
                    <span className="inline-block text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-mono mb-1">
                      {user?.role || 'Administrator'}
                    </span>
                    <p className="text-[11px] text-slate-300 truncate flex items-center gap-1.5">
                      <Mail className="w-3 h-3 text-cyan-400 flex-shrink-0" />
                      {user?.email || 'user@smartmess.edu'}
                    </p>
                  </div>
                </div>

                {/* Additional Info Pills */}
                <div className="mt-3 pt-3 border-t border-slate-700/60 grid grid-cols-2 gap-2 text-[10px] text-slate-300">
                  <div className="flex items-center gap-1.5 bg-slate-800/80 px-2 py-1 rounded-lg border border-slate-700">
                    <Building2 className="w-3 h-3 text-indigo-400 flex-shrink-0" />
                    <span className="truncate">{user?.hostel_assigned || 'Central Campus'}</span>
                  </div>
                  <div className="flex items-center gap-1.5 bg-slate-800/80 px-2 py-1 rounded-lg border border-slate-700 font-mono">
                    <Shield className="w-3 h-3 text-amber-400 flex-shrink-0" />
                    <span className="truncate">ID: {user?.id || 'usr_001'}</span>
                  </div>
                </div>
              </div>

              {/* Multiple Profile Switcher Section */}
              <div className="p-3 bg-slate-50/80 border-b border-slate-200">
                <div className="flex items-center justify-between px-1 mb-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                    <UserCheck className="w-3.5 h-3.5 text-indigo-600" />
                    Switch Profile / Role
                  </span>
                  <span className="text-[10px] text-slate-500">{MOCK_PROFILES.length} profiles</span>
                </div>

                <div className="space-y-1.5 max-h-52 overflow-y-auto pr-0.5">
                  {MOCK_PROFILES.map((prof) => {
                    const isCurrent = user?.id === prof.id || user?.email === prof.email;
                    return (
                      <button
                        key={prof.id}
                        onClick={() => {
                          switchProfile(prof);
                          setShowProfileMenu(false);
                        }}
                        className={`w-full p-2 rounded-xl text-left transition-all flex items-center justify-between cursor-pointer border ${
                          isCurrent
                            ? 'bg-blue-50/80 border-blue-200 shadow-sm'
                            : 'bg-white hover:bg-slate-100/80 border-slate-200/80 hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-[11px] font-bold shadow-sm flex-shrink-0 ${
                            isCurrent
                              ? 'bg-indigo-600 text-white'
                              : 'bg-slate-100 text-slate-700 border border-slate-200'
                          }`}>
                            {prof.name.slice(0, 2).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-semibold text-slate-900 truncate flex items-center gap-1.5">
                              {prof.name}
                              {isCurrent && (
                                <span className="text-[9px] font-bold text-indigo-600 bg-blue-100 px-1.5 py-0.2 rounded">
                                  Active
                                </span>
                              )}
                            </p>
                            <p className="text-[10px] text-slate-500 truncate">
                              {prof.role} • {prof.hostel_assigned}
                            </p>
                          </div>
                        </div>

                        {isCurrent && (
                          <Check className="w-4 h-4 text-indigo-600 flex-shrink-0 ml-2" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Footer Actions */}
              <div className="p-2 bg-white flex items-center justify-between gap-2">
                <button
                  onClick={() => {
                    setShowProfileMenu(false);
                    onNavigate('/settings');
                  }}
                  className="flex-1 py-1.5 px-3 text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors text-center cursor-pointer"
                >
                  Account Settings
                </button>
                <button
                  onClick={() => {
                    setShowProfileMenu(false);
                    logout();
                  }}
                  className="flex items-center justify-center gap-1.5 py-1.5 px-3 text-xs font-semibold text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer border border-transparent hover:border-red-200"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  Sign Out
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Quick Top Navbar Logout Button */}
        <button
          onClick={logout}
          className="ml-1 px-3 py-1.5 text-xs font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-xl border border-red-200 transition-colors flex items-center gap-1.5 cursor-pointer"
          title="Sign out of current profile"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Logout</span>
        </button>
      </div>
    </header>
  );
};

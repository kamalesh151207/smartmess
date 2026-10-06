import React from 'react';
import {
  LayoutDashboard,
  Cpu,
  Users,
  UtensilsCrossed,
  ChefHat,
  Recycle,
  Boxes,
  BarChart3,
  Brain,
  History,
  Settings,
  RefreshCw,
  LogOut,
  X,
  Activity,
  FileCode2,
  Sliders
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';

interface SidebarProps {
  currentRoute: string;
  onNavigate: (route: string) => void;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
}

interface NavSection {
  title: string;
  items: Array<{
    id: string;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: string;
  }>;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentRoute,
  onNavigate,
  isOpenMobile,
  onCloseMobile
}) => {
  const { user, logout } = useAuth();
  const [isResetting, setIsResetting] = React.useState(false);

  const navSections: NavSection[] = [
    {
      title: 'OVERVIEW',
      items: [
        { id: '/dashboard', label: 'Dashboard', icon: LayoutDashboard }
      ]
    },
    {
      title: 'OPERATIONS',
      items: [
        { id: '/predictions', label: 'AI Demand Forecast', icon: Cpu, badge: 'AI' },
        { id: '/attendance', label: 'Attendance Pipeline', icon: Users },
        { id: '/meals', label: 'Meals & Menu', icon: UtensilsCrossed },
        { id: '/kitchen', label: 'Kitchen Shift', icon: ChefHat, badge: 'Staff' },
        { id: '/waste', label: 'Waste Logs', icon: Recycle },
        { id: '/inventory', label: 'Inventory Stock', icon: Boxes }
      ]
    },
    {
      title: 'AI & INTELLIGENCE',
      items: [
        { id: '/model-evaluation', label: 'Model Performance', icon: Sliders, badge: 'ML' },
        { id: '/analytics', label: 'Longitudinal Trends', icon: BarChart3 },
        { id: '/ai-insights', label: 'AI Insights & Signals', icon: Brain },
        { id: '/history', label: 'Historical Audit', icon: History }
      ]
    },
    {
      title: 'DEVELOPER & SYSTEM',
      items: [
        { id: '/system-health', label: 'System Health', icon: Activity, badge: 'Viva' },
        { id: '/api-docs', label: 'REST API Specs', icon: FileCode2, badge: 'OpenAPI' },
        { id: '/settings', label: 'Settings', icon: Settings }
      ]
    }
  ];

  const handleReloadDemo = async () => {
    setIsResetting(true);
    try {
      await api.reloadDemoData();
      window.location.reload();
    } catch (err) {
      console.error(err);
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpenMobile && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-slate-50 border-r border-slate-200 flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="h-16 px-5 flex items-center justify-between border-b border-slate-200">
          <div
            onClick={() => onNavigate('/dashboard')}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-sm shadow-indigo-600/30">
              <UtensilsCrossed className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-slate-900 tracking-wider text-base">SMART MESS</span>
                <span className="text-[10px] uppercase font-bold tracking-widest px-1.5 py-0.5 rounded bg-indigo-100 text-indigo-700 border border-indigo-200">
                  AI
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium">Smart Dining Platform</p>
            </div>
          </div>

          <button
            onClick={onCloseMobile}
            className="p-1 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 lg:hidden"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Demo Mode & Fast Re-seed */}
        <div className="mx-3 my-2 px-3 py-1.5 rounded-lg bg-indigo-50/70 border border-indigo-200/60 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-[10px] font-semibold text-slate-700 uppercase tracking-wider">
              OPERATIONAL DEMO
            </span>
          </div>
          <button
            onClick={handleReloadDemo}
            disabled={isResetting}
            title="Reload Demo Data"
            className="p-1 text-slate-500 hover:text-slate-900 hover:bg-indigo-100 rounded transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isResetting ? 'animate-spin text-indigo-600' : ''}`} />
          </button>
        </div>

        {/* Navigation Sections */}
        <div className="flex-1 px-3 py-2 space-y-4 overflow-y-auto">
          {navSections.map((section) => (
            <div key={section.title}>
              <h4 className="px-3 text-[10px] font-bold text-slate-400 tracking-wider uppercase mb-1">
                {section.title}
              </h4>
              <div className="space-y-0.5">
                {section.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = currentRoute === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        onNavigate(item.id);
                        onCloseMobile();
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                        isActive
                          ? 'bg-indigo-50 text-indigo-700 border border-indigo-200 font-bold shadow-xs'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-600' : 'text-slate-500'}`} />
                        <span>{item.label}</span>
                      </div>
                      {item.badge && (
                        <span
                          className={`text-[9px] px-1.5 py-0.2 rounded font-bold uppercase tracking-wider ${
                            item.badge === 'AI'
                              ? 'bg-indigo-100 text-indigo-700 border border-indigo-200'
                              : item.badge === 'ML'
                              ? 'bg-purple-100 text-purple-700 border border-purple-200'
                              : item.badge === 'Viva'
                              ? 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                              : 'bg-blue-100 text-blue-700 border border-blue-200'
                          }`}
                        >
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* User Profile & Logout */}
        <div className="p-3 border-t border-slate-200 bg-slate-50">
          <div className="flex items-center justify-between p-2 rounded-lg bg-white border border-slate-200">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-xs font-bold text-white shadow-inner flex-shrink-0">
                {user?.name ? user.name.slice(0, 2).toUpperCase() : 'CW'}
              </div>
              <div className="truncate">
                <p className="text-xs font-semibold text-slate-800 truncate">{user?.name || 'Chief Warden'}</p>
                <p className="text-[10px] text-slate-500 truncate">{user?.role || 'Administrator'}</p>
              </div>
            </div>
            <button
              onClick={logout}
              title="Sign Out"
              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

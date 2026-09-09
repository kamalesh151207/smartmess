import React, { useState } from 'react';
import { Sidebar } from './Sidebar';
import { Navbar } from './Navbar';
import { AlertItem } from '../../types';

interface LayoutProps {
  currentRoute: string;
  onNavigate: (route: string) => void;
  children: React.ReactNode;
  alerts?: AlertItem[];
}

export const Layout: React.FC<LayoutProps> = ({
  currentRoute,
  onNavigate,
  children,
  alerts = []
}) => {
  const [isOpenMobile, setIsOpenMobile] = useState(false);

  return (
    <div className="min-h-screen bg-mesh text-slate-900 flex flex-col">
      {/* Sidebar */}
      <Sidebar
        currentRoute={currentRoute}
        onNavigate={onNavigate}
        isOpenMobile={isOpenMobile}
        onCloseMobile={() => setIsOpenMobile(false)}
      />

      {/* Main Content Area */}
      <div className="lg:pl-64 flex-1 flex flex-col min-h-screen">
        <Navbar
          currentRoute={currentRoute}
          onNavigate={onNavigate}
          onOpenMobileMenu={() => setIsOpenMobile(true)}
          alerts={alerts}
        />
        <main className="flex-1 p-4 lg:p-8 max-w-7xl w-full mx-auto space-y-8">
          {children}
        </main>

        {/* Operational Footer */}
        <footer className="border-t border-slate-200 px-6 py-4 text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-2 bg-slate-50">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-500">SMART MESS</span>
            <span>•</span>
            <span>Predict • Prepare • Reduce Waste • Prevent Shortages</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-slate-900 font-mono text-[11px]">System Status: Nominal</span>
            <span>•</span>
            <span className="text-slate-500">SIH AI Operations v2.4</span>
          </div>
        </footer>
      </div>
    </div>
  );
};

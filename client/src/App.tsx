import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Layout } from './components/layout/Layout';
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { PredictionsPage } from './pages/PredictionsPage';
import { AttendancePage } from './pages/AttendancePage';
import { MealsPage } from './pages/MealsPage';
import { KitchenPage } from './pages/KitchenPage';
import { WastePage } from './pages/WastePage';
import { InventoryPage } from './pages/InventoryPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { AiInsightsPage } from './pages/AiInsightsPage';
import { HistoryPage } from './pages/HistoryPage';
import { SettingsPage } from './pages/SettingsPage';
import { AlertItem } from './types';
import { api } from './services/api';

function MainApp() {
  const { isAuthenticated, user } = useAuth();
  const [currentRoute, setCurrentRoute] = useState<string>(() => {
    return window.location.pathname === '/' || window.location.pathname === '' ? '/' : window.location.pathname;
  });
  const [alerts, setAlerts] = useState<AlertItem[]>([]);

  useEffect(() => {
    // Synchronize browser history
    const handlePopState = () => {
      setCurrentRoute(window.location.pathname || '/');
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  useEffect(() => {
    // Load active alerts for navbar
    api.getDashboard()
      .then((res) => {
        if (res.alerts) setAlerts(res.alerts);
      })
      .catch((err) => console.error(err));
  }, []);

  const navigate = (route: string) => {
    setCurrentRoute(route);
    window.history.pushState({}, '', route);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Route 1: Landing Page
  if (currentRoute === '/') {
    return (
      <LandingPage
        onGoToDashboard={() => navigate('/dashboard')}
        onGoToLogin={() => navigate('/login')}
      />
    );
  }

  // Route 2: Login Page
  if (currentRoute === '/login') {
    return (
      <LoginPage
        onSuccess={() => navigate('/dashboard')}
        onGoHome={() => navigate('/')}
      />
    );
  }

  // Protected Routes - If unauthenticated, redirect to login
  if (!isAuthenticated) {
    return (
      <LoginPage
        onSuccess={() => navigate('/dashboard')}
        onGoHome={() => navigate('/')}
      />
    );
  }

  // Render Protected Dashboard Routes within Layout
  const renderCurrentPage = () => {
    switch (currentRoute) {
      case '/dashboard':
        return <DashboardPage onNavigate={navigate} />;
      case '/predictions':
        return <PredictionsPage />;
      case '/attendance':
        return <AttendancePage />;
      case '/meals':
        return <MealsPage />;
      case '/kitchen':
        return <KitchenPage onNavigate={navigate} />;
      case '/waste':
        return <WastePage />;
      case '/inventory':
        return <InventoryPage />;
      case '/analytics':
        return <AnalyticsPage />;
      case '/ai-insights':
        return <AiInsightsPage />;
      case '/history':
        return <HistoryPage />;
      case '/settings':
        return <SettingsPage />;
      default:
        return <DashboardPage onNavigate={navigate} />;
    }
  };

  return (
    <Layout currentRoute={currentRoute} onNavigate={navigate} alerts={alerts}>
      {renderCurrentPage()}
    </Layout>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}

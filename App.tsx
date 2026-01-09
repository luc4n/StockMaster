
import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import AuthScreen from './components/AuthScreen';
import Dashboard from './views/Dashboard';
import VendorsView from './views/VendorsView';
import ProductsView from './views/ProductsView';
import DistributionView from './views/DistributionView';
import NotificationsView from './views/NotificationsView';
import ProfileView from './views/ProfileView';
import SettingsView from './views/SettingsView';
import LogsView from './views/LogsView';
import SupportView from './views/SupportView';
import { View, Vendor } from './types';
import { supabase } from './supabaseClient';
import { Session } from '@supabase/supabase-js';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>(View.DASHBOARD);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [selectedEntityName, setSelectedEntityName] = useState<string | undefined>();
  const [session, setSession] = useState<Session | null>(null);
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setInitializing(false);
    });

    // Listen for changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleViewChange = (view: View) => {
    setCurrentView(view);
    setSelectedEntityName(undefined);
  };

  const renderContent = () => {
    switch (currentView) {
      case View.DASHBOARD: return <Dashboard />;
      case View.VENDORS: return <VendorsView onSelectVendor={(v: Vendor | null) => setSelectedEntityName(v?.name)} />;
      case View.PRODUCTS: return <ProductsView />;
      case View.DISTRIBUTION: return <DistributionView />;
      case View.NOTIFICATIONS: return <NotificationsView />;
      case View.PROFILE: return <ProfileView />;
      case View.SETTINGS: return <SettingsView />;
      case View.LOGS: return <LogsView />;
      case View.SUPPORT: return <SupportView />;
      default: return <Dashboard />;
    }
  };

  if (initializing) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-background-light dark:bg-background-dark">
        <div className="w-10 h-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (!session) {
    return <AuthScreen />;
  }

  return (
    <div className="flex h-screen w-full overflow-hidden">
      <Sidebar
        currentView={currentView}
        onViewChange={handleViewChange}
        isOpen={isSidebarOpen}
        onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
      />

      <div className="flex flex-1 flex-col h-full overflow-hidden bg-background-light dark:bg-background-dark transition-colors duration-500">
        <Header
          currentView={currentView}
          onViewChange={handleViewChange}
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
          subPath={selectedEntityName}
          onClearSubPath={() => setSelectedEntityName(undefined)}
        />

        <main className="flex-1 overflow-y-auto p-4 md:p-8 lg:p-10 scroll-smooth">
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

export default App;

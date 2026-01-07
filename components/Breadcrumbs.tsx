
import React from 'react';
import { View } from '../types';

interface BreadcrumbsProps {
  currentView: View;
  onViewChange: (view: View) => void;
  subPath?: string;
  onClearSubPath?: () => void;
}

const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ currentView, onViewChange, subPath, onClearSubPath }) => {
  const getViewLabel = (view: View) => {
    switch (view) {
      case View.DASHBOARD: return 'Dashboard';
      case View.VENDORS: return 'Vendedores';
      case View.PRODUCTS: return 'Catálogo';
      case View.DISTRIBUTION: return 'Distribuição';
      case View.REPORTS: return 'Relatórios';
      case View.SETTINGS: return 'Configurações';
      default: return 'Sistema';
    }
  };

  return (
    <nav className="flex items-center gap-2 text-sm overflow-hidden whitespace-nowrap" aria-label="Breadcrumb">
      <button 
        onClick={() => onViewChange(View.DASHBOARD)}
        className="text-[#617589] dark:text-gray-500 hover:text-primary transition-colors flex items-center gap-1"
      >
        <span className="material-symbols-outlined text-lg">home</span>
        <span className="hidden sm:inline">Início</span>
      </button>

      <span className="material-symbols-outlined text-xs text-[#617589] dark:text-gray-500">chevron_right</span>

      <button 
        onClick={() => {
            onViewChange(currentView);
            if (onClearSubPath) onClearSubPath();
        }}
        className={`transition-colors ${!subPath ? 'font-bold text-[#111418] dark:text-white cursor-default' : 'text-[#617589] dark:text-gray-500 hover:text-primary'}`}
      >
        {getViewLabel(currentView)}
      </button>

      {subPath && (
        <>
          <span className="material-symbols-outlined text-xs text-[#617589] dark:text-gray-500">chevron_right</span>
          <span className="font-bold text-[#111418] dark:text-white truncate">
            {subPath}
          </span>
        </>
      )}
    </nav>
  );
};

export default Breadcrumbs;

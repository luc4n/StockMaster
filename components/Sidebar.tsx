
import React from 'react';
import { View } from '../types';

interface SidebarProps {
  currentView: View;
  onViewChange: (view: View) => void;
  isOpen: boolean;
  onToggle: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, onViewChange, isOpen }) => {
  const navItems = [
    { view: View.DASHBOARD, label: 'Visão Geral', icon: 'dashboard' },
    { view: View.PRODUCTS, label: 'Produtos', icon: 'package_2' },
    { view: View.VENDORS, label: 'Vendedores', icon: 'group' },
    { view: View.DISTRIBUTION, label: 'Distribuição', icon: 'local_shipping' },
    { view: View.REPORTS, label: 'Relatórios', icon: 'description' },
  ];

  return (
    <aside className={`${isOpen ? 'flex w-80' : 'hidden'} lg:flex flex-col border-r border-[#f1f5f9] dark:border-gray-800 bg-white dark:bg-[#0f172a] transition-all z-20 shrink-0 shadow-premium`}>
      <div className="flex h-24 items-center gap-4 px-8">
        <div className="bg-gradient-to-br from-primary to-primary-dark rounded-2xl size-12 flex items-center justify-center text-white shadow-lg shadow-primary/30">
          <span className="material-symbols-outlined text-3xl font-bold">inventory_2</span>
        </div>
        <div className="flex flex-col">
          <h1 className="text-xl font-black text-gray-900 dark:text-white tracking-tight">Stock<span className="text-primary italic">Master</span></h1>
          <p className="text-gray-400 dark:text-gray-500 text-[10px] uppercase font-black tracking-widest">Enterprise v2.0</p>
        </div>
      </div>

      <nav className="flex flex-col gap-2 p-6 flex-1 overflow-y-auto">
        {navItems.map((item) => (
          <button
            key={item.view}
            onClick={() => onViewChange(item.view)}
            className={`flex items-center gap-4 rounded-xl px-4 py-3.5 transition-all duration-300 relative group overflow-hidden ${currentView === item.view
                ? 'text-primary'
                : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/50 hover:text-gray-900 dark:hover:text-white'
              }`}
          >
            {currentView === item.view && (
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary rounded-r-full"></div>
            )}
            <div className={`flex items-center justify-center transition-transform duration-300 group-hover:scale-110 ${currentView === item.view ? 'text-primary' : 'text-gray-400'}`}>
              <span className={`material-symbols-outlined text-[26px] ${currentView === item.view ? 'fill-1' : ''}`}>
                {item.icon}
              </span>
            </div>
            <span className={`text-sm font-bold tracking-tight ${currentView === item.view ? 'text-primary' : ''}`}>{item.label}</span>
            {currentView === item.view && (
              <div className="absolute inset-0 bg-primary/5 -z-10 animate-in fade-in duration-500"></div>
            )}
          </button>
        ))}
      </nav>

      <div className="p-6 border-t border-[#f1f5f9] dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/30">
        <button
          onClick={() => onViewChange(View.SETTINGS)}
          className={`w-full flex items-center gap-4 rounded-xl px-4 py-3 text-gray-500 dark:text-gray-400 hover:bg-white dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white transition-all shadow-sm mb-6 ${currentView === View.SETTINGS ? 'bg-white dark:bg-gray-800 text-primary shadow-premium' : ''}`}
        >
          <span className="material-symbols-outlined text-xl">settings</span>
          <span className="text-sm font-bold tracking-tight">Configurações</span>
        </button>

        <div className="flex items-center gap-4 p-2 rounded-2xl bg-white dark:bg-gray-800/80 border border-gray-100 dark:border-gray-700 shadow-premium transition-all hover:scale-[1.02]">
          <div className="rounded-xl size-10 bg-cover bg-center border-2 border-white dark:border-gray-900 shadow-sm" style={{ backgroundImage: `url('https://picsum.photos/seed/admin/100')` }}></div>
          <div className="flex flex-col min-w-0">
            <p className="text-sm font-black text-gray-900 dark:text-white truncate">Lucca Anjos</p>
            <p className="text-[10px] text-gray-500 dark:text-gray-500 uppercase font-black tracking-widest truncate">Master Admin</p>
          </div>
          <span className="material-symbols-outlined ml-auto text-gray-300 hover:text-primary transition-colors cursor-pointer">verified_user</span>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;

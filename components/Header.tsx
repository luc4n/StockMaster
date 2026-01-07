
import React, { useState, useRef, useEffect } from 'react';
import { View } from '../types';
import Breadcrumbs from './Breadcrumbs';
import { supabase } from '../supabaseClient';

interface HeaderProps {
  currentView: View;
  onToggleSidebar: () => void;
  onViewChange: (view: View) => void;
  subPath?: string;
  onClearSubPath?: () => void;
}

const Header: React.FC<HeaderProps> = ({
  currentView,
  onToggleSidebar,
  onViewChange,
  subPath,
  onClearSubPath
}) => {
  const [isAdminMenuOpen, setIsAdminMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsAdminMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const adminMenuItems = [
    { icon: 'person', label: 'Meu Perfil', action: () => alert('Perfil em breve') },
    { icon: 'settings', label: 'Configurações', action: () => alert('Configurações em breve') },
    { icon: 'history', label: 'Logs de Atividade', action: () => alert('Logs em breve') },
    { icon: 'help_outline', label: 'Suporte', action: () => alert('Suporte em breve') },
  ];
  return (
    <header className="flex h-20 w-full items-center justify-between border-b border-[#f0f2f4] dark:border-gray-800 bg-white dark:bg-[#101922] px-6 lg:px-10 shrink-0 z-10">
      <div className="flex items-center gap-4">
        <button onClick={onToggleSidebar} className="lg:hidden p-2 text-[#111418] dark:text-white">
          <span className="material-symbols-outlined">menu</span>
        </button>
        <Breadcrumbs
          currentView={currentView}
          onViewChange={onViewChange}
          subPath={subPath}
          onClearSubPath={onClearSubPath}
        />
      </div>

      <div className="flex items-center gap-4 lg:gap-8 ml-auto">
        <button className="relative rounded-full p-2 text-[#617589] hover:bg-[#f0f2f4] dark:text-gray-400 dark:hover:bg-gray-800 transition-colors">
          <span className="material-symbols-outlined">notifications</span>
          <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-red-500 border-2 border-white dark:border-[#101922]"></span>
        </button>
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setIsAdminMenuOpen(!isAdminMenuOpen)}
            className="flex items-center gap-2 p-1 pl-3 border rounded-full border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all active:scale-95"
          >
            <span className="text-xs font-bold text-[#617589] dark:text-gray-400">ADMIN</span>
            <div className="size-8 rounded-full bg-cover bg-center border-2 border-white dark:border-gray-900 shadow-sm" style={{ backgroundImage: `url('https://picsum.photos/seed/admin/100')` }}></div>
            <span className={`material-symbols-outlined text-gray-400 text-lg transition-transform duration-300 ${isAdminMenuOpen ? 'rotate-180' : ''}`}>expand_more</span>
          </button>

          {isAdminMenuOpen && (
            <div className="absolute right-0 mt-3 w-56 bg-white dark:bg-surface-dark border border-gray-100 dark:border-gray-800 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200 z-50">
              <div className="p-4 border-b border-gray-50 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/30">
                <p className="text-sm font-bold dark:text-white leading-none">Administrador</p>
                <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-1 uppercase tracking-wider font-semibold">Master Admin</p>
              </div>

              <div className="p-1">
                {adminMenuItems.map((item, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      item.action();
                      setIsAdminMenuOpen(false);
                    }}
                    className="flex items-center gap-3 w-full px-4 py-2.5 text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800/80 hover:text-primary dark:hover:text-primary rounded-xl transition-all group"
                  >
                    <span className="material-symbols-outlined text-xl text-gray-400 group-hover:text-primary">{item.icon}</span>
                    {item.label}
                  </button>
                ))}
              </div>

              <div className="p-1 border-t border-gray-100 dark:border-gray-800">
                <button
                  onClick={() => {
                    supabase.auth.signOut();
                    setIsAdminMenuOpen(false);
                  }}
                  className="flex items-center gap-3 w-full px-4 py-2.5 text-sm font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-xl transition-all"
                >
                  <span className="material-symbols-outlined text-xl">logout</span>
                  Sair do Sistema
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;

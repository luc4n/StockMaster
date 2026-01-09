import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { Notification } from '../types';

const NotificationsView: React.FC = () => {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [filter, setFilter] = useState<'all' | 'customer' | 'system' | 'inventory'>('all');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchNotifications();
    }, []);

    const fetchNotifications = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('notifications')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching notifications:', error);
        } else {
            setNotifications(data || []);
        }
        setLoading(false);
    };

    const markAsRead = async (id: string) => {
        const { error } = await supabase
            .from('notifications')
            .update({ is_read: true })
            .eq('id', id);

        if (!error) {
            setNotifications(prev =>
                prev.map(n => n.id === id ? { ...n, is_read: true } : n)
            );
        }
    };

    const filteredNotifications = notifications.filter(n =>
        filter === 'all' ? true : n.type === filter
    );

    const getIcon = (type: string) => {
        switch (type) {
            case 'customer': return 'person';
            case 'system': return 'smart_toy';
            case 'inventory': return 'inventory_2';
            default: return 'notifications';
        }
    };

    const getStyleConfig = (type: string) => {
        switch (type) {
            case 'customer':
                return {
                    bg: 'bg-blue-500/10',
                    text: 'text-blue-600 dark:text-blue-400',
                    glow: 'shadow-[0_0_15px_-3px_rgba(59,130,246,0.3)]',
                    gradient: 'from-blue-500 to-indigo-600'
                };
            case 'system':
                return {
                    bg: 'bg-indigo-500/10',
                    text: 'text-indigo-600 dark:text-indigo-400',
                    glow: 'shadow-[0_0_15px_-3px_rgba(99,102,241,0.3)]',
                    gradient: 'from-indigo-500 to-purple-600'
                };
            case 'inventory':
                return {
                    bg: 'bg-amber-500/10',
                    text: 'text-amber-600 dark:text-amber-400',
                    glow: 'shadow-[0_0_15px_-3px_rgba(245,158,11,0.3)]',
                    gradient: 'from-amber-500 to-orange-600'
                };
            default:
                return {
                    bg: 'bg-gray-500/10',
                    text: 'text-gray-600 dark:text-gray-400',
                    glow: '',
                    gradient: 'from-gray-500 to-gray-600'
                };
        }
    };

    return (
        <div className="max-w-[900px] mx-auto flex flex-col gap-10 pb-16 px-4">
            {/* Header Section */}
            <div className="flex flex-col gap-2">
                <div className="flex items-center gap-3">
                    <div className="h-1 w-12 bg-primary rounded-full"></div>
                    <span className="text-primary font-black uppercase tracking-[0.2em] text-[10px]">Central de Comando</span>
                </div>
                <h1 className="text-gray-900 dark:text-white text-5xl font-black leading-tight tracking-tighter">
                    Notificações <span className="text-primary">Inteligentes</span>
                </h1>
                <p className="text-gray-500 dark:text-gray-400 text-lg font-medium max-w-2xl">
                    Monitore o pulso da sua operação com alertas em tempo real e insights sobre interações de clientes.
                </p>
            </div>

            {/* Tabs / Filters Section */}
            <div className="flex items-center gap-2 p-2 bg-gray-50/50 dark:bg-gray-900/40 backdrop-blur-xl border border-gray-100 dark:border-gray-800 rounded-[2rem] w-fit shadow-inner">
                {[
                    { id: 'all', label: 'Todas', icon: 'apps' },
                    { id: 'customer', label: 'Clientes', icon: 'groups' },
                    { id: 'system', label: 'Sistema', icon: 'terminal' },
                    { id: 'inventory', label: 'Estoque', icon: 'package' }
                ].map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setFilter(tab.id as any)}
                        className={`flex items-center gap-2 px-6 py-3 rounded-2xl text-sm font-bold transition-all duration-300 ${filter === tab.id
                            ? 'bg-white dark:bg-gray-800 text-primary shadow-[0_8px_20px_-6px_rgba(19,127,236,0.3)] translate-y-[-1px]'
                            : 'text-gray-500 dark:text-gray-500 hover:text-gray-900 dark:hover:text-gray-300'
                            }`}
                    >
                        <span className="material-symbols-outlined text-lg leading-none">{tab.icon}</span>
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Notifications List */}
            <div className="flex flex-col gap-5">
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-32 gap-4">
                        <div className="relative size-16">
                            <div className="absolute inset-0 border-4 border-primary/20 rounded-full"></div>
                            <div className="absolute inset-0 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                        </div>
                        <p className="text-gray-400 font-bold uppercase tracking-widest text-xs animate-pulse">Sincronizando Dados...</p>
                    </div>
                ) : filteredNotifications.length > 0 ? (
                    filteredNotifications.map((notification) => {
                        const config = getStyleConfig(notification.type);
                        return (
                            <div
                                key={notification.id}
                                className={`group relative flex items-center gap-6 p-6 rounded-[2.5rem] border transition-all duration-500 ${notification.is_read
                                    ? 'bg-gray-50/30 dark:bg-gray-900/10 border-gray-100 dark:border-gray-800/50 opacity-60'
                                    : 'bg-white dark:bg-surface-dark border-gray-100 dark:border-gray-800 hover:border-primary/20 hover:bg-gray-50/50 dark:hover:bg-gray-800/40 shadow-premium hover:shadow-premium-hover translate-z-0'
                                    }`}
                            >
                                {/* Icon Column */}
                                <div className="relative shrink-0">
                                    <div className={`size-14 rounded-2xl flex items-center justify-center transition-all duration-500 group-hover:scale-110 group-hover:rotate-3 ${config.bg} ${config.glow}`}>
                                        <span className={`material-symbols-outlined text-3xl font-bold ${config.text}`}>
                                            {getIcon(notification.type)}
                                        </span>
                                    </div>
                                    {!notification.is_read && (
                                        <div className="absolute -top-1 -right-1 size-4 bg-primary rounded-full border-4 border-white dark:border-surface-dark animate-pulse shadow-lg shadow-primary/50"></div>
                                    )}
                                </div>

                                {/* Content Column */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-3 mb-1">
                                        <h3 className={`text-lg font-black tracking-tight leading-none ${notification.is_read ? 'text-gray-600 dark:text-gray-400' : 'text-gray-900 dark:text-white'}`}>
                                            {notification.title}
                                        </h3>
                                    </div>
                                    <p className={`text-sm leading-relaxed max-w-xl ${notification.is_read ? 'text-gray-500' : 'text-gray-600 dark:text-gray-400 font-medium'}`}>
                                        {notification.message}
                                    </p>
                                </div>

                                {/* Meta Column */}
                                <div className="flex flex-col items-end gap-3 shrink-0">
                                    <span className="text-[10px] font-black uppercase tracking-[0.15em] text-gray-400 bg-gray-100/50 dark:bg-gray-800/50 px-3 py-1.5 rounded-full">
                                        {new Date(notification.created_at).toLocaleDateString('pt-BR', { hour: '2-digit', minute: '2-digit' }).replace(',', ' •')}
                                    </span>

                                    {!notification.is_read && (
                                        <button
                                            onClick={() => markAsRead(notification.id)}
                                            className="flex items-center gap-2 pl-4 pr-3 py-2 rounded-xl bg-primary/[0.08] text-primary hover:bg-primary text-[10px] font-black uppercase tracking-widest hover:text-white transition-all transform hover:scale-105 active:scale-95 group/btn"
                                        >
                                            Lido
                                            <span className="material-symbols-outlined text-sm font-black group-hover/btn:translate-x-1 transition-transform">check</span>
                                        </button>
                                    )}
                                </div>

                                {/* Hover Background Accent */}
                                <div className={`absolute inset-0 bg-gradient-to-br ${config.gradient} opacity-0 group-hover:opacity-[0.02] transition-opacity duration-500 pointer-events-none rounded-[2.5rem]`}></div>
                            </div>
                        );
                    })
                ) : (
                    <div className="flex flex-col items-center justify-center py-32 text-center bg-gray-50/30 dark:bg-gray-900/10 rounded-[3rem] border-2 border-dashed border-gray-100 dark:border-gray-800">
                        <div className="size-24 bg-white dark:bg-gray-800 rounded-[2rem] shadow-xl flex items-center justify-center mb-6 transform -rotate-6 transition-transform hover:rotate-0 duration-500">
                            <span className="material-symbols-outlined text-5xl text-gray-300 dark:text-gray-600">inbox_customize</span>
                        </div>
                        <p className="text-gray-900 dark:text-white font-black text-2xl tracking-tight">Área de Trabalho Limpa</p>
                        <p className="text-gray-500 dark:text-gray-400 text-sm mt-2 max-w-xs font-medium">Nenhum alerta pendente para esta categoria no momento. Relaxe!</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default NotificationsView;


import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

const LogsView: React.FC = () => {
    const [logs, setLogs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchLogs();
    }, []);

    const fetchLogs = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('distribution')
                .select(`
                    *,
                    vendors(name),
                    products(name, sku)
                `)
                .order('created_at', { ascending: false })
                .limit(100);

            if (data) {
                setLogs(data);
            }
        } catch (error) {
            console.error('Error fetching logs:', error);
        } finally {
            setLoading(false);
        }
    };

    const getTypeStyles = (type: string) => {
        switch (type) {
            case 'Carga': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
            case 'Saída': return 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400';
            case 'Devolução': return 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400';
            case 'Transferência': return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400';
            default: return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400';
        }
    };

    const filteredLogs = logs.filter(log =>
        log.products?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.vendors?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.type?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) {
        return (
            <div className="flex h-96 items-center justify-center">
                <div className="size-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="max-w-[1200px] mx-auto flex flex-col gap-8 pb-10">
            <div className="flex flex-col gap-2">
                <h1 className="text-gray-900 dark:text-white text-4xl font-black leading-tight tracking-tight">Logs de Atividade</h1>
                <p className="text-gray-500 dark:text-gray-400 text-base">Histórico cronológico de todas as movimentações e ações no sistema.</p>
            </div>

            <div className="bg-white dark:bg-surface-dark rounded-3xl border border-border-light dark:border-border-dark overflow-hidden shadow-premium">
                <div className="p-6 border-b border-border-light dark:border-border-dark flex flex-wrap items-center justify-between gap-4">
                    <div className="relative w-full max-w-md">
                        <span className="material-symbols-outlined absolute left-3 top-2.5 text-gray-400">search</span>
                        <input
                            className="w-full h-11 pl-10 pr-4 rounded-xl bg-gray-50 dark:bg-gray-900 border-none text-sm focus:ring-2 focus:ring-primary/50 dark:text-white"
                            placeholder="Filtrar por produto, vendedor ou tipo..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <button
                        onClick={fetchLogs}
                        className="p-2.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-all text-gray-500"
                    >
                        <span className="material-symbols-outlined">refresh</span>
                    </button>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50/50 dark:bg-gray-800/50 border-b border-border-light dark:border-border-dark">
                                <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-widest">Horário</th>
                                <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-widest">Ação</th>
                                <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-widest">Produto</th>
                                <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-widest">Vendedor</th>
                                <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-widest text-right">Qtd</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border-light dark:divide-border-dark">
                            {filteredLogs.map((log) => (
                                <tr key={log.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/20 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-medium">
                                        {new Date(log.created_at).toLocaleString('pt-BR')}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${getTypeStyles(log.type)}`}>
                                            {log.type}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col">
                                            <span className="text-sm font-bold text-gray-900 dark:text-white">{log.products?.name || 'N/A'}</span>
                                            <span className="text-[10px] text-gray-500 font-mono italic">{log.products?.sku || '-'}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className="text-sm font-bold text-gray-700 dark:text-gray-300">{log.vendors?.name || 'Sistema'}</span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <span className="text-sm font-black text-primary">{log.quantity}</span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default LogsView;

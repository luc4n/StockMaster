<<<<<<< HEAD

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
=======
import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    AreaChart,
    Area,
    PieChart,
    Pie,
    Cell
} from 'recharts';

interface ProductReport {
    id: string;
    name: string;
    sku: string;
    stock_internal: number;
    price: number;
    image_url: string;
    status: string;
    last_movement?: string;
    turnover_30d: number;
}

const ReportsView: React.FC = () => {
    const [loading, setLoading] = useState(true);
    const [summary, setSummary] = useState({
        totalValue: 0,
        estimatedCost: 0,
        totalItems: 0,
        turnoverRate: 0,
        lowStockItems: 0,
        stagnantItems: 0 // No movement > 30 days
    });
    const [productsReport, setProductsReport] = useState<ProductReport[]>([]);
    const [movementHistory, setMovementHistory] = useState<any[]>([]);
    const [stockComposition, setStockComposition] = useState<any[]>([]);

    useEffect(() => {
        fetchReportData();
    }, []);

    const fetchReportData = async () => {
        setLoading(true);
        try {
            // 1. Fetch Products
            const { data: products, error: pError } = await supabase
                .from('products')
                .select('*');

            if (pError) throw pError;

            // 2. Fetch Distribution History (Last 30 Days for Turnover)
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

            const { data: distribution, error: dError } = await supabase
                .from('distribution')
                .select('*')
                .gte('date', thirtyDaysAgo.toISOString());

            if (dError) throw dError;

            // --- Analysis Logic ---

            let totalVal = 0;
            let totalQty = 0;
            let lowStockCount = 0;
            let stagnantCount = 0;
            let totalExits30d = 0;

            const productAnalysis = products?.map((p: any) => {
                const stock = p.stock_internal || 0;
                const price = p.price || 0;
                totalVal += stock * price;
                totalQty += stock;

                if (stock < 50) lowStockCount++; // Threshold for "Low Stock"

                // Calculate Turnover (Exits) for this product in last 30d
                const exits = distribution?.filter((d: any) =>
                    d.product_id === p.id && (d.type === 'Saída' || d.type === 'Carga')
                ).reduce((acc: number, curr: any) => acc + (curr.quantity || 0), 0) || 0;

                totalExits30d += exits;

                // Stagnant? (Updated check: if no exits in 30d AND has stock)
                const isStagnant = exits === 0 && stock > 0;
                if (isStagnant) stagnantCount++;

                return {
                    ...p,
                    turnover_30d: exits,
                    // If no distribution found ever, last_movement might be created_at specific logic later
                    // For now, turnover_30d is the key health indicator
                };
            }) || [];

            // Sort by Turnover (Desc) to show Movers first, then Stagnant
            productAnalysis.sort((a, b) => b.turnover_30d - a.turnover_30d);

            setProductsReport(productAnalysis);

            // --- Charts Data Preparation ---

            // Movement History (aggregated by day)
            // Mocking "Entries" as random correlated to Exits for visual demo if no proper 'stock_entries' table
            // But we have distribution 'Type'.
            const historyMap: Record<string, { date: string, exits: number, returns: number }> = {};

            // Initialize last 7 days
            for (let i = 6; i >= 0; i--) {
                const d = new Date();
                d.setDate(d.getDate() - i);
                const dateStr = d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
                historyMap[dateStr] = { date: dateStr, exits: 0, returns: 0 };
            }

            distribution?.forEach((d: any) => {
                const date = new Date(d.date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
                if (historyMap[date]) {
                    if (d.type === 'Saída' || d.type === 'Carga') {
                        historyMap[date].exits += (d.quantity || 0);
                    } else if (d.type === 'Devolução') {
                        historyMap[date].returns += (d.quantity || 0);
                    }
                }
            });

            setMovementHistory(Object.values(historyMap));

            // Stock Composition Data
            const activeStock = productsReport.length - lowStockCount - stagnantCount;
            setStockComposition([
                { name: 'Saudável', value: Math.max(0, activeStock), color: '#10b981' }, // Emerald
                { name: 'Baixo Estoque', value: lowStockCount, color: '#f59e0b' }, // Amber
                { name: 'Parado (>30d)', value: stagnantCount, color: '#ef4444' }, // Red
            ]);

            setSummary({
                totalValue: totalVal,
                estimatedCost: totalVal * 0.6, // 60% estimation
                totalItems: totalQty,
                turnoverRate: totalQty > 0 ? (totalExits30d / totalQty) * 100 : 0, // Simplified Turnover Rate
                lowStockItems: lowStockCount,
                stagnantItems: stagnantCount
            });

        } catch (error: any) {
            console.error('Error fetching reports:', error);
        } finally {
            setLoading(false);
        }
    };

    const COLORS = ['#10b981', '#f59e0b', '#ef4444'];

    if (loading) {
        return (
            <div className="flex h-96 items-center justify-center">
                <div className="size-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="max-w-[1200px] mx-auto flex flex-col gap-10 pb-16 px-4">
            <div className="flex flex-col gap-2">
                <div className="flex items-center gap-3">
                    <div className="h-1 w-12 bg-primary rounded-full"></div>
                    <span className="text-primary font-black uppercase tracking-[0.2em] text-[10px]">Business Intelligence</span>
                </div>
                <h1 className="text-gray-900 dark:text-white text-5xl font-black leading-tight tracking-tighter">
                    Saúde do <span className="text-primary">Estoque</span>
                </h1>
                <p className="text-gray-500 dark:text-gray-400 text-lg font-medium">
                    Análise completa de custos, giro e eficiência do inventário.
                </p>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white dark:bg-surface-dark p-6 rounded-[2rem] shadow-premium border border-gray-100 dark:border-gray-800">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="size-12 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                            <span className="material-symbols-outlined text-2xl font-bold">paid</span>
                        </div>
                        <div>
                            <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Valor em Estoque</p>
                            <h3 className="text-2xl font-black text-gray-900 dark:text-white">
                                {summary.totalValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                            </h3>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 text-xs font-medium text-gray-400 bg-gray-50 dark:bg-gray-800 p-2 rounded-lg">
                        <span className="material-symbols-outlined text-sm">info</span>
                        Custo Est: {(summary.estimatedCost).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </div>
                </div>

                <div className="bg-white dark:bg-surface-dark p-6 rounded-[2rem] shadow-premium border border-gray-100 dark:border-gray-800">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="size-12 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400">
                            <span className="material-symbols-outlined text-2xl font-bold">inventory_2</span>
                        </div>
                        <div>
                            <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Total de Itens</p>
                            <h3 className="text-2xl font-black text-gray-900 dark:text-white">
                                {summary.totalItems.toLocaleString()} <span className="text-sm font-bold text-gray-400">un</span>
                            </h3>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 text-xs font-medium text-gray-400 bg-gray-50 dark:bg-gray-800 p-2 rounded-lg">
                        <span className="material-symbols-outlined text-sm">category</span>
                        {productsReport.length} SKUs Ativos
                    </div>
                </div>

                <div className="bg-white dark:bg-surface-dark p-6 rounded-[2rem] shadow-premium border border-gray-100 dark:border-gray-800">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="size-12 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-purple-600 dark:text-purple-400">
                            <span className="material-symbols-outlined text-2xl font-bold">autorenew</span>
                        </div>
                        <div>
                            <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Giro (30d)</p>
                            <h3 className="text-2xl font-black text-gray-900 dark:text-white">
                                {summary.turnoverRate.toFixed(1)}%
                            </h3>
                        </div>
                    </div>
                    <div className="w-full bg-gray-100 dark:bg-gray-800 h-1.5 rounded-full overflow-hidden">
                        <div className="h-full bg-purple-500" style={{ width: `${Math.min(100, summary.turnoverRate)}%` }}></div>
                    </div>
                </div>

                <div className="bg-white dark:bg-surface-dark p-6 rounded-[2rem] shadow-premium border border-gray-100 dark:border-gray-800">
                    <div className="flex items-center gap-4 mb-4">
                        <div className={`size-12 rounded-xl flex items-center justify-center ${summary.stagnantItems > 0 ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400' : 'bg-green-100 text-green-600'}`}>
                            <span className="material-symbols-outlined text-2xl font-bold">warning</span>
                        </div>
                        <div>
                            <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Parados (+30d)</p>
                            <h3 className="text-2xl font-black text-gray-900 dark:text-white">
                                {summary.stagnantItems} <span className="text-sm font-bold text-gray-400">alertas</span>
                            </h3>
                        </div>
                    </div>
                    <p className="text-xs text-gray-400 font-medium">Itens sem saída há mais de 30 dias.</p>
                </div>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Movement History */}
                <div className="lg:col-span-2 bg-white dark:bg-surface-dark p-8 rounded-[2.5rem] shadow-premium border border-gray-100 dark:border-gray-800">
                    <div className="flex items-center justify-between mb-8">
                        <h3 className="text-xl font-black text-gray-900 dark:text-white">Histórico de Movimentação</h3>
                        <div className="flex gap-4">
                            <div className="flex items-center gap-2">
                                <div className="size-3 rounded-full bg-primary"></div>
                                <span className="text-xs font-bold text-gray-500">Saídas</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="size-3 rounded-full bg-amber-400"></div>
                                <span className="text-xs font-bold text-gray-500">Retornos</span>
                            </div>
                        </div>
                    </div>
                    <div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={movementHistory}>
                                <defs>
                                    <linearGradient id="colorExits" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#137fec" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#137fec" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} dy={10} />
                                <YAxis hide />
                                <Tooltip
                                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
                                />
                                <Area type="monotone" dataKey="exits" stroke="#137fec" strokeWidth={3} fillOpacity={1} fill="url(#colorExits)" />
                                <Area type="monotone" dataKey="returns" stroke="#fbbf24" strokeWidth={3} fill="none" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Stock Composition */}
                <div className="bg-white dark:bg-surface-dark p-8 rounded-[2.5rem] shadow-premium border border-gray-100 dark:border-gray-800">
                    <h3 className="text-xl font-black text-gray-900 dark:text-white mb-8">Composição de Saúde</h3>
                    <div className="h-[250px] relative">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={stockComposition}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {stockComposition.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} strokeWidth={0} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                        {/* Centered Total */}
                        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                            <span className="text-3xl font-black text-gray-900 dark:text-white">{Math.round(summary.turnoverRate)}%</span>
                            <span className="text-[10px] uppercase font-black text-gray-400 tracking-widest">Giro Médio</span>
                        </div>
                    </div>
                    <div className="flex flex-col gap-3 mt-4">
                        {stockComposition.map((item, idx) => (
                            <div key={idx} className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className="size-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                                    <span className="text-sm font-bold text-gray-600 dark:text-gray-300">{item.name}</span>
                                </div>
                                <span className="text-sm font-black text-gray-900 dark:text-white">{item.value}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Detailed Table */}
            <div className="bg-white dark:bg-surface-dark rounded-[2.5rem] shadow-premium border border-gray-100 dark:border-gray-800 overflow-hidden">
                <div className="p-8 border-b border-gray-100 dark:border-gray-800">
                    <h3 className="text-xl font-black text-gray-900 dark:text-white">Análise Detalhada por Produto</h3>
                    <p className="text-sm text-gray-500 font-medium">Identifique oportunidades de compra ou liquidação.</p>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50 dark:bg-gray-800/50">
                                <th className="p-6 text-xs font-black text-gray-400 uppercase tracking-widest">Produto</th>
                                <th className="p-6 text-xs font-black text-gray-400 uppercase tracking-widest text-right">Estoque</th>
                                <th className="p-6 text-xs font-black text-gray-400 uppercase tracking-widest text-right">Custo Est. (un)</th>
                                <th className="p-6 text-xs font-black text-gray-400 uppercase tracking-widest text-right">Giro (30d)</th>
                                <th className="p-6 text-xs font-black text-gray-400 uppercase tracking-widest text-center">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                            {productsReport.map((product) => {
                                const isStagnant = product.turnover_30d === 0 && product.stock_internal > 0;
                                return (
                                    <tr key={product.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors group">
                                        <td className="p-6">
                                            <div className="flex items-center gap-4">
                                                <div className="size-10 rounded-lg bg-gray-100 dark:bg-gray-800 bg-cover bg-center" style={{ backgroundImage: `url('${product.image_url}')` }}></div>
                                                <div>
                                                    <p className="font-bold text-gray-900 dark:text-white">{product.name}</p>
                                                    <p className="text-xs text-gray-500 font-mono">{product.sku}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-6 text-right font-bold text-gray-700 dark:text-gray-300">
                                            {product.stock_internal}
                                        </td>
                                        <td className="p-6 text-right font-mono text-gray-600 dark:text-gray-400">
                                            {(product.price * 0.6).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                        </td>
                                        <td className="p-6 text-right">
                                            <span className={`font-black ${product.turnover_30d > 50 ? 'text-emerald-500' : 'text-gray-900 dark:text-white'}`}>
                                                {product.turnover_30d}
                                            </span>
                                        </td>
                                        <td className="p-6 text-center">
                                            {isStagnant ? (
                                                <span className="inline-flex px-3 py-1 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-full text-[10px] font-black uppercase tracking-wider">
                                                    Parado
                                                </span>
                                            ) : product.stock_internal < 50 ? (
                                                <span className="inline-flex px-3 py-1 bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded-full text-[10px] font-black uppercase tracking-wider">
                                                    Baixo
                                                </span>
                                            ) : (
                                                <span className="inline-flex px-3 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-full text-[10px] font-black uppercase tracking-wider">
                                                    Saudável
                                                </span>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })}
>>>>>>> 62ea112817c0ead1d9e41980007cd447d2c9d6a5
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default ReportsView;

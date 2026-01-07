
import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import DistributionModal from '../components/DistributionModal';
import ReturnModal from '../components/ReturnModal';
import TransferModal from '../components/TransferModal';
import { supabase } from '../supabaseClient';

const Dashboard: React.FC = () => {
  const [isDistModalOpen, setIsDistModalOpen] = useState(false);
  const [isReturnModalOpen, setIsReturnModalOpen] = useState(false);
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [chartData, setChartData] = useState<any[]>([]);
  const [stats, setStats] = useState({
    totalValue: 0,
    totalItems: 0,
    topVendor: 'Carregando...'
  });

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    // This is a simplified fetch - normally we'd do aggregation in SQL
    const { data: distData } = await supabase.from('distribution').select('quantity, type, product_id, vendor_id, products(price), vendors(name)');

    if (distData) {
      let value = 0;
      let items = 0;
      const vendorTotals: Record<string, number> = {};

      const getPrice = (p: any) => {
        if (Array.isArray(p)) return p[0]?.price || 0;
        return p?.price || 0;
      };

      const getName = (v: any) => {
        if (Array.isArray(v)) return v[0]?.name || 'N/A';
        return v?.name || 'N/A';
      };

      distData.forEach((d: any) => {
        const itemVal = (d.quantity || 0) * getPrice(d.products);
        const type = d.type || 'Saída';

        // Additions to possession
        const isAddition = type === 'Saída' || type === 'Transferência (Entrada)';
        // Subtractions from possession
        const isSubtraction = type === 'Devolução' || type === 'Transferência (Saída)';

        const signedVal = isAddition ? itemVal : (isSubtraction ? -itemVal : 0);
        const signedQty = isAddition ? (d.quantity || 0) : (isSubtraction ? -(d.quantity || 0) : 0);

        value += signedVal;
        items += signedQty;

        const vName = getName(d.vendors);
        vendorTotals[vName] = (vendorTotals[vName] || 0) + signedVal;
      });

      const topV = Object.entries(vendorTotals).sort((a, b) => b[1] - a[1])[0]?.[0] || 'Nenhum';

      const leaderboard = Object.entries(vendorTotals)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([name, val]) => ({ name, value: val }));

      setChartData(leaderboard);
      setStats({
        totalValue: value,
        totalItems: items,
        topVendor: topV
      });
    }
  };

  return (
    <div className="max-w-[1300px] mx-auto flex flex-col gap-10 pb-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-gray-900 dark:text-white text-5xl font-black leading-tight tracking-tighter">
            Stock<span className="text-primary italic">Master</span>
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-lg mt-2">Gestão inteligente de estoque externo e performance de vendedores.</p>
        </div>
        <button className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 px-6 py-3 text-sm font-bold text-gray-700 dark:text-white shadow-premium hover:shadow-premium-hover hover:-translate-y-1 transition-all">
          <span className="material-symbols-outlined text-xl">file_download</span>
          Exportar Inteligência
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        <div className="group bg-white dark:bg-surface-dark rounded-3xl border border-border-light dark:border-border-dark p-8 shadow-premium card-hover overflow-hidden relative">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-150"></div>
          <div className="flex items-center justify-between mb-6 relative">
            <div className="p-3 bg-primary/10 rounded-2xl">
              <span className="material-symbols-outlined text-primary font-bold">payments</span>
            </div>
            <span className="flex items-center px-2 py-1 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-lg text-xs font-bold">
              <span className="material-symbols-outlined text-xs mr-1">trending_up</span>
              12.5%
            </span>
          </div>
          <p className="text-sm font-bold text-gray-500 dark:text-gray-400 mb-1">Valor em Campo</p>
          <p className="text-4xl font-black text-gray-900 dark:text-white tracking-tight">
            R$ {stats.totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </p>
          <p className="mt-4 text-[10px] uppercase font-black tracking-widest text-gray-400">Total Liquidável</p>
        </div>

        <div className="group bg-white dark:bg-surface-dark rounded-3xl border border-border-light dark:border-border-dark p-8 shadow-premium card-hover overflow-hidden relative">
          <div className="absolute top-0 right-0 w-32 h-32 bg-accent/5 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-150"></div>
          <div className="flex items-center justify-between mb-6 relative">
            <div className="p-3 bg-accent/10 rounded-2xl">
              <span className="material-symbols-outlined text-accent font-bold">inventory_2</span>
            </div>
            <span className="flex items-center px-2 py-1 bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-lg text-xs font-bold">
              Estável
            </span>
          </div>
          <p className="text-sm font-bold text-gray-500 dark:text-gray-400 mb-1">Unidades Externas</p>
          <p className="text-4xl font-black text-gray-900 dark:text-white tracking-tight">
            {stats.totalItems.toLocaleString()}
          </p>
          <p className="mt-4 text-[10px] uppercase font-black tracking-widest text-gray-400">Distribuição Ativa</p>
        </div>

        <div className="group bg-white dark:bg-surface-dark rounded-3xl border border-border-light dark:border-border-dark p-8 shadow-premium card-hover overflow-hidden relative">
          <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/5 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-150"></div>
          <div className="flex items-center justify-between mb-6 relative">
            <div className="p-3 bg-purple-500/10 rounded-2xl">
              <span className="material-symbols-outlined text-purple-500 font-bold">auto_graph</span>
            </div>
            <span className="px-3 py-1 bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400 rounded-full text-xs font-bold">Líder</span>
          </div>
          <p className="text-sm font-bold text-gray-500 dark:text-gray-400 mb-1">Performance Top</p>
          <p className="text-3xl font-black text-gray-900 dark:text-white truncate tracking-tight">{stats.topVendor}</p>
          <p className="mt-4 text-[10px] uppercase font-black tracking-widest text-gray-400">Eficiência Máxima</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white dark:bg-surface-dark rounded-3xl border border-border-light dark:border-border-dark p-8 shadow-premium">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-xl font-black text-gray-900 dark:text-white tracking-tight">Top Performance</h3>
              <p className="text-sm text-gray-500 font-medium">Vendedores com maior volume transacionado.</p>
            </div>
            <div className="flex gap-2">
              <div className="size-3 rounded-full bg-primary/20"></div>
              <div className="size-3 rounded-full bg-primary/40"></div>
              <div className="size-3 rounded-full bg-primary"></div>
            </div>
          </div>
          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <defs>
                  <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#137fec" stopOpacity={1} />
                    <stop offset="100%" stopColor="#137fec" stopOpacity={0.6} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fontWeight: 600, fill: '#64748b' }}
                  dy={10}
                />
                <YAxis hide />
                <Tooltip
                  cursor={{ fill: '#f8fafc', radius: 10 }}
                  contentStyle={{
                    borderRadius: '16px',
                    border: 'none',
                    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
                    padding: '12px'
                  }}
                />
                <Bar dataKey="value" fill="url(#barGradient)" radius={[10, 10, 0, 0]} barSize={45} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white dark:bg-surface-dark rounded-3xl border border-border-light dark:border-border-dark p-8 shadow-premium">
          <h3 className="text-xl font-black text-gray-900 dark:text-white mb-8 tracking-tight">Ações Inteligentes</h3>
          <div className="grid grid-cols-1 gap-4">
            {([
              { icon: 'add_box', label: 'Nova Saída', sub: 'Distribuir estoque', color: 'bg-primary/10 text-primary', action: () => setIsDistModalOpen(true) },
              { icon: 'assignment_return', label: 'Devolução', sub: 'Retorno de itens', color: 'bg-accent/10 text-accent', action: () => setIsReturnModalOpen(true) },
              { icon: 'sync_alt', label: 'Transferência', sub: 'Entre vendedores', color: 'bg-purple-500/10 text-purple-600', action: () => setIsTransferModalOpen(true) },
            ] as const).map((action, idx) => (
              <button
                key={idx}
                onClick={action.action}
                className="group flex flex-col items-start w-full p-5 rounded-2xl border border-border-light dark:border-border-dark hover:border-primary/50 hover:bg-primary/[0.02] transition-all duration-300 relative overflow-hidden active:scale-[0.98]"
              >
                <div className={`p-3 ${action.color} rounded-xl mb-3 transition-transform group-hover:scale-110 group-hover:rotate-3`}>
                  <span className="material-symbols-outlined text-2xl font-bold">{action.icon}</span>
                </div>
                <p className="text-sm font-black text-gray-900 dark:text-white">{action.label}</p>
                <p className="text-[11px] text-gray-500 font-bold uppercase tracking-wider mt-1">{action.sub}</p>
                <div className="absolute top-4 right-4 text-gray-300 group-hover:text-primary transition-colors">
                  <span className="material-symbols-outlined font-bold">arrow_outward</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      <DistributionModal
        isOpen={isDistModalOpen}
        onClose={() => setIsDistModalOpen(false)}
        onSuccess={fetchDashboardStats}
      />
      <ReturnModal
        isOpen={isReturnModalOpen}
        onClose={() => setIsReturnModalOpen(false)}
        onSuccess={fetchDashboardStats}
      />

      <TransferModal
        isOpen={isTransferModalOpen}
        onClose={() => setIsTransferModalOpen(false)}
        onSuccess={fetchDashboardStats}
      />

      <div className="bg-white dark:bg-surface-dark rounded-3xl border border-border-light dark:border-border-dark p-8 shadow-premium mt-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h3 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">Ranking <span className="text-primary italic">Top Performance</span></h3>
            <p className="text-sm text-gray-500 font-medium">Os 5 vendedores com maior volume total sob gestão.</p>
          </div>
          <div className="p-3 bg-amber-100 dark:bg-amber-900/20 rounded-2xl">
            <span className="material-symbols-outlined text-amber-600 dark:text-amber-500 font-bold">workspace_premium</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          {chartData.map((v, idx) => (
            <div key={idx} className="relative group bg-gray-50/50 dark:bg-gray-800/30 rounded-2xl p-6 border border-transparent hover:border-primary/20 hover:bg-white dark:hover:bg-gray-800 transition-all duration-300 card-hover shadow-sm hover:shadow-premium">
              <div className={`absolute -top-3 -left-3 size-10 rounded-xl shadow-lg flex items-center justify-center border-2 border-white dark:border-gray-800 z-10 font-black text-lg ${idx === 0 ? 'bg-amber-400 text-white' : idx === 1 ? 'bg-slate-400 text-white' : idx === 2 ? 'bg-orange-400 text-white' : 'bg-white dark:bg-gray-700 text-gray-400'}`}>
                {idx + 1}
              </div>

              <div className="flex flex-col items-center text-center">
                <div className="size-20 rounded-3xl bg-cover bg-center mb-4 border-4 border-white dark:border-gray-800 shadow-premium" style={{ backgroundImage: `url('https://picsum.photos/seed/${v.name}/100')` }}></div>
                <p className="text-sm font-black text-gray-900 dark:text-white truncate w-full mb-1">{v.name}</p>
                <p className="text-[10px] text-gray-400 uppercase font-black tracking-widest mb-4">Volume Gestão</p>

                <div className="w-full bg-gray-200 dark:bg-gray-700 h-2 rounded-full mb-3 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-1000 ${idx === 0 ? 'bg-amber-400' : 'bg-primary'}`}
                    style={{ width: `${(v.value / (chartData[0]?.value || 1)) * 100}%` }}
                  ></div>
                </div>

                <p className="text-base font-black text-gray-900 dark:text-white">
                  R$ {v.value.toLocaleString('pt-BR', { minimumFractionDigits: 0 })}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

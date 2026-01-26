
import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ComposedChart, Line, PieChart, Pie, Cell } from 'recharts';
import DistributionModal from '../components/DistributionModal';
import ReturnModal from '../components/ReturnModal';
import TransferModal from '../components/TransferModal';
import StockEntryModal from '../components/StockEntryModal';
import AddProductModal from '../components/AddProductModal';
import { supabase } from '../supabaseClient';

const Dashboard: React.FC = () => {
  const [isDistModalOpen, setIsDistModalOpen] = useState(false);
  const [isReturnModalOpen, setIsReturnModalOpen] = useState(false);
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [isStockEntryModalOpen, setIsStockEntryModalOpen] = useState(false);
  const [isAddProductModalOpen, setIsAddProductModalOpen] = useState(false);
  const [selectedStagnantProduct, setSelectedStagnantProduct] = useState<string | undefined>();
  const [chartData, setChartData] = useState<any[]>([]);
  const [stats, setStats] = useState({
    topVendor: 'Carregando...',
    stagnantCount: 0,
    totalValue: 0,
    totalItems: 0
  });
  const [stagnantProducts, setStagnantProducts] = useState<any[]>([]);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    // This is a simplified fetch - normally we'd do aggregation in SQL
    const { data: distData } = await supabase.from('distribution').select('quantity, type, product_id, vendor_id, products(price), vendors(name)');

    if (distData) {
      let value = 0;
      let items = 0;
      const vendorStats: Record<string, { value: number; quantity: number }> = {};

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
        const isAddition = type === 'Saída' || type === 'Transferência (Entrada)' || type === 'Carga';
        // Subtractions from possession
        const isSubtraction = type === 'Devolução' || type === 'Transferência (Saída)';

        const signedVal = isAddition ? itemVal : (isSubtraction ? -itemVal : 0);
        const signedQty = isAddition ? (d.quantity || 0) : (isSubtraction ? -(d.quantity || 0) : 0);

        value += signedVal;
        items += signedQty;

        const vName = getName(d.vendors);
        if (!vendorStats[vName]) vendorStats[vName] = { value: 0, quantity: 0 };

        vendorStats[vName].value += signedVal;
        vendorStats[vName].quantity += signedQty;
      });

      const leaderboard = Object.entries(vendorStats)
        .sort((a, b) => b[1].value - a[1].value)
        .slice(0, 5)
        .map(([name, stats]) => ({ name, value: stats.value, quantity: stats.quantity }));

      // Market Share Data
      const totalMarketValue = Object.values(vendorStats).reduce((acc, curr) => acc + curr.value, 0);
      const marketShare = leaderboard.map(v => ({
        name: v.name,
        value: v.value,
        percent: (v.value / totalMarketValue) * 100
      }));

      setChartData({ leaderboard, marketShare });

      // Fetch Stagnant Products (simplified logic for Dashboard)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const { data: recentDists } = await supabase
        .from('distribution')
        .select('product_id')
        .gte('created_at', thirtyDaysAgo.toISOString())
        .in('type', ['Saída', 'Carga']);

      const movedProductIds = new Set(recentDists?.map(d => d.product_id) || []);

      const { data: allProducts } = await supabase
        .from('products')
        .select('id, name, sku, stock_internal, image_url')
        .gt('stock_internal', 0);

      const stagnant = allProducts?.filter(p => !movedProductIds.has(p.id)).slice(0, 3) || [];
      setStagnantProducts(stagnant);

      setStats({
        totalValue: value,
        totalItems: items,
        topVendor: leaderboard[0]?.name || 'Nenhum',
        stagnantCount: stagnant.length
      });
    }
  };

  const handleExport = () => {
    console.log('Exporting CSV with data:', chartData.leaderboard);
    if (!chartData.leaderboard || chartData.leaderboard.length === 0) {
      console.warn('No data to export');
      return;
    }

    const headers = ['Vendedor', 'Volume Gerenciado (R$)', 'Quantidade de Itens'];
    const rows = chartData.leaderboard.map((v: any) => [v.name, v.value.toFixed(2), v.quantity]);

    const csvContent = [
      headers.join(','),
      ...rows.map((row: any) => row.join(','))
    ].join('\n');

    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `performance_vendedores_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Expanded Colors for Charts
  const COLORS = ['#137fec', '#8b5cf6', '#10b981', '#f59e0b', '#ec4899', '#6366f1'];

  return (
    <div className="max-w-[1300px] mx-auto flex flex-col gap-10 pb-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-7xl font-black leading-tight" style={{ fontFamily: 'Bebas Neue, sans-serif', letterSpacing: '0.15em' }}>
            <span className="text-gray-900 dark:text-white">Gestão inteligente de</span>{' '}
            <span className="text-blue-600 dark:text-blue-400">estoque</span>
          </h1>
        </div>
        <button
          onClick={handleExport}
          className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 px-6 py-3 text-sm font-bold text-gray-700 dark:text-white shadow-premium hover:shadow-premium-hover hover:-translate-y-1 transition-all"
        >
          <span className="material-symbols-outlined text-xl">file_download</span>
          Exportar
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

      <div className="bg-white dark:bg-surface-dark rounded-3xl border border-border-light dark:border-border-dark p-8 shadow-premium">
        <h3 className="text-xl font-black text-gray-900 dark:text-white mb-6 tracking-tight">Ações Rápidas</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
          <button
            onClick={() => setIsAddProductModalOpen(true)}
            className="flex flex-col items-center justify-center gap-3 p-6 rounded-2xl bg-primary/5 hover:bg-primary/10 border border-primary/10 transition-all group"
          >
            <span className="material-symbols-outlined text-primary text-3xl group-hover:scale-110 transition-transform">add_box</span>
            <span className="text-xs font-bold text-gray-700 dark:text-gray-300">Novo Produto</span>
          </button>
          <button
            onClick={() => setIsDistModalOpen(true)}
            className="flex flex-col items-center justify-center gap-3 p-6 rounded-2xl bg-indigo-500/5 hover:bg-indigo-500/10 border border-indigo-500/10 transition-all group"
          >
            <span className="material-symbols-outlined text-indigo-500 text-3xl group-hover:scale-110 transition-transform">local_shipping</span>
            <span className="text-xs font-bold text-gray-700 dark:text-gray-300">Nova Carga</span>
          </button>
          <button
            onClick={() => setIsStockEntryModalOpen(true)}
            className="flex flex-col items-center justify-center gap-3 p-6 rounded-2xl bg-emerald-500/5 hover:bg-emerald-500/10 border border-emerald-500/10 transition-all group"
          >
            <span className="material-symbols-outlined text-emerald-500 text-3xl group-hover:scale-110 transition-transform">inventory</span>
            <span className="text-xs font-bold text-gray-700 dark:text-gray-300">Abastecer Geral</span>
          </button>
          <button
            onClick={() => setIsReturnModalOpen(true)}
            className="flex flex-col items-center justify-center gap-3 p-6 rounded-2xl bg-rose-500/5 hover:bg-rose-500/10 border border-rose-500/10 transition-all group"
          >
            <span className="material-symbols-outlined text-rose-500 text-3xl group-hover:scale-110 transition-transform">assignment_return</span>
            <span className="text-xs font-bold text-gray-700 dark:text-gray-300">Registrar Devolução</span>
          </button>
          <button
            onClick={() => setIsTransferModalOpen(true)}
            className="flex flex-col items-center justify-center gap-3 p-6 rounded-2xl bg-amber-500/5 hover:bg-amber-500/10 border border-amber-500/10 transition-all group"
          >
            <span className="material-symbols-outlined text-amber-500 text-3xl group-hover:scale-110 transition-transform">move_up</span>
            <span className="text-xs font-bold text-gray-700 dark:text-gray-300">Transferência</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
        <div className="lg:col-span-2 bg-white dark:bg-surface-dark rounded-3xl border border-rose-100 dark:border-rose-900/20 p-8 shadow-premium relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <span className="material-symbols-outlined text-rose-500 text-9xl">inventory_2</span>
          </div>
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-xl font-black text-gray-900 dark:text-white tracking-tight flex items-center gap-2">
                <span className="material-symbols-outlined text-rose-500">warning</span>
                Alertas de Giro (Estoque Parado)
              </h3>
              <p className="text-sm text-gray-500 font-medium">Itens com estoque mas sem saída nos últimos 30 dias.</p>
            </div>
            <div className="px-4 py-1.5 bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 rounded-full text-xs font-black uppercase tracking-widest">
              Ação Requerida
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {stagnantProducts.length === 0 ? (
              <div className="col-span-3 py-10 text-center bg-emerald-50/30 dark:bg-emerald-900/10 rounded-2xl border border-dashed border-emerald-200 dark:border-emerald-800">
                <span className="material-symbols-outlined text-emerald-500 text-4xl mb-2">check_circle</span>
                <p className="text-sm font-bold text-emerald-700 dark:text-emerald-400">Todo o estoque está em movimento!</p>
              </div>
            ) : (
              stagnantProducts.map((p, idx) => (
                <div key={idx} className="bg-gray-50 dark:bg-gray-800/30 rounded-2xl p-4 border border-border-light dark:border-border-dark flex flex-col items-center text-center group transition-all hover:bg-white dark:hover:bg-gray-800">
                  <div className="size-16 rounded-xl bg-cover bg-center mb-3 shadow-sm border dark:border-gray-700" style={{ backgroundImage: `url('${p.image_url || 'https://picsum.photos/seed/stock/100'}')` }}></div>
                  <p className="text-sm font-bold text-gray-900 dark:text-white truncate w-full">{p.name}</p>
                  <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-3">{p.stock_internal} un paradas</p>
                  <button
                    onClick={() => {
                      setSelectedStagnantProduct(p.id);
                      setIsReturnModalOpen(true);
                    }}
                    className="w-full py-2 bg-white dark:bg-gray-700 border border-rose-200 dark:border-rose-900/40 text-rose-600 dark:text-rose-400 text-xs font-black rounded-lg hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-all"
                  >
                    Recolher Giro
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="bg-gradient-to-br from-primary to-indigo-600 dark:from-primary/80 dark:to-indigo-600/80 rounded-3xl p-8 text-white shadow-premium flex flex-col justify-between">
          <div>
            <div className="size-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center mb-6">
              <span className="material-symbols-outlined text-2xl font-bold">lightbulb</span>
            </div>
            <h3 className="text-xl font-black mb-2 tracking-tight">Oportunidade</h3>
            <p className="text-white/80 text-sm font-medium leading-relaxed">
              Você tem <span className="text-white font-black underline decoration-amber-400">{stats.stagnantCount} produtos</span> que não saíram este mês.
              <br /><br />
              Considere redistribuir esses itens para vendedores em regiões com maior demanda.
            </p>
          </div>
          <button
            onClick={() => setIsTransferModalOpen(true)}
            className="w-full mt-8 py-4 bg-white text-primary font-black rounded-2xl shadow-xl hover:-translate-y-1 transition-all active:scale-95"
          >
            Redistribuir Agora
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
        <div className="lg:col-span-2 bg-white dark:bg-surface-dark rounded-3xl border border-border-light dark:border-border-dark p-8 shadow-premium">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-xl font-black text-gray-900 dark:text-white tracking-tight">Top Performance</h3>
              <p className="text-sm text-gray-500 font-medium">Análise combinada de volume financeiro e físico.</p>
            </div>
            <div className="flex gap-4">
              <div className="flex items-center gap-2">
                <div className="size-3 rounded-full bg-[#137fec]"></div>
                <span className="text-xs font-bold text-gray-500">Valor (R$)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="size-3 rounded-full bg-[#f59e0b]"></div>
                <span className="text-xs font-bold text-gray-500">Qtd. Itens</span>
              </div>
            </div>
          </div>
          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              {/* @ts-ignore */}
              <ComposedChart data={chartData.leaderboard}>
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
                <YAxis yAxisId="left" hide />
                <YAxis yAxisId="right" orientation="right" hide />
                <Tooltip
                  cursor={{ fill: '#f8fafc', radius: 10 }}
                  contentStyle={{
                    borderRadius: '16px',
                    border: 'none',
                    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
                    padding: '12px'
                  }}
                />
                <Bar yAxisId="left" dataKey="value" fill="url(#barGradient)" radius={[10, 10, 0, 0]} barSize={45} />
                <Line yAxisId="right" type="monotone" dataKey="quantity" stroke="#f59e0b" strokeWidth={3} dot={{ r: 4, fill: '#f59e0b', strokeWidth: 2, stroke: '#fff' }} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white dark:bg-surface-dark rounded-3xl border border-border-light dark:border-border-dark p-8 shadow-premium flex flex-col">
          <h3 className="text-xl font-black text-gray-900 dark:text-white mb-2 tracking-tight">Participação de Mercado</h3>
          <p className="text-sm text-gray-500 font-medium mb-6">Participação relativa por valor.</p>

          <div className="flex-1 min-h-[200px] relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData.marketShare}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {/* @ts-ignore */}
                  {chartData.marketShare?.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} strokeWidth={0} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            {/* Centered Label */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-3xl font-black text-gray-900 dark:text-white">Top 5</span>
              <span className="text-[10px] uppercase font-black text-gray-400 tracking-widest">Líderes</span>
            </div>
          </div>

          <div className="flex flex-col gap-3 mt-4">
            {/* @ts-ignore */}
            {chartData.marketShare?.slice(0, 3).map((item, idx) => (
              <div key={idx} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="size-3 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }}></div>
                  <span className="text-sm font-bold text-gray-600 dark:text-gray-300 truncate max-w-[120px]">{item.name}</span>
                </div>
                <span className="text-sm font-black text-gray-900 dark:text-white">{item.percent.toFixed(1)}%</span>
              </div>
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
        onClose={() => {
          setIsReturnModalOpen(false);
          setSelectedStagnantProduct(undefined);
        }}
        onSuccess={fetchDashboardStats}
        defaultProductId={selectedStagnantProduct}
      />

      <TransferModal
        isOpen={isTransferModalOpen}
        onClose={() => {
          setIsTransferModalOpen(false);
          setSelectedStagnantProduct(undefined);
        }}
        onSuccess={fetchDashboardStats}
        defaultProductId={selectedStagnantProduct}
      />

      <StockEntryModal
        isOpen={isStockEntryModalOpen}
        onClose={() => setIsStockEntryModalOpen(false)}
        onSuccess={fetchDashboardStats}
      />

      <AddProductModal
        isOpen={isAddProductModalOpen}
        onClose={() => setIsAddProductModalOpen(false)}
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
          {/* @ts-ignore */}
          {chartData.leaderboard?.map((v, idx) => (
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
                    // @ts-ignore
                    style={{ width: `${(v.value / (chartData.leaderboard[0]?.value || 1)) * 100}%` }}
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

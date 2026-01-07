
import React, { useState, useEffect } from 'react';
import { Vendor } from '../types';
import { supabase } from '../supabaseClient';

interface VendorsViewProps {
  onSelectVendor: (vendor: Vendor | null) => void;
}

const VendorsView: React.FC<VendorsViewProps> = ({ onSelectVendor }) => {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchVendors();
  }, []);

  const fetchVendors = async () => {
    setLoading(true);
    // Fetch vendors and calculate their possession totals
    const { data: vData } = await supabase.from('vendors').select('*').order('name');
    const { data: dData } = await supabase.from('distribution').select('vendor_id, quantity, type, products(price)');

    if (vData) {
      const formatted = vData.map((v: any) => {
        const vendorDists = dData?.filter(d => d.vendor_id === v.id) || [];
        const getPrice = (p: any) => {
          if (Array.isArray(p)) return p[0]?.price || 0;
          return p?.price || 0;
        };

        const items = vendorDists.reduce((acc, d) => {
          const isAdd = d.type === 'Saída' || d.type === 'Transferência (Entrada)';
          return isAdd ? acc + (d.quantity || 0) : acc - (d.quantity || 0);
        }, 0);
        const val = vendorDists.reduce((acc, d) => {
          const itemVal = (d.quantity || 0) * getPrice(d.products);
          const isAdd = d.type === 'Saída' || d.type === 'Transferência (Entrada)';
          return isAdd ? acc + itemVal : acc - itemVal;
        }, 0);

        return {
          id: v.id,
          name: v.name,
          email: v.email,
          phone: v.phone,
          region: v.region,
          status: v.status,
          avatar: v.avatar_url || `https://picsum.photos/seed/${v.id}/100`,
          stockCount: items,
          stockValue: val
        };
      });
      setVendors(formatted);
    }
    setLoading(false);
  };

  const handleSelect = (vendor: Vendor) => {
    setSelectedVendor(vendor);
    onSelectVendor(vendor);
  };

  const handleClose = () => {
    setSelectedVendor(null);
    onSelectVendor(null);
  };

  const salesHistory = [
    { date: '24/10/2023', items: 12, value: 'R$ 1.200,00', type: 'Carga' },
    { date: '20/10/2023', items: 5, value: 'R$ 450,00', type: 'Venda' },
    { date: '15/10/2023', items: 8, value: 'R$ 890,00', type: 'Venda' },
  ];

  return (
    <div className="max-w-[1200px] mx-auto flex flex-col gap-8 pb-10 relative">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="flex flex-col gap-2">
          <h1 className="text-[#111418] dark:text-white text-3xl md:text-4xl font-black leading-tight tracking-tight">Gestão de Vendedores</h1>
          <p className="text-[#617589] dark:text-gray-400 text-base max-w-2xl">
            Clique em um vendedor para visualizar detalhes de estoque e histórico de atividades.
          </p>
        </div>
        <button className="flex items-center justify-center gap-2 rounded-lg h-11 px-6 bg-primary hover:bg-blue-600 text-white text-sm font-bold shadow-lg shadow-blue-500/20 transition-all active:scale-95">
          <span className="material-symbols-outlined text-[20px]">add</span>
          <span>Novo Vendedor</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[
          { label: 'Total de Vendedores', value: '124', change: '+12%', icon: 'groups' },
          { label: 'Vendedores Ativos', value: '112', change: '+5%', icon: 'verified_user', color: 'text-emerald-600' },
          { label: 'Regiões Cobertas', value: '8', change: 'Capitais', icon: 'map', color: 'text-primary' },
        ].map((stat, i) => (
          <div key={i} className="bg-white dark:bg-[#1e293b] rounded-xl border border-[#dbe0e6] dark:border-gray-700 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <p className="text-gray-500 text-sm font-medium">{stat.label}</p>
              <span className={`material-symbols-outlined ${stat.color || 'text-gray-400'}`}>{stat.icon}</span>
            </div>
            <div className="flex items-baseline gap-2">
              <p className="text-3xl font-bold dark:text-white">{stat.value}</p>
              <span className="inline-flex items-center text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">{stat.change}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white dark:bg-[#1e293b] rounded-xl border border-[#dbe0e6] dark:border-gray-700 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-[#f0f2f4] dark:border-gray-700 flex flex-col md:flex-row gap-4 items-center justify-between">
          <label className="relative flex w-full md:max-w-md">
            <span className="material-symbols-outlined absolute left-3 top-2.5 text-gray-400">search</span>
            <input className="w-full h-11 pl-10 pr-4 rounded-lg bg-gray-50 dark:bg-gray-800 border-none text-sm focus:ring-2 focus:ring-primary/50" placeholder="Buscar por nome, telefone ou região..." />
          </label>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#f9fafb] dark:bg-gray-800/50 border-b border-[#e5e7eb] dark:border-gray-700">
                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-gray-500">Vendedor</th>
                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-gray-500">Região</th>
                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-gray-500">Status</th>
                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-gray-500 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e5e7eb] dark:divide-gray-700">
              {vendors.map((vendor) => (
                <tr
                  key={vendor.id}
                  onClick={() => handleSelect(vendor)}
                  className="group hover:bg-[#f9fafb] dark:hover:bg-gray-800/30 transition-colors cursor-pointer"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-4">
                      <div className="size-10 rounded-full bg-cover bg-center border border-gray-100" style={{ backgroundImage: `url('${vendor.avatar}')` }}></div>
                      <div className="flex flex-col">
                        <span className="text-sm font-semibold text-[#111418] dark:text-white">{vendor.name}</span>
                        <span className="text-xs text-gray-500">{vendor.email}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-xs font-medium bg-gray-100 dark:bg-gray-800 dark:text-gray-300 px-2 py-1 rounded">{vendor.region}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${vendor.status === 'Ativo' ? 'bg-green-100 text-green-800 border-green-200' : 'bg-gray-100 text-gray-800 border-gray-200'
                      }`}>
                      {vendor.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <span className="material-symbols-outlined text-gray-400 group-hover:text-primary transition-colors">visibility</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {selectedVendor && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={handleClose}></div>
          <div className="relative w-full max-w-md bg-white dark:bg-[#101922] h-full shadow-2xl flex flex-col animate-slide-in-right overflow-y-auto">
            <div className="p-6 border-b dark:border-gray-800 flex items-center justify-between bg-primary/5">
              <h3 className="text-xl font-black text-[#111418] dark:text-white">Detalhes do Vendedor</h3>
              <button onClick={handleClose} className="p-2 hover:bg-gray-200 dark:hover:bg-gray-800 rounded-full transition-colors">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="p-6 flex flex-col gap-8">
              <div className="flex items-center gap-4">
                <div className="size-20 rounded-2xl bg-cover bg-center border-4 border-white dark:border-gray-800 shadow-md" style={{ backgroundImage: `url('${selectedVendor.avatar}')` }}></div>
                <div className="flex flex-col">
                  <span className="text-2xl font-bold dark:text-white">{selectedVendor.name}</span>
                  <span className="text-sm text-primary font-medium">{selectedVendor.region}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-xl border dark:border-gray-700">
                  <span className="text-xs text-gray-500 block mb-1">Itens em Mãos</span>
                  <span className="text-xl font-bold dark:text-white">{selectedVendor.stockCount || 0} un.</span>
                </div>
                <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-xl border dark:border-gray-700">
                  <span className="text-xs text-gray-500 block mb-1">Valor Total</span>
                  <span className="text-xl font-bold text-primary">R$ {(selectedVendor.stockValue || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="text-sm font-bold uppercase text-gray-400 tracking-widest">Contatos</h4>
                <div className="text-sm dark:text-gray-300 flex flex-col gap-1">
                  <p>{selectedVendor.email}</p>
                  <p>{selectedVendor.phone}</p>
                </div>
              </div>

              <div className="flex flex-col gap-4">
                <h4 className="text-sm font-bold uppercase text-gray-400 tracking-widest">Histórico Recente</h4>
                {salesHistory.map((act, i) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-xl border dark:border-gray-800">
                    <span className="text-sm font-bold dark:text-white">{act.type}</span>
                    <span className="text-sm font-bold dark:text-white">{act.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes slide-in-right {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
        .animate-slide-in-right {
          animation: slide-in-right 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }
      `}</style>
    </div>
  );
};

export default VendorsView;

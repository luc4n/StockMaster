
import React, { useState, useEffect } from 'react';
import { Vendor } from '../types';
import { supabase } from '../supabaseClient';
import VendorModal from '../components/VendorModal';
import { toast } from 'sonner';

interface VendorsViewProps {
  onSelectVendor: (vendor: Vendor | null) => void;
}

const VendorsView: React.FC<VendorsViewProps> = ({ onSelectVendor }) => {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [visibleCount, setVisibleCount] = useState(15);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingVendor, setEditingVendor] = useState<Vendor | null>(null);

  useEffect(() => {
    fetchVendors();
  }, []);

  const fetchVendors = async () => {
    setLoading(true);
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
          const isAdd = d.type === 'Saída' || d.type === 'Transferência (Entrada)' || d.type === 'Carga';
          return isAdd ? acc + (d.quantity || 0) : acc - (d.quantity || 0);
        }, 0);
        const val = vendorDists.reduce((acc, d) => {
          const itemVal = (d.quantity || 0) * getPrice(d.products);
          const isAdd = d.type === 'Saída' || d.type === 'Transferência (Entrada)' || d.type === 'Carga';
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

  const handleEditClick = (vendor: Vendor, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingVendor(vendor);
    setIsModalOpen(true);
  };

  const handleDeleteVendor = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm('Deseja realmente excluir este vendedor? Esta ação não pode ser desfeita.')) return;

    setLoading(true);
    const { error } = await supabase.from('vendors').delete().eq('id', id);

    if (error) {
      toast.error('Erro ao excluir vendedor: ' + error.message);
    } else {
      toast.success('Vendedor excluído com sucesso');
      fetchVendors();
    }
    setLoading(false);
  };

  const filteredVendors = vendors.filter(v =>
    v.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    v.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    v.phone.toLowerCase().includes(searchTerm.toLowerCase()) ||
    v.region.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const displayedVendors = filteredVendors.slice(0, visibleCount);

  const handleShowMore = () => {
    setVisibleCount(prev => prev + 15);
  };

  const handleSelect = (vendor: Vendor) => {
    setSelectedVendor(vendor);
    onSelectVendor(vendor);
  };

  const handleClose = () => {
    setSelectedVendor(null);
    onSelectVendor(null);
  };

  const [vendorHistory, setVendorHistory] = useState<any[]>([]);

  useEffect(() => {
    if (selectedVendor) {
      const fetchHistory = async () => {
        const { data } = await supabase
          .from('distribution')
          .select('created_at, type, quantity, products(name, price)')
          .eq('vendor_id', selectedVendor.id)
          .order('created_at', { ascending: false })
          .limit(5);

        if (data) {
          const formatted = data.map((d: any) => {
            const price = Array.isArray(d.products) ? d.products[0]?.price : d.products?.price;
            const total = (d.quantity || 0) * (price || 0);
            return {
              date: new Date(d.created_at).toLocaleDateString('pt-BR'),
              items: d.quantity,
              value: `R$ ${total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
              type: d.type
            };
          });
          setVendorHistory(formatted);
        }
      };
      fetchHistory();
    }
  }, [selectedVendor]);

  return (
    <div className="max-w-[1200px] mx-auto flex flex-col gap-8 pb-10 relative">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="flex flex-col gap-2">
          <h1 className="text-[#111418] dark:text-white text-3xl md:text-4xl font-black leading-tight tracking-tight">Gestão de Vendedores</h1>
          <p className="text-[#617589] dark:text-gray-400 text-base max-w-2xl">
            Clique em um vendedor para visualizar detalhes de estoque e histórico de atividades.
          </p>
        </div>
        <button
          onClick={() => {
            setEditingVendor(null);
            setIsModalOpen(true);
          }}
          className="flex items-center justify-center gap-2 rounded-lg h-11 px-6 bg-primary hover:bg-primary-dark text-white text-sm font-bold shadow-lg shadow-primary/20 transition-all active:scale-95"
        >
          <span className="material-symbols-outlined text-[20px]">person_add</span>
          <span>Novo Vendedor</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[
          { label: 'Total de Vendedores', value: vendors.length.toString(), change: '+12%', icon: 'groups' },
          { label: 'Vendedores Ativos', value: vendors.filter(v => v.status === 'Ativo').length.toString(), change: '+5%', icon: 'verified_user', color: 'text-emerald-600' },
          { label: 'Regiões Cobertas', value: Array.from(new Set(vendors.map(v => v.region))).length.toString(), change: 'Capitais', icon: 'map', color: 'text-primary' },
        ].map((stat, i) => (
          <div key={i} className="bg-white dark:bg-surface-dark rounded-xl border border-border-light dark:border-border-dark p-6 shadow-premium">
            <div className="flex items-center justify-between mb-4">
              <p className="text-gray-500 text-sm font-medium">{stat.label}</p>
              <span className={`material-symbols-outlined ${stat.color || 'text-gray-400'}`}>{stat.icon}</span>
            </div>
            <div className="flex items-baseline gap-2">
              <p className="text-3xl font-bold dark:text-white">{stat.value}</p>
              <span className="inline-flex items-center text-xs font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-900/10 px-2 py-1 rounded-full">{stat.change}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white dark:bg-surface-dark rounded-3xl border border-border-light dark:border-border-dark shadow-premium overflow-hidden">
        <div className="p-4 border-b border-border-light dark:border-border-dark flex flex-col md:flex-row gap-4 items-center justify-between">
          <label className="relative flex w-full md:max-w-md">
            <span className="material-symbols-outlined absolute left-3 top-2.5 text-gray-400">search</span>
            <input
              className="w-full h-11 pl-10 pr-4 rounded-lg bg-gray-50 dark:bg-gray-800 border-none text-sm focus:ring-2 focus:ring-primary/50 text-[#111418] dark:text-white"
              placeholder="Buscar por nome, telefone ou região..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </label>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 dark:bg-gray-800/50 border-b border-border-light dark:border-border-dark">
                <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-gray-400">Vendedor</th>
                <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-gray-400">Região</th>
                <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-gray-400">Status</th>
                <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-gray-400 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-light dark:divide-border-dark">
              {displayedVendors.map((vendor) => (
                <tr
                  key={vendor.id}
                  onClick={() => handleSelect(vendor)}
                  className="group hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors cursor-pointer"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-4">
                      <div className="size-10 rounded-full bg-cover bg-center border border-gray-100 dark:border-gray-800" style={{ backgroundImage: `url('${vendor.avatar}')` }}></div>
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-[#111418] dark:text-white">{vendor.name}</span>
                        <span className="text-xs text-gray-500">{vendor.email}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-xs font-medium bg-gray-100 dark:bg-gray-800 dark:text-gray-300 px-2.5 py-1 rounded-lg">{vendor.region}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border transition-all ${vendor.status === 'Ativo' ? 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400' :
                      vendor.status === 'Inativo' ? 'bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-800 dark:text-gray-400' :
                        'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400'
                      }`}>
                      {vendor.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <div className="flex justify-end gap-1 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={(e) => handleEditClick(vendor, e)}
                        className="text-gray-400 hover:text-primary p-1.5 hover:bg-primary/10 rounded-lg transition-all"
                        title="Editar Vendedor"
                      >
                        <span className="material-symbols-outlined text-[20px]">edit</span>
                      </button>
                      <button
                        onClick={(e) => handleDeleteVendor(vendor.id, e)}
                        className="text-gray-400 hover:text-rose-500 p-1.5 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg transition-all"
                        title="Excluir Vendedor"
                      >
                        <span className="material-symbols-outlined text-[20px]">delete</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="p-6 border-t border-border-light dark:border-border-dark flex flex-col md:flex-row items-center justify-between gap-4 mt-auto">
            <p className="text-sm text-gray-500 font-medium">Mostrando <span className="font-bold text-gray-900 dark:text-white">{displayedVendors.length}</span> de <span className="font-bold text-gray-900 dark:text-white">{filteredVendors.length}</span> vendedores</p>

            {filteredVendors.length > visibleCount && (
              <button
                onClick={handleShowMore}
                className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-border-light dark:border-border-dark rounded-xl text-sm font-bold text-primary hover:bg-gray-50 dark:hover:bg-gray-700 transition-all shadow-premium"
              >
                <span className="material-symbols-outlined text-[18px]">add</span>
                Carregar Mais Vendedores
              </button>
            )}
          </div>
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
                <div className="size-20 rounded-2xl bg-cover bg-center border-4 border-white dark:border-gray-800 shadow-premium" style={{ backgroundImage: `url('${selectedVendor.avatar}')` }}></div>
                <div className="flex flex-col">
                  <span className="text-2xl font-black dark:text-white leading-tight">{selectedVendor.name}</span>
                  <span className="text-sm text-primary font-bold uppercase tracking-wider">{selectedVendor.region}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 dark:bg-gray-800/30 p-5 rounded-2xl border dark:border-gray-800 shadow-sm">
                  <span className="text-xs text-gray-400 font-black uppercase tracking-widest block mb-1">Itens em Mãos</span>
                  <span className="text-2xl font-black dark:text-white">{selectedVendor.stockCount || 0} <span className="text-sm font-bold text-gray-400">un.</span></span>
                </div>
                <div className="bg-gray-50 dark:bg-gray-800/30 p-5 rounded-2xl border dark:border-gray-800 shadow-sm">
                  <span className="text-xs text-gray-400 font-black uppercase tracking-widest block mb-1">Valor Total</span>
                  <span className="text-2xl font-black text-primary">R$ {(selectedVendor.stockValue || 0).toLocaleString('pt-BR', { minimumFractionDigits: 0 })}</span>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="text-xs font-black uppercase text-gray-400 tracking-[0.2em]">Contatos e Infos</h4>
                <div className="flex flex-col gap-3">
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-800/20">
                    <span className="material-symbols-outlined text-gray-400">mail</span>
                    <span className="text-sm font-medium dark:text-gray-300">{selectedVendor.email}</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-800/20">
                    <span className="material-symbols-outlined text-gray-400">call</span>
                    <span className="text-sm font-medium dark:text-gray-300">{selectedVendor.phone}</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-4">
                <h4 className="text-xs font-black uppercase text-gray-400 tracking-[0.2em]">Histórico de Carga</h4>
                {vendorHistory.length === 0 ? (
                  <div className="p-8 text-center bg-gray-50 dark:bg-gray-800/20 rounded-2xl border border-dashed border-gray-200 dark:border-gray-700">
                    <p className="text-sm text-gray-400 italic">Sem histórico recente.</p>
                  </div>
                ) : vendorHistory.map((act, i) => (
                  <div key={i} className="flex items-center justify-between p-4 rounded-2xl border border-border-light dark:border-border-dark bg-white dark:bg-surface-dark shadow-sm">
                    <div className="flex flex-col">
                      <span className="text-[10px] font-black uppercase tracking-widest text-primary mb-1">{act.type}</span>
                      <span className="text-sm font-bold dark:text-white">{act.items} itens</span>
                      <span className="text-[10px] text-gray-400 font-medium">{act.date}</span>
                    </div>
                    <span className="text-sm font-black text-gray-900 dark:text-white">{act.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      <VendorModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingVendor(null);
        }}
        onSuccess={fetchVendors}
        editingVendor={editingVendor}
      />

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

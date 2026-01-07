
import React, { useState, useEffect } from 'react';
import { Product } from '../types';
import { supabase } from '../supabaseClient';

const INITIAL_PRODUCTS: Product[] = [
  { id: '1', name: 'Parafusadeira Elétrica 12V', sku: 'FER-2023-X', price: 259.90, stock: 45, image: 'https://picsum.photos/seed/tool1/200', status: 'Em Estoque' },
  { id: '2', name: 'Jogo Chaves Combinadas', sku: 'CHA-1010-J', price: 89.90, stock: 5, image: 'https://picsum.photos/seed/tool2/200', status: 'Baixo Estoque' },
  { id: '3', name: 'Martelo Carpinteiro Pro', sku: 'MAR-0050-P', price: 45.50, stock: 12, image: 'https://picsum.photos/seed/tool3/200', status: 'Em Estoque' },
  { id: '4', name: 'Fita Métrica 5m', sku: 'MET-5000-S', price: 19.99, stock: 0, image: 'https://picsum.photos/seed/tool4/200', status: 'Indisponível' },
];

const ProductsView: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [newName, setNewName] = useState('');
  const [newPrice, setNewPrice] = useState('');
  const [newSku, setNewSku] = useState('');
  const [newStock, setNewStock] = useState('0');
  const [newStatus, setNewStatus] = useState('Em Estoque');

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('name');

    if (data) {
      const formatted = data.map((p: any) => ({
        id: p.id,
        name: p.name,
        sku: p.sku,
        price: Number(p.price),
        stock: p.stock_internal,
        image: p.image_url || 'https://picsum.photos/seed/tool/200',
        status: p.status
      }));
      setProducts(formatted);
    }
    setLoading(false);
  };

  const handleCreateProduct = async () => {
    if (!newName || !newSku) return;

    setLoading(true);
    const { error } = await supabase.from('products').insert({
      name: newName,
      sku: newSku,
      price: parseFloat(newPrice.replace(',', '.')),
      stock_internal: parseInt(newStock),
      status: newStatus,
      image_url: `https://picsum.photos/seed/${newSku}/200`
    });

    if (error) {
      alert('Erro ao salvar produto: ' + error.message);
    } else {
      setNewName('');
      setNewPrice('');
      setNewSku('');
      setNewStock('0');
      fetchProducts();
    }
    setLoading(false);
  };

  const getStatusStyles = (status?: string) => {
    switch (status) {
      case 'Em Estoque':
        return 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800';
      case 'Baixo Estoque':
        return 'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800';
      case 'Indisponível':
        return 'bg-rose-100 text-rose-700 border-rose-200 dark:bg-rose-900/30 dark:text-rose-400 dark:border-rose-800';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-800 dark:text-gray-400';
    }
  };

  return (
    <div className="max-w-[1400px] mx-auto flex flex-col gap-8">
      <div className="flex flex-wrap justify-between items-end gap-4">
        <div className="flex flex-col gap-2">
          <h1 className="text-[#111418] dark:text-white text-3xl md:text-4xl font-black leading-tight tracking-tight">Catálogo de Produtos</h1>
          <p className="text-[#617589] dark:text-gray-400 text-base max-w-2xl">
            Gerencie o inventário disponível para sua equipe externa. Adicione novos itens, atualize preços e controle a disponibilidade.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Form */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          <div className="bg-white dark:bg-surface-dark rounded-xl border border-[#dbe0e6] dark:border-gray-800 shadow-sm overflow-hidden sticky top-6">
            <div className="px-5 py-4 border-b border-[#f0f2f4] dark:border-gray-800 flex justify-between items-center bg-gray-50/50 dark:bg-gray-800/30">
              <h3 className="text-[#111418] dark:text-white text-lg font-bold">Novo Produto</h3>
              <span className="material-symbols-outlined text-gray-400">add_circle</span>
            </div>
            <div className="p-5 flex flex-col gap-5">
              <label className="flex flex-col gap-2">
                <span className="text-sm font-semibold dark:text-gray-200">Nome do Produto</span>
                <input
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="rounded-lg border-[#dbe0e6] dark:border-gray-700 dark:bg-gray-900 dark:text-white h-12 px-4 outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Ex: Kit de Ferramentas Pro"
                />
              </label>
              <div className="grid grid-cols-2 gap-4">
                <label className="flex flex-col gap-2">
                  <span className="text-sm font-semibold dark:text-gray-200">Preço (R$)</span>
                  <input
                    value={newPrice}
                    onChange={(e) => setNewPrice(e.target.value)}
                    className="rounded-lg border-[#dbe0e6] dark:border-gray-700 dark:bg-gray-900 dark:text-white h-12 px-4 outline-none focus:ring-2 focus:ring-primary"
                    placeholder="0,00"
                  />
                </label>
                <label className="flex flex-col gap-2">
                  <span className="text-sm font-semibold dark:text-gray-200">SKU / Cód.</span>
                  <input
                    value={newSku}
                    onChange={(e) => setNewSku(e.target.value)}
                    className="rounded-lg border-[#dbe0e6] dark:border-gray-700 dark:bg-gray-900 dark:text-white h-12 px-4 outline-none focus:ring-2 focus:ring-primary"
                    placeholder="REF-000"
                  />
                </label>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <label className="flex flex-col gap-2">
                  <span className="text-sm font-semibold dark:text-gray-200">Estoque Inicial</span>
                  <input
                    type="number"
                    value={newStock}
                    onChange={(e) => setNewStock(e.target.value)}
                    className="rounded-lg border-[#dbe0e6] dark:border-gray-700 dark:bg-gray-900 dark:text-white h-12 px-4 outline-none focus:ring-2 focus:ring-primary"
                    placeholder="0"
                  />
                </label>
                <label className="flex flex-col gap-2">
                  <span className="text-sm font-semibold dark:text-gray-200">Status</span>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value)}
                    className="rounded-lg border-[#dbe0e6] dark:border-gray-700 dark:bg-gray-900 dark:text-white h-12 px-4 outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option>Em Estoque</option>
                    <option>Baixo Estoque</option>
                    <option>Indisponível</option>
                  </select>
                </label>
              </div>
            </div>
            <div className="p-5 border-t border-[#f0f2f4] dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/30 flex gap-3">
              <button
                onClick={handleCreateProduct}
                disabled={loading || !newName || !newSku}
                className="flex-1 h-12 bg-primary hover:bg-blue-600 text-white font-medium rounded-lg shadow-sm disabled:opacity-50 transition-all flex items-center justify-center"
              >
                {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Salvar Produto'}
              </button>
              <button className="h-12 px-6 bg-white dark:bg-gray-700 border border-[#dbe0e6] dark:border-gray-600 text-[#111418] dark:text-white font-medium rounded-lg">Cancelar</button>
            </div>
          </div>
        </div>

        {/* Right Column: Table */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          <div className="bg-white dark:bg-surface-dark rounded-xl border border-[#dbe0e6] dark:border-gray-800 shadow-sm flex flex-col min-h-[600px]">
            <div className="p-4 border-b border-[#f0f2f4] dark:border-gray-800 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-2 text-gray-400">search</span>
                  <input className="h-10 pl-10 pr-4 rounded-lg bg-gray-50 dark:bg-gray-900 border-none ring-1 ring-gray-200 dark:ring-gray-700 w-64 md:w-80 text-sm" placeholder="Buscar por nome ou SKU..." />
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50/50 dark:bg-gray-800/50 border-b border-[#f0f2f4] dark:border-gray-800">
                    <th className="py-4 px-6 text-xs font-semibold uppercase text-gray-500">Produto</th>
                    <th className="py-4 px-6 text-xs font-semibold uppercase text-gray-500">Preço</th>
                    <th className="py-4 px-6 text-xs font-semibold uppercase text-gray-500">Qtd. Estoque</th>
                    <th className="py-4 px-6 text-xs font-semibold uppercase text-gray-500">Status</th>
                    <th className="py-4 px-6 text-xs font-semibold uppercase text-gray-500 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#f0f2f4] dark:divide-gray-800">
                  {products.map(p => (
                    <tr key={p.id} className="group hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-4">
                          <div className="size-12 rounded-lg bg-cover bg-center shrink-0 border border-gray-100 dark:border-gray-700" style={{ backgroundImage: `url('${p.image}')` }}></div>
                          <div className="flex flex-col">
                            <span className="text-sm font-semibold dark:text-white">{p.name}</span>
                            <span className="text-xs text-gray-500">SKU: {p.sku}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <span className="text-sm font-medium dark:text-white">R$ {p.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                      </td>
                      <td className="py-4 px-6">
                        <span className="text-sm font-medium dark:text-white">{p.stock} un</span>
                      </td>
                      <td className="py-4 px-6">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border transition-all ${getStatusStyles(p.status)}`}>
                          <span className={`size-2 rounded-full ${p.status === 'Em Estoque' ? 'bg-emerald-500' :
                              p.status === 'Baixo Estoque' ? 'bg-amber-500' :
                                'bg-rose-500'
                            }`}></span>
                          {p.status}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-right">
                        <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100">
                          <button className="text-gray-400 hover:text-primary p-1 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-md transition-colors"><span className="material-symbols-outlined text-[20px]">edit</span></button>
                          <button className="text-gray-400 hover:text-red-500 p-1 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors"><span className="material-symbols-outlined text-[20px]">delete</span></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="p-4 border-t border-[#f0f2f4] dark:border-gray-800 flex items-center justify-between mt-auto">
              <p className="text-sm text-gray-500">Mostrando <span className="font-medium text-gray-900 dark:text-white">{products.length}</span> produtos</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductsView;

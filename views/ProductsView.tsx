
import React, { useState, useEffect } from 'react';
import { Product } from '../types';
import { supabase } from '../supabaseClient';
import AddProductModal from '../components/AddProductModal';
import { toast } from 'sonner';

const ProductsView: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [visibleCount, setVisibleCount] = useState(15);

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

  const handleEditClick = (product: Product) => {
    setEditingProduct(product);
    setIsModalOpen(true);
  };

  const handleDeleteProduct = async (id: string) => {
    if (!window.confirm('Deseja realmente excluir este produto? Esta ação não pode ser desfeita.')) return;

    setLoading(true);
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id);

    if (error) {
      alert('Erro ao excluir produto: ' + error.message);
    } else {
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

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.sku.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const displayedProducts = filteredProducts.slice(0, visibleCount);

  const handleShowMore = () => {
    setVisibleCount(prev => prev + 15);
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
        <button
          onClick={() => {
            setEditingProduct(null);
            setIsModalOpen(true);
          }}
          className="flex items-center justify-center gap-2 rounded-lg h-11 px-6 bg-primary hover:bg-primary-dark text-white text-sm font-bold shadow-lg shadow-primary/20 transition-all active:scale-95"
        >
          <span className="material-symbols-outlined text-[20px]">add</span>
          <span>Novo Produto</span>
        </button>
      </div>

      <div className="flex flex-col gap-6">
        <div className="bg-white dark:bg-surface-dark rounded-xl border border-[#dbe0e6] dark:border-gray-800 shadow-sm flex flex-col min-h-[600px]">
          <div className="p-4 border-b border-[#f0f2f4] dark:border-gray-800 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-2 text-gray-400">search</span>
                <input
                  className="h-10 pl-10 pr-4 rounded-lg bg-gray-50 dark:bg-gray-900 border-none ring-1 ring-gray-200 dark:ring-gray-700 w-64 md:w-80 text-sm dark:text-white"
                  placeholder="Buscar por nome ou SKU..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
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
                {displayedProducts.map(p => (
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
                      <div className="flex justify-end gap-1 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => handleEditClick(p)}
                          className="text-gray-400 hover:text-primary p-1.5 hover:bg-primary/10 rounded-lg transition-all"
                          title="Editar Produto"
                        >
                          <span className="material-symbols-outlined text-[20px]">edit</span>
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(p.id)}
                          className="text-gray-400 hover:text-rose-500 p-1.5 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg transition-all"
                          title="Excluir Produto"
                        >
                          <span className="material-symbols-outlined text-[20px]">delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="p-4 border-t border-[#f0f2f4] dark:border-gray-800 flex flex-col md:flex-row items-center justify-between gap-4 mt-auto">
            <p className="text-sm text-gray-500">Mostrando <span className="font-medium text-gray-900 dark:text-white">{displayedProducts.length}</span> de <span className="font-medium text-gray-900 dark:text-white">{filteredProducts.length}</span> produtos</p>

            {filteredProducts.length > visibleCount && (
              <button
                onClick={handleShowMore}
                className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm font-bold text-primary hover:bg-gray-50 dark:hover:bg-gray-700 transition-all shadow-sm"
              >
                <span className="material-symbols-outlined text-[18px]">add</span>
                Carregar Mais Produtos
              </button>
            )}
          </div>
        </div>
      </div>

      <AddProductModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingProduct(null);
        }}
        onSuccess={fetchProducts}
        editingProduct={editingProduct}
      />
    </div>
  );
};

export default ProductsView;

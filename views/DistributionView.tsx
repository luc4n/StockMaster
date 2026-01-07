
import React, { useState } from 'react';
import { Product, CartItem } from '../types';

const CATALOG: Product[] = [
  { id: 'p1', name: 'Refrigerante Cola 2L', sku: 'REF-001', price: 8.50, stock: 450, image: 'https://picsum.photos/seed/coke/100' },
  { id: 'p2', name: 'Suco de Laranja 1L', sku: 'SUC-023', price: 6.20, stock: 120, image: 'https://picsum.photos/seed/juice/100' },
  { id: 'p3', name: 'Água Mineral s/ Gás 500ml', sku: 'AGU-050', price: 2.00, stock: 35, image: 'https://picsum.photos/seed/water/100' },
  { id: 'p4', name: 'Batata Chips Original 50g', sku: 'SNA-012', price: 4.50, stock: 200, image: 'https://picsum.photos/seed/chips/100' },
];

const DistributionView: React.FC = () => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedVendor, setSelectedVendor] = useState('');

  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const updateQuantity = (id: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.id === id) {
        const newQty = Math.max(1, item.quantity + delta);
        return { ...item, quantity: newQty };
      }
      return item;
    }));
  };

  const removeItem = (id: string) => {
    setCart(prev => prev.filter(item => item.id !== id));
  };

  const totalAmount = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="max-w-[1400px] mx-auto flex flex-col gap-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-[#111418] dark:text-white text-3xl font-bold leading-tight tracking-tight">Nova Carga de Estoque</h2>
          <p className="text-[#617589] dark:text-gray-400 text-base mt-1">Selecione o vendedor e adicione produtos ao estoque móvel.</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-[#617589]">Data da Carga:</span>
          <div className="bg-white dark:bg-gray-800 px-3 py-1.5 rounded-md border text-sm font-medium flex items-center gap-2">
            <span className="material-symbols-outlined text-base">calendar_today</span>
            24 Out 2023
          </div>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6 items-start">
        {/* Left Side: Vendor Selection and Catalog */}
        <div className="col-span-12 lg:col-span-7 xl:col-span-8 flex flex-col gap-6">
          <div className="bg-white dark:bg-[#1a2632] rounded-xl border p-5 shadow-sm">
            <label className="flex flex-col w-full">
              <span className="text-sm font-medium mb-2 dark:text-white">Vendedor Responsável</span>
              <div className="relative">
                <select 
                  value={selectedVendor}
                  onChange={(e) => setSelectedVendor(e.target.value)}
                  className="w-full appearance-none rounded-lg border border-[#dbe0e6] dark:border-gray-700 bg-white dark:bg-[#101922] px-4 py-3 pr-10 text-base focus:border-primary focus:ring-1 focus:ring-primary dark:text-white"
                >
                  <option value="">Selecione um vendedor da lista...</option>
                  <option value="1">Carlos Silva - Rota Sul</option>
                  <option value="2">Ana Ferreira - Rota Centro</option>
                  <option value="3">Roberto Mendes - Rota Norte</option>
                </select>
                <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-[#617589] pointer-events-none">expand_more</span>
              </div>
            </label>
          </div>

          <div className="bg-white dark:bg-[#1a2632] rounded-xl border flex flex-col shadow-sm">
            <div className="p-5 border-b flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <h3 className="text-lg font-bold dark:text-white">Catálogo de Produtos</h3>
              <div className="relative w-full sm:w-72">
                <input className="w-full rounded-lg border bg-background-light dark:bg-[#101922] dark:text-white pl-10 pr-4 py-2 text-sm focus:ring-1 focus:ring-primary" placeholder="Buscar produto..." />
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#617589] text-lg">search</span>
              </div>
            </div>

            <div className="grid grid-cols-12 px-5 py-3 bg-[#f9fafb] dark:bg-[#15202b] border-b text-xs font-semibold text-[#617589] uppercase tracking-wider">
              <div className="col-span-6 md:col-span-5">Produto</div>
              <div className="col-span-3 md:col-span-2 text-center">Estoque</div>
              <div className="col-span-3 md:col-span-2 text-right">Preço Un.</div>
              <div className="hidden md:block md:col-span-3 text-right">Ação</div>
            </div>

            <div className="flex-1 overflow-y-auto max-h-[400px]">
              {CATALOG.map(item => (
                <div key={item.id} className="grid grid-cols-12 px-5 py-4 border-b items-center hover:bg-[#f9fafb] dark:hover:bg-[#1e2d3b] transition-colors group">
                  <div className="col-span-6 md:col-span-5 flex items-center gap-3">
                    <div className="h-10 w-10 shrink-0 rounded bg-gray-100 flex items-center justify-center overflow-hidden">
                      <img src={item.image} alt={item.name} className="object-cover w-full h-full" />
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="text-sm font-medium dark:text-white truncate">{item.name}</span>
                      <span className="text-xs text-[#617589]">SKU: {item.sku}</span>
                    </div>
                  </div>
                  <div className="col-span-3 md:col-span-2 flex justify-center">
                    <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      {item.stock} un
                    </span>
                  </div>
                  <div className="col-span-3 md:col-span-2 text-right text-sm font-medium dark:text-white">
                    R$ {item.price.toFixed(2)}
                  </div>
                  <div className="col-span-12 mt-3 md:mt-0 md:col-span-3 flex justify-end">
                    <button 
                      onClick={() => addToCart(item)}
                      className="flex items-center gap-2 bg-white dark:bg-[#101922] border hover:border-primary hover:text-primary dark:text-white text-xs font-medium py-1.5 px-3 rounded-lg transition-all"
                    >
                      <span className="material-symbols-outlined text-sm">add</span>
                      Adicionar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Side: Summary Cart */}
        <div className="col-span-12 lg:col-span-5 xl:col-span-4 flex flex-col gap-6">
          <div className="bg-white dark:bg-[#1a2632] rounded-xl border shadow-lg flex flex-col sticky top-6">
            <div className="p-5 border-b bg-slate-50 dark:bg-gray-800/50 rounded-t-xl">
              <h3 className="text-lg font-bold flex items-center gap-2 dark:text-white">
                <span className="material-symbols-outlined text-primary">shopping_bag</span>
                Resumo da Carga
              </h3>
              <p className="text-xs text-[#617589] mt-1">Vendedor: {selectedVendor ? 'Selecionado' : 'Nenhum selecionado'}</p>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4 max-h-[400px]">
              {cart.length === 0 ? (
                <div className="py-10 text-center text-gray-400">
                  <span className="material-symbols-outlined text-4xl mb-2 opacity-30">shopping_cart_off</span>
                  <p className="text-sm">Nenhum produto adicionado.</p>
                </div>
              ) : (
                cart.map(item => (
                  <div key={item.id} className="flex flex-col p-3 rounded-lg border border-[#e5e7eb] dark:border-gray-700 bg-white dark:bg-[#1a2632] group">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex flex-col">
                        <span className="text-sm font-semibold dark:text-white">{item.name}</span>
                        <span className="text-xs text-[#617589]">R$ {item.price.toFixed(2)} un.</span>
                      </div>
                      <button 
                        onClick={() => removeItem(item.id)}
                        className="text-gray-400 hover:text-red-500 p-1 transition-colors"
                      >
                        <span className="material-symbols-outlined text-lg">delete</span>
                      </button>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center border rounded-md overflow-hidden bg-gray-50 dark:bg-gray-800">
                        <button onClick={() => updateQuantity(item.id, -1)} className="w-8 h-8 flex items-center justify-center hover:bg-gray-200 dark:text-white">-</button>
                        <span className="w-10 text-center text-sm font-medium dark:text-white">{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.id, 1)} className="w-8 h-8 flex items-center justify-center hover:bg-gray-200 dark:text-white">+</button>
                      </div>
                      <div className="text-right">
                        <span className="text-xs text-[#617589] block">Subtotal</span>
                        <span className="text-base font-bold dark:text-white">R$ {(item.price * item.quantity).toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="p-5 border-t bg-white dark:bg-gray-800/20 rounded-b-xl space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-[#617589]">Itens Totais</span>
                  <span className="font-medium dark:text-white">{totalItems} un</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-base font-semibold dark:text-white">Valor Total</span>
                  <span className="text-2xl font-black text-primary">R$ {totalAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 pt-2">
                <button 
                  onClick={() => setCart([])}
                  className="px-4 py-3 rounded-lg border font-medium text-sm hover:bg-gray-50 dark:text-white transition-colors"
                >
                  Cancelar
                </button>
                <button 
                  className="flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-primary text-white font-bold text-sm hover:bg-blue-600 transition-all shadow-md"
                  disabled={cart.length === 0}
                >
                  Confirmar Carga
                  <span className="material-symbols-outlined text-sm">arrow_forward</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DistributionView;

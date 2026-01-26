
import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { Product } from '../types';
import { toast } from 'sonner';

interface AddProductModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    editingProduct?: Product | null;
}

const AddProductModal: React.FC<AddProductModalProps> = ({ isOpen, onClose, onSuccess, editingProduct }) => {
    const [loading, setLoading] = useState(false);
    const [name, setName] = useState('');
    const [price, setPrice] = useState('');
    const [sku, setSku] = useState('');
    const [stock, setStock] = useState('0');
    const [status, setStatus] = useState('Em Estoque');

    useEffect(() => {
        if (editingProduct) {
            setName(editingProduct.name);
            setPrice(editingProduct.price.toString());
            setSku(editingProduct.sku);
            setStock(editingProduct.stock.toString());
            setStatus(editingProduct.status || 'Em Estoque');
        } else {
            setName('');
            setPrice('');
            setSku('');
            setStock('0');
            setStatus('Em Estoque');
        }
    }, [editingProduct, isOpen]);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name || !sku) return;

        setLoading(true);
        const productData = {
            name,
            sku,
            price: parseFloat(price.replace(',', '.')),
            stock_internal: parseInt(stock),
            status,
            image_url: `https://picsum.photos/seed/${sku}/200`
        };

        try {
            let error;
            if (editingProduct) {
                const { error: updateError } = await supabase
                    .from('products')
                    .update(productData)
                    .eq('id', editingProduct.id);
                error = updateError;
            } else {
                const { error: insertError } = await supabase
                    .from('products')
                    .insert(productData);
                error = insertError;
            }

            toast.success(editingProduct ? 'Produto atualizado!' : 'Produto cadastrado!');
            onSuccess();
            onClose();
        } catch (error: any) {
            toast.error('Erro ao salvar produto: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="w-full max-w-lg bg-white dark:bg-surface-dark rounded-2xl shadow-xl overflow-hidden border border-border-light dark:border-border-dark animate-in zoom-in-95 duration-200">
                <div className="px-6 py-4 border-b border-border-light dark:border-border-dark flex items-center justify-between bg-primary/5">
                    <h3 className="text-xl font-bold dark:text-white flex items-center gap-2">
                        <span className="material-symbols-outlined text-primary">
                            {editingProduct ? 'edit' : 'add_box'}
                        </span>
                        {editingProduct ? 'Editar Produto' : 'Cadastrar Novo Produto'}
                    </h3>
                    <button onClick={onClose} className="p-2 hover:bg-gray-200 dark:hover:bg-gray-800 rounded-full transition-colors">
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>

                <form onSubmit={handleSave} className="p-6 space-y-5">
                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-semibold dark:text-gray-300">Nome do Produto</label>
                        <input
                            required
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full h-12 bg-gray-50 dark:bg-background-dark border border-border-light dark:border-border-dark rounded-xl px-4 focus:ring-2 focus:ring-primary outline-none dark:text-white"
                            placeholder="Ex: Kit Premium Revenda"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-semibold dark:text-gray-300">SKU / Referência</label>
                            <input
                                required
                                value={sku}
                                onChange={(e) => setSku(e.target.value)}
                                className="w-full h-12 bg-gray-50 dark:bg-background-dark border border-border-light dark:border-border-dark rounded-xl px-4 focus:ring-2 focus:ring-primary outline-none dark:text-white"
                                placeholder="REF-001"
                            />
                        </div>
                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-semibold dark:text-gray-300">Preço Base (R$)</label>
                            <input
                                type="number"
                                step="0.01"
                                required
                                value={price}
                                onChange={(e) => setPrice(e.target.value)}
                                className="w-full h-12 bg-gray-50 dark:bg-background-dark border border-border-light dark:border-border-dark rounded-xl px-4 focus:ring-2 focus:ring-primary outline-none dark:text-white"
                                placeholder="0.00"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-semibold dark:text-gray-300">Estoque Inicial (Interno)</label>
                            <input
                                type="number"
                                required
                                value={stock}
                                onChange={(e) => setStock(e.target.value)}
                                className="w-full h-12 bg-gray-50 dark:bg-background-dark border border-border-light dark:border-border-dark rounded-xl px-4 focus:ring-2 focus:ring-primary outline-none dark:text-white"
                                placeholder="0"
                            />
                        </div>
                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-semibold dark:text-gray-300">Status Inicial</label>
                            <select
                                value={status}
                                onChange={(e) => setStatus(e.target.value)}
                                className="w-full h-12 bg-gray-50 dark:bg-background-dark border border-border-light dark:border-border-dark rounded-xl px-4 focus:ring-2 focus:ring-primary outline-none dark:text-white"
                            >
                                <option>Em Estoque</option>
                                <option>Baixo Estoque</option>
                                <option>Indisponível</option>
                            </select>
                        </div>
                    </div>

                    <div className="pt-4 border-t border-border-light dark:border-border-dark flex gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 h-12 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-white font-semibold rounded-xl transition-all"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={loading || !name || !sku}
                            className="flex-[2] h-12 bg-primary hover:bg-primary-dark text-white font-bold rounded-xl shadow-lg shadow-primary/20 transition-all active:scale-95 flex items-center justify-center disabled:opacity-50"
                        >
                            {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Salvar Produto'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddProductModal;

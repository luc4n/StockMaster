
import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { sendTelegramMessage } from '../services/telegramService';
import { toast } from 'sonner';

interface StockEntryModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

const StockEntryModal: React.FC<StockEntryModalProps> = ({ isOpen, onClose, onSuccess }) => {
    const [loading, setLoading] = useState(false);
    const [products, setProducts] = useState<any[]>([]);
    const [selectedProduct, setSelectedProduct] = useState('');
    const [quantityToAdd, setQuantityToAdd] = useState(1);

    useEffect(() => {
        if (isOpen) {
            fetchProducts();
        }
    }, [isOpen]);

    const fetchProducts = async () => {
        setLoading(true);
        const { data } = await supabase
            .from('products')
            .select('id, name, stock_internal')
            .order('name');
        if (data) setProducts(data);
        setLoading(false);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedProduct || quantityToAdd <= 0) return;

        setLoading(true);
        try {
            const product = products.find(p => p.id === selectedProduct);
            const currentStock = product?.stock_internal || 0;
            const newStock = currentStock + quantityToAdd;

            // Updated to simple update check for compatibility
            const { error } = await supabase
                .from('products')
                .update({ stock_internal: newStock })
                .eq('id', selectedProduct);

            if (error) throw error;

            // 2. Send Telegram Alert
            const msg = `➕ *Nova Entrada de Estoque Interno*\n\n` +
                `🛒 *Produto:* ${product?.name || 'N/A'}\n` +
                `🔢 *Adicionado:* ${quantityToAdd} un\n` +
                `📉 *Novo Saldo:* ${newStock} un`;
            sendTelegramMessage(msg);

            toast.success('Abastecimento realizado com sucesso!');
            onSuccess();
            onClose();
            setSelectedProduct('');
            setQuantityToAdd(1);
        } catch (error: any) {
            toast.error('Erro ao adicionar estoque: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="w-full max-w-lg bg-white dark:bg-surface-dark rounded-2xl shadow-xl overflow-hidden border border-border-light dark:border-border-dark">
                <div className="px-6 py-4 border-b border-border-light dark:border-border-dark flex items-center justify-between bg-emerald-50 dark:bg-emerald-900/20">
                    <h3 className="text-xl font-bold dark:text-white flex items-center gap-2">
                        <span className="material-symbols-outlined text-emerald-600">add_circle</span>
                        Entrada de Estoque Interno
                    </h3>
                    <button onClick={onClose} className="p-2 hover:bg-gray-200 dark:hover:bg-gray-800 rounded-full transition-colors">
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    <div className="space-y-4">
                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-semibold dark:text-gray-300">Produto</label>
                            <select
                                required
                                value={selectedProduct}
                                onChange={(e) => setSelectedProduct(e.target.value)}
                                className="w-full h-12 bg-gray-50 dark:bg-background-dark border border-border-light dark:border-border-dark rounded-xl px-4 focus:ring-2 focus:ring-emerald-500 outline-none dark:text-white"
                            >
                                <option value="">Selecione o produto para abastecer...</option>
                                {products.map(p => (
                                    <option key={p.id} value={p.id}>{p.name} (Atual: {p.stock_internal} un)</option>
                                ))}
                            </select>
                        </div>

                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-semibold dark:text-gray-300">Quantidade a Adicionar</label>
                            <input
                                type="number"
                                min="1"
                                required
                                value={quantityToAdd}
                                onChange={(e) => setQuantityToAdd(parseInt(e.target.value))}
                                className="w-full h-12 bg-gray-50 dark:bg-background-dark border border-border-light dark:border-border-dark rounded-xl px-4 focus:ring-2 focus:ring-emerald-500 outline-none dark:text-white"
                                placeholder="Quantidade"
                            />
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
                            disabled={loading || !selectedProduct}
                            className="flex-[2] h-12 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-lg shadow-emerald-600/20 transition-all active:scale-95 flex items-center justify-center disabled:opacity-50"
                        >
                            {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Confirmar Entrada'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default StockEntryModal;

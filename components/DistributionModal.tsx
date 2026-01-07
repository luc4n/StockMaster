
import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

interface DistributionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

const DistributionModal: React.FC<DistributionModalProps> = ({ isOpen, onClose, onSuccess }) => {
    const [loading, setLoading] = useState(false);
    const [vendors, setVendors] = useState<any[]>([]);
    const [products, setProducts] = useState<any[]>([]);

    const [selectedVendor, setSelectedVendor] = useState('');
    const [selectedProduct, setSelectedProduct] = useState('');
    const [quantity, setQuantity] = useState(1);
    const [notes, setNotes] = useState('');

    useEffect(() => {
        if (isOpen) {
            fetchInitialData();
        }
    }, [isOpen]);

    const fetchInitialData = async () => {
        setLoading(true);
        const [vRes, pRes] = await Promise.all([
            supabase.from('vendors').select('id, name').order('name'),
            supabase.from('products').select('id, name, stock_internal').gt('stock_internal', 0).order('name')
        ]);

        if (vRes.data) setVendors(vRes.data);
        if (pRes.data) setProducts(pRes.data);
        setLoading(false);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedVendor || !selectedProduct || quantity <= 0) return;

        setLoading(true);
        try {
            // 1. Insert distribution record
            const { error: distError } = await supabase.from('distribution').insert({
                vendor_id: selectedVendor,
                product_id: selectedProduct,
                quantity: quantity,
                type: 'Saída',
                notes: notes
            });

            if (distError) throw distError;

            // 2. Decrement internal stock
            const product = products.find(p => p.id === selectedProduct);
            const newStock = (product?.stock_internal || 0) - quantity;

            const { error: prodError } = await supabase
                .from('products')
                .update({ stock_internal: newStock })
                .eq('id', selectedProduct);

            if (prodError) throw prodError;

            onSuccess();
            onClose();
            // Reset form
            setSelectedVendor('');
            setSelectedProduct('');
            setQuantity(1);
            setNotes('');
        } catch (error: any) {
            alert('Erro ao registrar saída: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="w-full max-w-lg bg-white dark:bg-surface-dark rounded-2xl shadow-xl overflow-hidden border border-border-light dark:border-border-dark">
                <div className="px-6 py-4 border-b border-border-light dark:border-border-dark flex items-center justify-between bg-gray-50 dark:bg-gray-800/50">
                    <h3 className="text-xl font-bold dark:text-white">Registrar Envio de Estoque</h3>
                    <button onClick={onClose} className="p-2 hover:bg-gray-200 dark:hover:bg-gray-800 rounded-full transition-colors">
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    <div className="space-y-4">
                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-semibold dark:text-gray-300">Vendedor Destino</label>
                            <select
                                required
                                value={selectedVendor}
                                onChange={(e) => setSelectedVendor(e.target.value)}
                                className="w-full h-12 bg-gray-50 dark:bg-background-dark border border-border-light dark:border-border-dark rounded-xl px-4 focus:ring-2 focus:ring-primary outline-none dark:text-white"
                            >
                                <option value="">Selecione um vendedor...</option>
                                {vendors.map(v => (
                                    <option key={v.id} value={v.id}>{v.name}</option>
                                ))}
                            </select>
                        </div>

                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-semibold dark:text-gray-300">Produto</label>
                            <select
                                required
                                value={selectedProduct}
                                onChange={(e) => setSelectedProduct(e.target.value)}
                                className="w-full h-12 bg-gray-50 dark:bg-background-dark border border-border-light dark:border-border-dark rounded-xl px-4 focus:ring-2 focus:ring-primary outline-none dark:text-white"
                            >
                                <option value="">Selecione um produto...</option>
                                {products.map(p => (
                                    <option key={p.id} value={p.id}>{p.name} (Dispo: {p.stock_internal} un)</option>
                                ))}
                            </select>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="flex flex-col gap-2">
                                <label className="text-sm font-semibold dark:text-gray-300">Quantidade</label>
                                <input
                                    type="number"
                                    min="1"
                                    required
                                    value={quantity}
                                    onChange={(e) => setQuantity(parseInt(e.target.value))}
                                    className="w-full h-12 bg-gray-50 dark:bg-background-dark border border-border-light dark:border-border-dark rounded-xl px-4 focus:ring-2 focus:ring-primary outline-none dark:text-white"
                                />
                            </div>
                            <div className="flex flex-col gap-2">
                                <label className="text-sm font-semibold dark:text-gray-300">Tipo</label>
                                <div className="h-12 bg-gray-100 dark:bg-gray-800 rounded-xl px-4 flex items-center text-sm font-medium text-blue-600 dark:text-blue-400 border border-transparent">
                                    <span className="material-symbols-outlined mr-2">add_box</span>
                                    Nova Saída
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-semibold dark:text-gray-300">Observações (Opcional)</label>
                            <textarea
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                className="w-full min-h-[100px] p-4 bg-gray-50 dark:bg-background-dark border border-border-light dark:border-border-dark rounded-xl focus:ring-2 focus:ring-primary outline-none dark:text-white resize-none"
                                placeholder="Ex: Carga para feira de domingo..."
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
                            disabled={loading || !selectedVendor || !selectedProduct}
                            className="flex-[2] h-12 bg-primary hover:bg-primary-dark text-white font-bold rounded-xl shadow-lg shadow-primary/20 transition-all active:scale-95 flex items-center justify-center disabled:opacity-50"
                        >
                            {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Confirmar Envio'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default DistributionModal;

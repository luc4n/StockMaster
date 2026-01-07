
import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

interface ReturnModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

const ReturnModal: React.FC<ReturnModalProps> = ({ isOpen, onClose, onSuccess }) => {
    const [loading, setLoading] = useState(false);
    const [vendors, setVendors] = useState<any[]>([]);
    const [vendorStock, setVendorStock] = useState<any[]>([]);

    const [selectedVendor, setSelectedVendor] = useState('');
    const [selectedProduct, setSelectedProduct] = useState('');
    const [quantity, setQuantity] = useState(1);
    const [notes, setNotes] = useState('');

    useEffect(() => {
        if (isOpen) {
            fetchVendors();
        }
    }, [isOpen]);

    const fetchVendors = async () => {
        setLoading(true);
        const { data } = await supabase.from('vendors').select('id, name').order('name');
        if (data) setVendors(data);
        setLoading(false);
    };

    useEffect(() => {
        if (selectedVendor) {
            fetchVendorStock();
        } else {
            setVendorStock([]);
            setSelectedProduct('');
        }
    }, [selectedVendor]);

    const fetchVendorStock = async () => {
        setLoading(true);
        // Fetch all movements for this vendor to calculate what they actually have
        const { data, error } = await supabase
            .from('distribution')
            .select('product_id, quantity, type, products(id, name)')
            .eq('vendor_id', selectedVendor);

        if (data) {
            const stockMap: Record<string, { id: string, name: string, quantity: number }> = {};

            data.forEach((d: any) => {
                const pId = d.product_id;
                if (!stockMap[pId]) {
                    stockMap[pId] = { id: pId, name: d.products?.name || 'Produto Desconhecido', quantity: 0 };
                }

                if (d.type === 'Saída') {
                    stockMap[pId].quantity += d.quantity;
                } else if (d.type === 'Devolução') {
                    stockMap[pId].quantity -= d.quantity;
                }
            });

            // Only show products where the vendor has quantity > 0
            setVendorStock(Object.values(stockMap).filter(item => item.quantity > 0));
        }
        setLoading(false);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedVendor || !selectedProduct || quantity <= 0) return;

        setLoading(true);
        try {
            // 1. Insert return record
            const { error: distError } = await supabase.from('distribution').insert({
                vendor_id: selectedVendor,
                product_id: selectedProduct,
                quantity: quantity,
                type: 'Devolução',
                notes: notes
            });

            if (distError) throw distError;

            // 2. Increment internal stock
            const { data: currentProd } = await supabase.from('products').select('stock_internal').eq('id', selectedProduct).single();
            const newStock = (currentProd?.stock_internal || 0) + quantity;

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
            alert('Erro ao registrar devolução: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    const currentProductMax = vendorStock.find(p => p.id === selectedProduct)?.quantity || 0;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="w-full max-w-lg bg-white dark:bg-surface-dark rounded-2xl shadow-xl overflow-hidden border border-border-light dark:border-border-dark">
                <div className="px-6 py-4 border-b border-border-light dark:border-border-dark flex items-center justify-between bg-gray-50 dark:bg-gray-800/50">
                    <h3 className="text-xl font-bold dark:text-white">Registrar Devolução de Estoque</h3>
                    <button onClick={onClose} className="p-2 hover:bg-gray-200 dark:hover:bg-gray-800 rounded-full transition-colors">
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    <div className="space-y-4">
                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-semibold dark:text-gray-300">Vendedor</label>
                            <select
                                required
                                value={selectedVendor}
                                onChange={(e) => setSelectedVendor(e.target.value)}
                                className="w-full h-12 bg-gray-50 dark:bg-background-dark border border-border-light dark:border-border-dark rounded-xl px-4 focus:ring-2 focus:ring-primary outline-none dark:text-white"
                            >
                                <option value="">Selecione o vendedor...</option>
                                {vendors.map(v => (
                                    <option key={v.id} value={v.id}>{v.name}</option>
                                ))}
                            </select>
                        </div>

                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-semibold dark:text-gray-300">Produto a Devolver</label>
                            <select
                                required
                                disabled={!selectedVendor}
                                value={selectedProduct}
                                onChange={(e) => setSelectedProduct(e.target.value)}
                                className="w-full h-12 bg-gray-50 dark:bg-background-dark border border-border-light dark:border-border-dark rounded-xl px-4 focus:ring-2 focus:ring-primary outline-none dark:text-white disabled:opacity-50"
                            >
                                <option value="">
                                    {!selectedVendor ? 'Selecione um vendedor primeiro' : (vendorStock.length === 0 ? 'Nenhum item em posse deste vendedor' : 'Selecione o produto...')}
                                </option>
                                {vendorStock.map(p => (
                                    <option key={p.id} value={p.id}>{p.name} (Saldo: {p.quantity} un)</option>
                                ))}
                            </select>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="flex flex-col gap-2">
                                <label className="text-sm font-semibold dark:text-gray-300">Quantidade</label>
                                <input
                                    type="number"
                                    min="1"
                                    max={currentProductMax}
                                    required
                                    value={quantity}
                                    onChange={(e) => setQuantity(Math.min(parseInt(e.target.value), currentProductMax))}
                                    className="w-full h-12 bg-gray-50 dark:bg-background-dark border border-border-light dark:border-border-dark rounded-xl px-4 focus:ring-2 focus:ring-primary outline-none dark:text-white"
                                />
                            </div>
                            <div className="flex flex-col gap-2">
                                <label className="text-sm font-semibold dark:text-gray-300">Tipo</label>
                                <div className="h-12 bg-amber-50 dark:bg-amber-900/20 rounded-xl px-4 flex items-center text-sm font-medium text-amber-600 dark:text-amber-400 border border-amber-100 dark:border-amber-900/30">
                                    <span className="material-symbols-outlined mr-2">assignment_return</span>
                                    Devolução
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-semibold dark:text-gray-300">Motivo/Notas (Opcional)</label>
                            <textarea
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                className="w-full min-h-[100px] p-4 bg-gray-50 dark:bg-background-dark border border-border-light dark:border-border-dark rounded-xl focus:ring-2 focus:ring-primary outline-none dark:text-white resize-none"
                                placeholder="Ex: Item não vendido, fim do período..."
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
                            disabled={loading || !selectedVendor || !selectedProduct || quantity <= 0}
                            className="flex-[2] h-12 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl shadow-lg shadow-amber-500/20 transition-all active:scale-95 flex items-center justify-center disabled:opacity-50"
                        >
                            {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Confirmar Devolução'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ReturnModal;

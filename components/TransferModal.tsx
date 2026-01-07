
import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

interface TransferModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

const TransferModal: React.FC<TransferModalProps> = ({ isOpen, onClose, onSuccess }) => {
    const [loading, setLoading] = useState(false);
    const [vendors, setVendors] = useState<any[]>([]);
    const [originStock, setOriginStock] = useState<any[]>([]);

    const [fromVendorId, setFromVendorId] = useState('');
    const [toVendorId, setToVendorId] = useState('');
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
        if (fromVendorId) {
            fetchOriginStock();
        } else {
            setOriginStock([]);
            setSelectedProduct('');
        }
    }, [fromVendorId]);

    const fetchOriginStock = async () => {
        setLoading(true);
        const { data } = await supabase
            .from('distribution')
            .select('product_id, quantity, type, products(id, name)')
            .eq('vendor_id', fromVendorId);

        if (data) {
            const stockMap: Record<string, { id: string, name: string, quantity: number }> = {};

            data.forEach((d: any) => {
                const pId = d.product_id;
                if (!stockMap[pId]) {
                    stockMap[pId] = { id: pId, name: d.products?.name || 'Produto Desconhecido', quantity: 0 };
                }

                // Handling all types that affect possession
                if (d.type === 'Saída' || d.type === 'Transferência (Entrada)') {
                    stockMap[pId].quantity += d.quantity;
                } else if (d.type === 'Devolução' || d.type === 'Transferência (Saída)') {
                    stockMap[pId].quantity -= d.quantity;
                }
            });

            setOriginStock(Object.values(stockMap).filter(item => item.quantity > 0));
        }
        setLoading(false);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!fromVendorId || !toVendorId || !selectedProduct || quantity <= 0) return;
        if (fromVendorId === toVendorId) {
            alert('Vendedor de origem e destino devem ser diferentes.');
            return;
        }

        setLoading(true);
        try {
            // 1. Record Output from Origin
            const { error: errorOut } = await supabase.from('distribution').insert({
                vendor_id: fromVendorId,
                product_id: selectedProduct,
                quantity: quantity,
                type: 'Transferência (Saída)',
                notes: `Transferido para: ${vendors.find(v => v.id === toVendorId)?.name}. ${notes}`
            });

            if (errorOut) throw errorOut;

            // 2. Record Input to Destination
            const { error: errorIn } = await supabase.from('distribution').insert({
                vendor_id: toVendorId,
                product_id: selectedProduct,
                quantity: quantity,
                type: 'Transferência (Entrada)',
                notes: `Transferido de: ${vendors.find(v => v.id === fromVendorId)?.name}. ${notes}`
            });

            if (errorIn) throw errorIn;

            onSuccess();
            onClose();
            // Reset
            setFromVendorId('');
            setToVendorId('');
            setSelectedProduct('');
            setQuantity(1);
            setNotes('');
        } catch (error: any) {
            alert('Erro na transferência: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    const currentMax = originStock.find(p => p.id === selectedProduct)?.quantity || 0;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="w-full max-w-lg bg-white dark:bg-surface-dark rounded-2xl shadow-xl border border-border-light dark:border-border-dark overflow-hidden">
                <div className="px-6 py-4 border-b border-border-light dark:border-border-dark flex items-center justify-between bg-gray-50 dark:bg-gray-800/50">
                    <h3 className="text-xl font-bold dark:text-white">Transferência de Estoque</h3>
                    <button onClick={onClose} className="p-2 hover:bg-gray-200 dark:hover:bg-gray-800 rounded-full transition-colors">
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-semibold dark:text-gray-300">De (Origem)</label>
                            <select
                                required
                                value={fromVendorId}
                                onChange={(e) => setFromVendorId(e.target.value)}
                                className="w-full h-12 bg-gray-50 dark:bg-background-dark border border-border-light dark:border-border-dark rounded-xl px-4 focus:ring-2 focus:ring-primary outline-none dark:text-white"
                            >
                                <option value="">Origem...</option>
                                {vendors.map(v => (
                                    <option key={v.id} value={v.id}>{v.name}</option>
                                ))}
                            </select>
                        </div>
                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-semibold dark:text-gray-300">Para (Destino)</label>
                            <select
                                required
                                value={toVendorId}
                                onChange={(e) => setToVendorId(e.target.value)}
                                disabled={!fromVendorId}
                                className="w-full h-12 bg-gray-50 dark:bg-background-dark border border-border-light dark:border-border-dark rounded-xl px-4 focus:ring-2 focus:ring-primary outline-none dark:text-white disabled:opacity-50"
                            >
                                <option value="">Destino...</option>
                                {vendors.filter(v => v.id !== fromVendorId).map(v => (
                                    <option key={v.id} value={v.id}>{v.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-semibold dark:text-gray-300">Produto</label>
                        <select
                            required
                            disabled={!fromVendorId}
                            value={selectedProduct}
                            onChange={(e) => setSelectedProduct(e.target.value)}
                            className="w-full h-12 bg-gray-50 dark:bg-background-dark border border-border-light dark:border-border-dark rounded-xl px-4 focus:ring-2 focus:ring-primary outline-none dark:text-white disabled:opacity-50"
                        >
                            <option value="">
                                {!fromVendorId ? 'Selecione a origem primeiro' : (originStock.length === 0 ? 'Sem estoque disponível' : 'Selecione o produto...')}
                            </option>
                            {originStock.map(p => (
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
                                max={currentMax}
                                required
                                value={quantity}
                                onChange={(e) => setQuantity(Math.min(parseInt(e.target.value), currentMax))}
                                className="w-full h-12 bg-gray-50 dark:bg-background-dark border border-border-light dark:border-border-dark rounded-xl px-4 focus:ring-2 focus:ring-primary outline-none dark:text-white"
                            />
                        </div>
                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-semibold dark:text-gray-300">Tipo</label>
                            <div className="h-12 bg-purple-50 dark:bg-purple-900/20 rounded-xl px-4 flex items-center text-sm font-medium text-purple-600 dark:text-purple-400 border border-purple-100 dark:border-purple-900/30">
                                <span className="material-symbols-outlined mr-2">sync_alt</span>
                                Transferência
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-semibold dark:text-gray-300">Observações (Opcional)</label>
                        <textarea
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            className="w-full min-h-[80px] p-4 bg-gray-50 dark:bg-background-dark border border-border-light dark:border-border-dark rounded-xl focus:ring-2 focus:ring-primary outline-none dark:text-white resize-none"
                            placeholder="Notas sobre a transferência..."
                        />
                    </div>

                    <div className="pt-4 border-t border-border-light dark:border-border-dark flex gap-3">
                        <button type="button" onClick={onClose} className="flex-1 h-12 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-white font-semibold rounded-xl transition-all">
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={loading || !fromVendorId || !toVendorId || !selectedProduct}
                            className="flex-[2] h-12 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl shadow-lg shadow-purple-600/20 transition-all active:scale-95 flex items-center justify-center disabled:opacity-50"
                        >
                            {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Confirmar Transferência'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default TransferModal;

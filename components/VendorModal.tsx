
import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { Vendor } from '../types';
import { toast } from 'sonner';

interface VendorModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    editingVendor?: Vendor | null;
}

const VendorModal: React.FC<VendorModalProps> = ({ isOpen, onClose, onSuccess, editingVendor }) => {
    const [loading, setLoading] = useState(false);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [region, setRegion] = useState('');
    const [status, setStatus] = useState('Ativo');

    useEffect(() => {
        if (editingVendor) {
            setName(editingVendor.name);
            setEmail(editingVendor.email || '');
            setPhone(editingVendor.phone || '');
            setRegion(editingVendor.region || '');
            setStatus(editingVendor.status || 'Ativo');
        } else {
            setName('');
            setEmail('');
            setPhone('');
            setRegion('');
            setStatus('Ativo');
        }
    }, [editingVendor, isOpen]);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name) return;

        setLoading(true);
        const vendorData = {
            name,
            email,
            phone,
            region,
            status,
            avatar_url: editingVendor?.avatar || `https://i.pravatar.cc/150?u=${name}`
        };

        try {
            let error;
            if (editingVendor) {
                const { error: updateError } = await supabase
                    .from('vendors')
                    .update(vendorData)
                    .eq('id', editingVendor.id);
                error = updateError;
            } else {
                const { error: insertError } = await supabase
                    .from('vendors')
                    .insert(vendorData);
                error = insertError;
            }

            toast.success(editingVendor ? 'Vendedor atualizado!' : 'Vendedor cadastrado!');
            onSuccess();
            onClose();
        } catch (error: any) {
            toast.error('Erro ao salvar vendedor: ' + error.message);
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
                            {editingVendor ? 'person_edit' : 'person_add'}
                        </span>
                        {editingVendor ? 'Editar Vendedor' : 'Novo Vendedor'}
                    </h3>
                    <button onClick={onClose} className="p-2 hover:bg-gray-200 dark:hover:bg-gray-800 rounded-full transition-colors">
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>

                <form onSubmit={handleSave} className="p-6 space-y-5">
                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-semibold dark:text-gray-300">Nome Completo</label>
                        <input
                            required
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full h-12 bg-gray-50 dark:bg-background-dark border border-border-light dark:border-border-dark rounded-xl px-4 focus:ring-2 focus:ring-primary outline-none dark:text-white"
                            placeholder="Ex: Carlos Alberto"
                        />
                    </div>

                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-semibold dark:text-gray-300">E-mail</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full h-12 bg-gray-50 dark:bg-background-dark border border-border-light dark:border-border-dark rounded-xl px-4 focus:ring-2 focus:ring-primary outline-none dark:text-white"
                            placeholder="carlos@exemplo.com"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-semibold dark:text-gray-300">Telefone</label>
                            <input
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                className="w-full h-12 bg-gray-50 dark:bg-background-dark border border-border-light dark:border-border-dark rounded-xl px-4 focus:ring-2 focus:ring-primary outline-none dark:text-white"
                                placeholder="(00) 00000-0000"
                            />
                        </div>
                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-semibold dark:text-gray-300">Região</label>
                            <input
                                value={region}
                                onChange={(e) => setRegion(e.target.value)}
                                className="w-full h-12 bg-gray-50 dark:bg-background-dark border border-border-light dark:border-border-dark rounded-xl px-4 focus:ring-2 focus:ring-primary outline-none dark:text-white"
                                placeholder="Sudeste"
                            />
                        </div>
                    </div>

                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-semibold dark:text-gray-300">Status</label>
                        <select
                            value={status}
                            onChange={(e) => setStatus(e.target.value)}
                            className="w-full h-12 bg-gray-50 dark:bg-background-dark border border-border-light dark:border-border-dark rounded-xl px-4 focus:ring-2 focus:ring-primary outline-none dark:text-white"
                        >
                            <option>Ativo</option>
                            <option>Inativo</option>
                            <option>Férias</option>
                            <option>Atenção</option>
                            <option>Alto Estoque</option>
                        </select>
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
                            disabled={loading || !name}
                            className="flex-[2] h-12 bg-primary hover:bg-primary-dark text-white font-bold rounded-xl shadow-lg shadow-primary/20 transition-all active:scale-95 flex items-center justify-center disabled:opacity-50"
                        >
                            {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Salvar Vendedor'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default VendorModal;

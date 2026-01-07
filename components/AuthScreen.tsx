
import React, { useState } from 'react';
import { supabase } from '../supabaseClient';

const AuthScreen: React.FC = () => {
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isSignUp, setIsSignUp] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage(null);

        try {
            if (isSignUp) {
                const { error } = await supabase.auth.signUp({ email, password });
                if (error) throw error;
                setMessage({ type: 'success', text: 'Cadastro realizado! Verifique seu e-mail para confirmar.' });
            } else {
                const { error } = await supabase.auth.signInWithPassword({ email, password });
                if (error) throw error;
            }
        } catch (error: any) {
            setMessage({ type: 'error', text: error.message || 'Ocorreu um erro.' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background-light dark:bg-background-dark p-4">
            <div className="w-full max-w-md bg-white dark:bg-surface-dark rounded-3xl shadow-2xl overflow-hidden border border-border-light dark:border-border-dark flex flex-col">
                {/* Header/Banner Section */}
                <div className="bg-primary p-12 text-center text-white relative">
                    <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
                        <span className="material-symbols-outlined text-[200px] -rotate-12 absolute -top-10 -left-10 select-none">
                            inventory_2
                        </span>
                    </div>
                    <h1 className="text-4xl font-extrabold tracking-tight mb-2 relative z-10">StockMaster</h1>
                    <p className="text-primary-light opacity-90 relative z-10">Gestão de Vendedores e Estoque</p>
                </div>

                {/* Form Section */}
                <div className="p-8 md:p-10 flex-1">
                    <div className="mb-8 text-center">
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                            {isSignUp ? 'Criar Conta' : 'Boas-vindas'}
                        </h2>
                        <p className="text-gray-500 dark:text-gray-400">
                            {isSignUp ? 'Preencha os dados abaixo' : 'Entre com suas credenciais'}
                        </p>
                    </div>

                    <form onSubmit={handleAuth} className="space-y-5">
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 ml-1">E-mail</label>
                            <div className="relative group">
                                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors">
                                    mail
                                </span>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full pl-11 pr-4 py-3 bg-gray-50 dark:bg-background-dark border border-gray-200 dark:border-border-dark rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none text-gray-900 dark:text-white"
                                    placeholder="exemplo@email.com"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 ml-1">Senha</label>
                            <div className="relative group">
                                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors">
                                    lock
                                </span>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full pl-11 pr-4 py-3 bg-gray-50 dark:bg-background-dark border border-gray-200 dark:border-border-dark rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none text-gray-900 dark:text-white"
                                    placeholder="••••••••"
                                    required
                                />
                            </div>
                        </div>

                        {message && (
                            <div className={`p-4 rounded-xl text-sm animate-in fade-in slide-in-from-top-2 duration-300 flex items-center gap-3 ${message.type === 'success' ? 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400' : 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400'
                                }`}>
                                <span className="material-symbols-outlined text-lg">
                                    {message.type === 'success' ? 'check_circle' : 'error'}
                                </span>
                                {message.text}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-primary hover:bg-primary-dark text-white font-bold py-3.5 rounded-xl shadow-lg shadow-primary/30 transition-all active:scale-[0.98] disabled:opacity-70 flex items-center justify-center gap-2 group"
                        >
                            {loading ? (
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <>
                                    <span>{isSignUp ? 'Registrar' : 'Entrar'}</span>
                                    <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">
                                        arrow_forward
                                    </span>
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-8 pt-6 border-t border-gray-100 dark:border-border-dark text-center">
                        <button
                            onClick={() => setIsSignUp(!isSignUp)}
                            className="text-primary hover:text-primary-dark font-semibold transition-colors flex items-center justify-center gap-2 mx-auto"
                        >
                            {isSignUp ? 'Já tem uma conta? Entre aqui' : 'Não tem conta? Cadastre-se agora'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AuthScreen;

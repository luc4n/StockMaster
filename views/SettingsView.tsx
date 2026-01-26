
import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

const SettingsView: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'menu' | 'integrations' | 'telegram' | 'visual'>('menu');
    const [loading, setLoading] = useState(false);

    // Visual Preferences State
    const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');
    const [density, setDensity] = useState(localStorage.getItem('density') || 'normal');
    const [accentColor, setAccentColor] = useState(localStorage.getItem('accent') || '#137fec');
    const [fontFamily, setFontFamily] = useState(localStorage.getItem('font-family') || "'Inter', sans-serif");

    // Telegram Form State
    const [botToken, setBotToken] = useState('');
    const [chatId, setChatId] = useState('');
    const [isActive, setIsActive] = useState(true);

    const menuItems = [
        { id: 'visual', title: 'Preferências Visuais', desc: 'Tema, cores e densidade da interface', icon: 'palette' },
        { id: 'notifications', title: 'Notificações', desc: 'Configure quais alertas você deseja receber', icon: 'notifications_active' },
        { id: 'security', title: 'Segurança', desc: 'Duas etapas, sessão e logs de acesso', icon: 'security' },
        { id: 'integrations', title: 'Integrações', desc: 'Conecte com outras ferramentas e APIs', icon: 'hub' },
    ];

    useEffect(() => {
        if (activeTab === 'telegram') {
            fetchTelegramConfig();
        }
    }, [activeTab]);

    // Apply Visual Changes
    useEffect(() => {
        // Theme
        if (theme === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
        localStorage.setItem('theme', theme);

        // Density
        if (density === 'compact') {
            document.documentElement.classList.add('compact-mode');
        } else {
            document.documentElement.classList.remove('compact-mode');
        }
        localStorage.setItem('density', density);

        // Helper to convert hex to RGB
        const hexToRgb = (hex: string) => {
            const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
            return result ? {
                r: parseInt(result[1], 16),
                g: parseInt(result[2], 16),
                b: parseInt(result[3], 16)
            } : { r: 19, g: 127, b: 236 };
        };

        // Generate light background from accent color
        const rgb = hexToRgb(accentColor);
        // Mix with white (80% white, 20% accent color) for a visible but pleasant tint
        const lightBg = `rgb(${Math.round(255 * 0.8 + rgb.r * 0.2)}, ${Math.round(255 * 0.8 + rgb.g * 0.2)}, ${Math.round(255 * 0.8 + rgb.b * 0.2)})`;

        // Accent
        document.documentElement.style.setProperty('--primary', accentColor);
        document.documentElement.style.setProperty('--primary-light', accentColor + 'cc');
        document.documentElement.style.setProperty('--bg-light', lightBg);
        localStorage.setItem('accent', accentColor);

        // Font
        document.documentElement.style.setProperty('--font-family', fontFamily);
        localStorage.setItem('font-family', fontFamily);
    }, [theme, density, accentColor, fontFamily]);

    const fetchTelegramConfig = async () => {
        setLoading(true);
        const { data } = await supabase
            .from('integrations_config')
            .select('*')
            .eq('provider', 'telegram')
            .single();

        if (data) {
            setBotToken(data.settings.bot_token || '');
            setChatId(data.settings.chat_id || '');
            setIsActive(data.is_active);
        }
        setLoading(false);
    };

    const handleSaveTelegram = async () => {
        setLoading(true);
        const { error } = await supabase
            .from('integrations_config')
            .upsert({
                provider: 'telegram',
                settings: { bot_token: botToken, chat_id: chatId },
                is_active: isActive,
                updated_at: new Date().toISOString()
            }, { onConflict: 'provider' });

        if (error) {
            alert('Erro ao salvar configuração: ' + error.message);
        } else {
            alert('Configuração salva com sucesso!');
        }
        setLoading(false);
    };

    const handleTestConnection = async () => {
        if (!botToken || !chatId) {
            alert('Por favor, preencha o Token e o Chat ID primeiro.');
            return;
        }
        setLoading(true);
        try {
            const response = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    chat_id: chatId,
                    text: '✅ *Teste de Conexão - StockMaster*\n\nA integração foi configurada corretamente!',
                    parse_mode: 'Markdown'
                })
            });
            const result = await response.json();
            if (result.ok) {
                alert('Mensagem de teste enviada com sucesso!');
            } else {
                alert('Erro do Telegram: ' + result.description);
            }
        } catch (err: any) {
            alert('Erro na requisição: ' + err.message);
        } finally {
            setLoading(false);
        }
    };



    if (activeTab === 'integrations') {
        return (
            <div className="max-w-[900px] mx-auto flex flex-col gap-8 pb-16">
                <button
                    onClick={() => setActiveTab('menu')}
                    className="flex items-center gap-2 text-gray-500 hover:text-primary transition-colors font-bold text-sm"
                >
                    <span className="material-symbols-outlined">arrow_back</span>
                    Voltar para Configurações
                </button>

                <div className="flex flex-col gap-2">
                    <h1 className="text-gray-900 dark:text-white text-5xl font-black leading-tight tracking-tighter">
                        Minhas <span className="text-primary">Integrações</span>
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 text-lg font-medium">
                        Gerencie as conexões externas do seu ecossistema de gestão.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-white dark:bg-surface-dark p-8 rounded-[2.5rem] border-2 border-primary/20 shadow-premium relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-4">
                            <span className="flex items-center gap-1.5 px-3 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-full text-[10px] font-black uppercase tracking-wider">
                                <span className="size-2 bg-emerald-500 rounded-full animate-pulse"></span>
                                Ativo
                            </span>
                        </div>

                        <div className="size-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-6">
                            <img src="https://supabase.com/favicons/favicon-32x32.png" alt="Supabase" className="size-8" />
                        </div>

                        <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-2">Supabase Cloud</h3>
                        <p className="text-gray-500 dark:text-gray-400 text-sm font-medium mb-6">
                            Infraestrutura principal para Banco de Dados SQL, Autenticação de usuários e Armazenamento de arquivos.
                        </p>

                        <div className="space-y-3">
                            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                                <span className="text-xs font-bold text-gray-500 dark:text-gray-400">Database</span>
                                <span className="text-xs font-black text-emerald-600 dark:text-emerald-400">OPERACIONAL</span>
                            </div>
                            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                                <span className="text-xs font-bold text-gray-500 dark:text-gray-400">Auth Service</span>
                                <span className="text-xs font-black text-emerald-600 dark:text-emerald-400">OPERACIONAL</span>
                            </div>
                        </div>
                    </div>

                    <div
                        onClick={() => setActiveTab('telegram')}
                        className="bg-white dark:bg-surface-dark p-8 rounded-[2.5rem] bg-sky-500/5 border-2 border-sky-500/10 shadow-premium relative overflow-hidden group cursor-pointer hover:border-sky-500/30 transition-all"
                    >
                        <div className="absolute top-0 right-0 p-4">
                            <span className="flex items-center gap-1.5 px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 rounded-full text-[10px] font-black uppercase tracking-wider">
                                Configurar
                            </span>
                        </div>

                        <div className="size-16 rounded-2xl bg-sky-500/10 flex items-center justify-center mb-6">
                            <span className="material-symbols-outlined text-sky-500 text-3xl font-bold">send</span>
                        </div>

                        <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-2">Telegram Bot</h3>
                        <p className="text-gray-500 dark:text-gray-400 text-sm font-medium mb-6">
                            Envie notificações em tempo real sobre movimentações de estoque para seu grupo ou chat.
                        </p>

                        <div className="w-full mt-auto py-3 bg-sky-500 text-white font-bold rounded-2xl text-center text-sm shadow-lg shadow-sky-500/20 group-hover:scale-[1.02] transition-transform">
                            Acessar Configurações
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (activeTab === 'telegram') {
        return (
            <div className="max-w-[700px] mx-auto flex flex-col gap-8 pb-16">
                <button
                    onClick={() => setActiveTab('integrations')}
                    className="flex items-center gap-2 text-gray-500 hover:text-primary transition-colors font-bold text-sm"
                >
                    <span className="material-symbols-outlined">arrow_back</span>
                    Voltar para Integrações
                </button>

                <div className="bg-white dark:bg-surface-dark p-10 rounded-[2.5rem] shadow-premium-lg border border-gray-100 dark:border-gray-800">
                    <div className="flex items-center gap-4 mb-8">
                        <div className="size-16 rounded-3xl bg-sky-500 flex items-center justify-center shadow-lg shadow-sky-500/30">
                            <span className="material-symbols-outlined text-white text-3xl font-bold">send</span>
                        </div>
                        <div>
                            <h2 className="text-3xl font-black text-gray-900 dark:text-white leading-tight tracking-tight">Telegram Bot Alerts</h2>
                            <p className="text-gray-500 font-medium">Configure notificações inteligentes.</p>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-black text-gray-700 dark:text-gray-300 uppercase tracking-wider">Bot Token</label>
                            <input
                                type="password"
                                value={botToken}
                                onChange={(e) => setBotToken(e.target.value)}
                                className="h-14 bg-gray-50 dark:bg-gray-900 border-none ring-2 ring-gray-100 dark:ring-gray-800 rounded-2xl px-5 dark:text-white focus:ring-sky-500 transition-all font-mono text-sm"
                                placeholder="0000000000:AAHH..."
                            />
                            <p className="text-[11px] text-gray-400 font-medium">Obtenha o seu token falando com o @BotFather no Telegram.</p>
                        </div>

                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-black text-gray-700 dark:text-gray-300 uppercase tracking-wider">Chat ID / Group ID</label>
                            <input
                                type="text"
                                value={chatId}
                                onChange={(e) => setChatId(e.target.value)}
                                className="h-14 bg-gray-50 dark:bg-gray-900 border-none ring-2 ring-gray-100 dark:ring-gray-800 rounded-2xl px-5 dark:text-white focus:ring-sky-500 transition-all font-mono text-sm"
                                placeholder="-100..."
                            />
                        </div>

                        <div className="flex items-center justify-between p-5 bg-gray-50 dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800">
                            <div>
                                <h4 className="font-black text-gray-900 dark:text-white">Status da Integração</h4>
                                <p className="text-xs text-gray-500 font-medium">Ativar ou desativar alertas globais.</p>
                            </div>
                            <button
                                onClick={() => setIsActive(!isActive)}
                                className={`w-14 h-8 rounded-full transition-all relative ${isActive ? 'bg-emerald-500 shadow-lg shadow-emerald-500/30' : 'bg-gray-300 dark:bg-gray-700'}`}
                            >
                                <div className={`absolute top-1 size-6 bg-white rounded-full transition-all ${isActive ? 'right-1' : 'left-1'}`}></div>
                            </button>
                        </div>

                        <div className="flex gap-3 pt-4">
                            <button
                                onClick={handleSaveTelegram}
                                disabled={loading}
                                className="flex-1 h-14 bg-sky-500 hover:bg-sky-600 text-white font-black rounded-2xl shadow-xl shadow-sky-500/20 transition-all active:scale-95 flex items-center justify-center"
                            >
                                {loading ? <div className="size-6 border-4 border-white/30 border-t-white rounded-full animate-spin" /> : 'Salvar Alterações'}
                            </button>
                            <button
                                onClick={handleTestConnection}
                                disabled={loading}
                                className="px-6 h-14 bg-white dark:bg-gray-800 border-2 border-sky-500/20 text-sky-500 font-black rounded-2xl hover:bg-sky-50 transition-all active:scale-95"
                            >
                                Testar Conexão
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (activeTab === 'visual') {
        return (
            <div className="max-w-[700px] mx-auto flex flex-col gap-8 pb-16">
                <button
                    onClick={() => setActiveTab('menu')}
                    className="flex items-center gap-2 text-gray-500 hover:text-primary transition-colors font-bold text-sm"
                >
                    <span className="material-symbols-outlined">arrow_back</span>
                    Voltar para Configurações
                </button>

                <div className="flex flex-col gap-2 text-center md:text-left">
                    <h1 className="text-gray-900 dark:text-white text-5xl font-black leading-tight tracking-tighter">
                        Experiência <span className="text-primary">Visual</span>
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 text-lg font-medium">
                        Personalize como você vê e interage com o sistema.
                    </p>
                </div>

                <div className="grid grid-cols-1 gap-6">
                    {/* Theme Selector */}
                    <div className="bg-white dark:bg-surface-dark p-8 rounded-[2.5rem] shadow-premium border border-gray-100 dark:border-gray-800">
                        <h3 className="text-sm font-black text-gray-700 dark:text-gray-300 uppercase tracking-widest mb-6">Tema do Sistema</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <button
                                onClick={() => setTheme('light')}
                                className={`h-24 rounded-2xl flex flex-col items-center justify-center gap-2 transition-all border-2 ${theme === 'light' ? 'border-primary bg-primary/5 text-primary' : 'border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 dark:text-gray-400'}`}
                            >
                                <span className="material-symbols-outlined text-3xl">light_mode</span>
                                <span className="text-xs font-bold uppercase tracking-widest">Claro</span>
                            </button>
                            <button
                                onClick={() => setTheme('dark')}
                                className={`h-24 rounded-2xl flex flex-col items-center justify-center gap-2 transition-all border-2 ${theme === 'dark' ? 'border-primary bg-primary/5 text-primary' : 'border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 dark:text-gray-400'}`}
                            >
                                <span className="material-symbols-outlined text-3xl">dark_mode</span>
                                <span className="text-xs font-bold uppercase tracking-widest">Escuro</span>
                            </button>
                        </div>
                    </div>

                    {/* Accent Color */}
                    <div className="bg-white dark:bg-surface-dark p-8 rounded-[2.5rem] shadow-premium border border-gray-100 dark:border-gray-800">
                        <h3 className="text-sm font-black text-gray-700 dark:text-gray-300 uppercase tracking-widest mb-6">Cor de Destaque</h3>
                        <div className="grid grid-cols-5 gap-3">
                            {[
                                { name: 'Padrão', color: '#137fec' },
                                { name: 'Roxo', color: '#8b5cf6' },
                                { name: 'Esmeralda', color: '#10b981' },
                                { name: 'Laranja', color: '#f59e0b' },
                                { name: 'Rosa', color: '#ec4899' },
                            ].map((c) => (
                                <button
                                    key={c.color}
                                    onClick={() => setAccentColor(c.color)}
                                    className={`aspect-square rounded-2xl border-4 transition-all flex items-center justify-center relative overflow-hidden group ${accentColor === c.color ? 'border-gray-900 dark:border-white scale-105' : 'border-transparent opacity-80 hover:opacity-100'}`}
                                    style={{ backgroundColor: c.color }}
                                >
                                    {accentColor === c.color && <span className="material-symbols-outlined text-white text-2xl font-bold">check</span>}
                                    <div className="absolute inset-x-0 bottom-0 h-1/3 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Font Selection */}
                    <div className="bg-white dark:bg-surface-dark p-8 rounded-[2.5rem] shadow-premium border border-gray-100 dark:border-gray-800">
                        <h3 className="text-sm font-black text-gray-700 dark:text-gray-300 uppercase tracking-widest mb-6">Estilo de Fonte</h3>
                        <div className="grid grid-cols-1 gap-3">
                            {[
                                { name: 'Inter (Padrão)', value: "'Inter', sans-serif" },
                                { name: 'Poppins (Moderno)', value: "'Poppins', sans-serif" },
                                { name: 'Outfit (Premium)', value: "'Outfit', sans-serif" },
                                { name: 'Bebas Neue (Impacto)', value: "'Bebas Neue', sans-serif" },
                                { name: 'Roboto Mono (Tech)', value: "'Roboto Mono', monospace" },
                            ].map((f) => (
                                <button
                                    key={f.value}
                                    onClick={() => setFontFamily(f.value)}
                                    className={`p-4 rounded-2xl border-2 transition-all flex items-center justify-between ${fontFamily === f.value ? 'border-primary bg-primary/5' : 'border-gray-100 dark:border-gray-800'}`}
                                    style={{ fontFamily: f.value }}
                                >
                                    <span className={`text-lg ${fontFamily === f.value ? 'text-primary' : 'text-gray-900 dark:text-white'}`}>{f.name}</span>
                                    {fontFamily === f.value ? <span className="material-symbols-outlined text-primary">check_circle</span> : <div className="size-5 rounded-full border-2 border-gray-200 dark:border-gray-700"></div>}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Density Selection */}
                    <div className="bg-white dark:bg-surface-dark p-8 rounded-[2.5rem] shadow-premium border border-gray-100 dark:border-gray-800">
                        <h3 className="text-sm font-black text-gray-700 dark:text-gray-300 uppercase tracking-widest mb-6">Densidade da Interface</h3>
                        <div className="flex flex-col gap-3">
                            <button
                                onClick={() => setDensity('normal')}
                                className={`p-5 rounded-2xl border-2 transition-all flex items-center justify-between ${density === 'normal' ? 'border-primary bg-primary/5' : 'border-gray-100 dark:border-gray-800'}`}
                            >
                                <div className="text-left">
                                    <h4 className={`font-black uppercase tracking-widest ${density === 'normal' ? 'text-primary' : 'text-gray-900 dark:text-white'}`}>Espaçado (Normal)</h4>
                                    <p className="text-xs text-gray-500 font-medium">Layout padrão com mais ar entre os elementos.</p>
                                </div>
                                {density === 'normal' && <span className="material-symbols-outlined text-primary">radio_button_checked</span>}
                                {density !== 'normal' && <span className="material-symbols-outlined text-gray-300">radio_button_unchecked</span>}
                            </button>
                            <button
                                onClick={() => setDensity('compact')}
                                className={`p-5 rounded-2xl border-2 transition-all flex items-center justify-between ${density === 'compact' ? 'border-primary bg-primary/5' : 'border-gray-100 dark:border-gray-800'}`}
                            >
                                <div className="text-left">
                                    <h4 className={`font-black uppercase tracking-widest ${density === 'compact' ? 'text-primary' : 'text-gray-900 dark:text-white'}`}>Compacto</h4>
                                    <p className="text-xs text-gray-500 font-medium">Ideal para telas menores ou análise rápida de dados.</p>
                                </div>
                                {density === 'compact' && <span className="material-symbols-outlined text-primary">radio_button_checked</span>}
                                {density !== 'compact' && <span className="material-symbols-outlined text-gray-300">radio_button_unchecked</span>}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (activeTab === 'security') {
        return (
            <div className="max-w-[700px] mx-auto flex flex-col gap-8 pb-16">
                <button
                    onClick={() => setActiveTab('menu')}
                    className="flex items-center gap-2 text-gray-500 hover:text-primary transition-colors font-bold text-sm"
                >
                    <span className="material-symbols-outlined">arrow_back</span>
                    Voltar para Configurações
                </button>

                <div className="flex flex-col gap-2 text-center md:text-left">
                    <h1 className="text-gray-900 dark:text-white text-5xl font-black leading-tight tracking-tighter">
                        Segurança da <span className="text-primary">Conta</span>
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 text-lg font-medium">
                        Proteja seu acesso e gerencie suas credenciais.
                    </p>
                </div>

                <div className="grid grid-cols-1 gap-6">
                    {/* Password Change */}
                    <div className="bg-white dark:bg-surface-dark p-8 rounded-[2.5rem] shadow-premium border border-gray-100 dark:border-gray-800">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="size-12 rounded-xl bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center text-orange-600 dark:text-orange-400">
                                <span className="material-symbols-outlined text-2xl font-bold">lock_reset</span>
                            </div>
                            <div>
                                <h3 className="text-xl font-black text-gray-900 dark:text-white">Alterar Senha</h3>
                                <p className="text-sm text-gray-500 font-medium">Atualize sua senha de acesso periodicamente.</p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="flex flex-col gap-2">
                                <label className="text-xs font-black text-gray-700 dark:text-gray-300 uppercase tracking-wider">Nova Senha</label>
                                <input
                                    type="password"
                                    className="h-12 bg-gray-50 dark:bg-gray-900 border-none ring-1 ring-gray-200 dark:ring-gray-700 rounded-xl px-4 dark:text-white focus:ring-2 focus:ring-primary transition-all"
                                    placeholder="••••••••"
                                />
                            </div>
                            <div className="flex flex-col gap-2">
                                <label className="text-xs font-black text-gray-700 dark:text-gray-300 uppercase tracking-wider">Confirmar Nova Senha</label>
                                <input
                                    type="password"
                                    className="h-12 bg-gray-50 dark:bg-gray-900 border-none ring-1 ring-gray-200 dark:ring-gray-700 rounded-xl px-4 dark:text-white focus:ring-2 focus:ring-primary transition-all"
                                    placeholder="••••••••"
                                />
                            </div>
                            <button
                                className="w-full h-12 bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-bold rounded-xl shadow-lg hover:opacity-90 transition-all active:scale-95 mt-2"
                                onClick={() => alert('Funcionalidade demonstrativa. Em produção, isso alteraria sua senha via Supabase Auth.')}
                            >
                                Atualizar Senha
                            </button>
                        </div>
                    </div>

                    {/* 2FA */}
                    <div className="bg-white dark:bg-surface-dark p-8 rounded-[2.5rem] shadow-premium border border-gray-100 dark:border-gray-800 opacity-75">
                        <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-4">
                                <div className="size-12 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-purple-600 dark:text-purple-400">
                                    <span className="material-symbols-outlined text-2xl font-bold">domain_verification</span>
                                </div>
                                <div>
                                    <h3 className="text-xl font-black text-gray-900 dark:text-white">Autenticação em Dois Fatores</h3>
                                    <p className="text-sm text-gray-500 font-medium">Adicione uma camada extra de segurança.</p>
                                </div>
                            </div>
                            <div className="px-3 py-1 bg-gray-100 dark:bg-gray-800 rounded-lg text-xs font-bold text-gray-500 uppercase">
                                Em breve
                            </div>
                        </div>
                    </div>


                </div>
            </div>
        );
    }

    return (
        <div className="max-w-[800px] mx-auto flex flex-col gap-8 pb-16">
            <div className="flex flex-col gap-2">
                <div className="flex items-center gap-3">
                    <div className="h-1 w-12 bg-primary rounded-full"></div>
                    <span className="text-primary font-black uppercase tracking-[0.2em] text-[10px]">Configurações Gerais</span>
                </div>
                <h1 className="text-gray-900 dark:text-white text-5xl font-black leading-tight tracking-tighter">
                    Configurações do <span className="text-primary">Sistema</span>
                </h1>
                <p className="text-gray-500 dark:text-gray-400 text-lg font-medium">
                    Personalize a experiência da Gestão inteligente de estoque para sua empresa.
                </p>
            </div>

            <div className="grid grid-cols-1 gap-6">
                {menuItems.map((item, idx) => {
                    const isEnabled = item.id === 'integrations' || item.id === 'visual' || item.id === 'notifications' || item.id === 'security';
                    return (
                        <div
                            key={idx}
                            onClick={() => isEnabled && setActiveTab(item.id === 'notifications' ? 'telegram' : item.id as any)}
                            className={`bg-white dark:bg-surface-dark p-6 rounded-[2rem] border border-gray-100 dark:border-gray-800 shadow-premium flex items-center justify-between group transition-all ${isEnabled ? 'cursor-pointer hover:border-primary/30' : 'opacity-60 grayscale-[0.5]'}`}
                        >
                            <div className="flex items-center gap-6">
                                <div className="size-14 rounded-2xl bg-gray-50 dark:bg-gray-800 flex items-center justify-center text-gray-400 group-hover:text-primary transition-colors">
                                    <span className="material-symbols-outlined text-3xl font-bold">{item.icon}</span>
                                </div>
                                <div>
                                    <h4 className="text-lg font-black text-gray-900 dark:text-white leading-tight">{item.title}</h4>
                                    <p className="text-sm text-gray-500 font-medium">{item.desc}</p>
                                </div>
                            </div>
                            <span className="material-symbols-outlined text-gray-300 group-hover:translate-x-1 transition-transform">chevron_right</span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default SettingsView;

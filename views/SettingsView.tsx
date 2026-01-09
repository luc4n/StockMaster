import React from 'react';

const SettingsView: React.FC = () => {
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
                {[
                    { title: 'Preferências Visuais', desc: 'Tema, cores e densidade da interface', icon: 'palette' },
                    { title: 'Notificações', desc: 'Configure quais alertas você deseja receber', icon: 'notifications_active' },
                    { title: 'Segurança', desc: 'Duas etapas, sessão e logs de acesso', icon: 'security' },
                    { title: 'Integrações', desc: 'Conecte com outras ferramentas e APIs', icon: 'hub' },
                ].map((item, idx) => (
                    <div key={idx} className="bg-white dark:bg-surface-dark p-6 rounded-[2rem] border border-gray-100 dark:border-gray-800 shadow-premium flex items-center justify-between group cursor-pointer hover:border-primary/30 transition-all">
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
                ))}
            </div>
        </div>
    );
};

export default SettingsView;

import React from 'react';

const LogsView: React.FC = () => {
    return (
        <div className="max-w-[900px] mx-auto flex flex-col gap-10 pb-16 px-4">
            <div className="flex flex-col gap-2">
                <div className="flex items-center gap-3">
                    <div className="h-1 w-12 bg-primary rounded-full"></div>
                    <span className="text-primary font-black uppercase tracking-[0.2em] text-[10px]">Auditoria de Segurança</span>
                </div>
                <h1 className="text-gray-900 dark:text-white text-5xl font-black leading-tight tracking-tighter">
                    Logs de <span className="text-primary">Atividade</span>
                </h1>
                <p className="text-gray-500 dark:text-gray-400 text-lg font-medium">
                    Rastreie todas as ações críticas realizadas no sistema por administradores e vendedores.
                </p>
            </div>

            <div className="flex flex-col gap-4">
                {[
                    { action: 'Transferência de Estoque', user: 'Carlos Silva', time: '10:45', date: 'Hoje', status: 'Sucesso', icon: 'sync_alt' },
                    { action: 'Novo Produto Cadastrado', user: 'Lucas Souza', time: '09:20', date: 'Hoje', status: 'Sucesso', icon: 'add_box' },
                    { action: 'Tentativa de Login Falha', user: 'Desconhecido', time: '03:12', date: 'Hoje', status: 'Alerta', icon: 'security' },
                    { action: 'Relatório Exportado', user: 'Ana Paula', time: '17:30', date: 'Ontem', status: 'Sucesso', icon: 'description' },
                ].map((log, idx) => (
                    <div key={idx} className="bg-white dark:bg-surface-dark p-6 rounded-[2rem] border border-gray-100 dark:border-gray-800 shadow-premium flex items-center gap-6">
                        <div className={`size-12 rounded-xl flex items-center justify-center ${log.status === 'Alerta' ? 'bg-red-500/10 text-red-500' : 'bg-primary/10 text-primary'}`}>
                            <span className="material-symbols-outlined font-black">{log.icon}</span>
                        </div>
                        <div className="flex-1">
                            <h5 className="font-black text-gray-900 dark:text-white">{log.action}</h5>
                            <p className="text-xs text-gray-500 font-bold uppercase tracking-widest mt-0.5">Realizado por: <span className="text-gray-900 dark:text-gray-300">{log.user}</span></p>
                        </div>
                        <div className="text-right">
                            <p className="text-sm font-black text-gray-900 dark:text-white leading-none">{log.time}</p>
                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">{log.date}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default LogsView;

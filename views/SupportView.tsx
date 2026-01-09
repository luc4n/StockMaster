import React from 'react';

const SupportView: React.FC = () => {
    return (
        <div className="max-w-[800px] mx-auto flex flex-col gap-10 pb-16 px-4">
            <div className="flex flex-col gap-2">
                <div className="flex items-center gap-3">
                    <div className="h-1 w-12 bg-primary rounded-full"></div>
                    <span className="text-primary font-black uppercase tracking-[0.2em] text-[10px]">Atendimento e FAQ</span>
                </div>
                <h1 className="text-gray-900 dark:text-white text-5xl font-black leading-tight tracking-tighter">
                    Central de <span className="text-primary">Suporte</span>
                </h1>
                <p className="text-gray-500 dark:text-gray-400 text-lg font-medium">
                    Estamos aqui para ajudar você a tirar o máximo proveito da plataforma.
                </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                <div className="bg-gradient-to-br from-primary to-primary-dark p-8 rounded-[3rem] text-white shadow-xl shadow-primary/20 flex flex-col items-start gap-4 transform hover:scale-[1.02] transition-all">
                    <span className="material-symbols-outlined text-4xl font-light">chat_bubble</span>
                    <h3 className="text-2xl font-black tracking-tight leading-none">Chat em Tempo Real</h3>
                    <p className="text-primary-light opacity-90 font-medium">Fale agora mesmo com um de nossos especialistas técnicos.</p>
                    <button className="mt-4 bg-white text-primary font-black px-6 py-3 rounded-2xl w-full">Iniciar Conversa</button>
                </div>

                <div className="bg-white dark:bg-surface-dark p-8 rounded-[3rem] border border-gray-100 dark:border-gray-800 shadow-premium flex flex-col items-start gap-4 hover:border-primary/20 transition-all">
                    <span className="material-symbols-outlined text-4xl text-primary font-light">contact_support</span>
                    <h3 className="text-2xl font-black tracking-tight leading-none text-gray-900 dark:text-white">Base de Conhecimento</h3>
                    <p className="text-gray-500 font-medium">Explore tutoriais e respostas para as perguntas mais frequentes.</p>
                    <button className="mt-4 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white font-black px-6 py-3 rounded-2xl w-full border border-gray-100 dark:border-gray-700">Ver Tutoriais</button>
                </div>
            </div>
        </div>
    );
};

export default SupportView;

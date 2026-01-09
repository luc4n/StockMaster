import React, { useState } from 'react';

const ProfileView: React.FC = () => {
    return (
        <div className="max-w-[800px] mx-auto flex flex-col gap-8 pb-16">
            <div className="flex flex-col gap-2">
                <div className="flex items-center gap-3">
                    <div className="h-1 w-12 bg-primary rounded-full"></div>
                    <span className="text-primary font-black uppercase tracking-[0.2em] text-[10px]">Administrador</span>
                </div>
                <h1 className="text-gray-900 dark:text-white text-5xl font-black leading-tight tracking-tighter">
                    Meu <span className="text-primary">Perfil</span>
                </h1>
                <p className="text-gray-500 dark:text-gray-400 text-lg font-medium">
                    Gerencie suas informações pessoais e credenciais de acesso.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="md:col-span-1">
                    <div className="bg-white dark:bg-surface-dark rounded-[2.5rem] p-8 border border-gray-100 dark:border-gray-800 shadow-premium flex flex-col items-center">
                        <div className="size-32 rounded-full bg-cover bg-center border-4 border-white dark:border-gray-900 shadow-xl mb-6"
                            style={{ backgroundImage: `url('https://picsum.photos/seed/admin/200')` }}></div>
                        <h2 className="text-xl font-black text-gray-900 dark:text-white">Lucas Souza</h2>
                        <p className="text-sm text-gray-500 font-bold uppercase tracking-widest mt-1">Administrador</p>

                        <div className="w-full h-px bg-gray-100 dark:bg-gray-800 my-6"></div>

                        <button className="w-full bg-gray-50 dark:bg-gray-800/50 hover:bg-primary hover:text-white text-gray-600 dark:text-gray-300 font-bold py-3 rounded-2xl transition-all active:scale-95 flex items-center justify-center gap-2">
                            <span className="material-symbols-outlined text-xl">photo_camera</span>
                            Alterar Foto
                        </button>
                    </div>
                </div>

                <div className="md:col-span-2 flex flex-col gap-6">
                    <div className="bg-white dark:bg-surface-dark rounded-[2.5rem] p-8 border border-gray-100 dark:border-gray-800 shadow-premium">
                        <h3 className="text-lg font-black text-gray-900 dark:text-white mb-6">Informações Pessoais</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Nome Completo</label>
                                <input type="text" defaultValue="Lucas Souza" className="w-full px-5 py-3 bg-gray-50 dark:bg-background-dark border border-gray-100 dark:border-gray-800 rounded-2xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none font-bold text-gray-900 dark:text-white" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">E-mail</label>
                                <input type="email" defaultValue="admin@stockmaster.com" className="w-full px-5 py-3 bg-gray-50 dark:bg-background-dark border border-gray-100 dark:border-gray-800 rounded-2xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none font-bold text-gray-900 dark:text-white" />
                            </div>
                        </div>
                        <button className="mt-8 bg-primary text-white font-black px-8 py-4 rounded-2xl shadow-lg shadow-primary/30 transition-all hover:scale-105 active:scale-95">
                            Salvar Alterações
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfileView;

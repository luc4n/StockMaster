import React, { useState, useRef } from 'react';

const ProfileView: React.FC = () => {
    // Initialize state from localStorage or default values
    const [name, setName] = useState(() => localStorage.getItem('profile_name') || 'Lucas Souza');
    const [email, setEmail] = useState(() => localStorage.getItem('profile_email') || 'admin@stockmaster.com');
    const [role, setRole] = useState(() => localStorage.getItem('profile_role') || 'Administrador');
    const [phone, setPhone] = useState(() => localStorage.getItem('profile_phone') || '(11) 98765-4321');
    const [location, setLocation] = useState(() => localStorage.getItem('profile_location') || 'São Paulo, SP');

    const [avatar, setAvatar] = useState(() => localStorage.getItem('profile_avatar') || 'https://picsum.photos/seed/admin/200');

    const fileInputRef = useRef<HTMLInputElement>(null);

    const handlePhotoClick = () => {
        fileInputRef.current?.click();
    };

    const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const newAvatar = reader.result as string;
                setAvatar(newAvatar);
                localStorage.setItem('profile_avatar', newAvatar);
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <div className="max-w-[900px] mx-auto flex flex-col gap-10 pb-16 px-4">
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
                {/* Coluna da Esquerda - Foto e Resumo */}
                <div className="md:col-span-1">
                    <div className="bg-white dark:bg-surface-dark rounded-[2.5rem] p-8 border border-gray-100 dark:border-gray-800 shadow-premium flex flex-col items-center sticky top-8">
                        <div className="relative group">
                            <div className="size-40 rounded-full bg-cover bg-center border-4 border-white dark:border-gray-900 shadow-xl mb-6 transition-transform group-hover:scale-105"
                                style={{ backgroundImage: `url('${avatar}')` }}></div>
                            <button
                                onClick={handlePhotoClick}
                                className="absolute bottom-6 right-0 bg-primary text-white p-3 rounded-xl shadow-lg hover:bg-blue-600 transition-colors"
                                title="Alterar foto"
                            >
                                <span className="material-symbols-outlined text-xl">edit</span>
                            </button>
                        </div>

                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handlePhotoChange}
                            accept="image/*"
                            className="hidden"
                        />

                        <h2 className="text-2xl font-black text-gray-900 dark:text-white text-center leading-tight">{name}</h2>
                        <p className="text-sm text-primary font-bold uppercase tracking-widest mt-2">{role}</p>

                        <div className="w-full h-px bg-gray-100 dark:bg-gray-800 my-6"></div>

                        <div className="w-full space-y-4">
                            <div className="flex items-center gap-3 text-gray-500 dark:text-gray-400">
                                <span className="material-symbols-outlined text-xl">location_on</span>
                                <span className="text-sm font-medium">{location}</span>
                            </div>
                            <div className="flex items-center gap-3 text-gray-500 dark:text-gray-400">
                                <span className="material-symbols-outlined text-xl">mail</span>
                                <span className="text-sm font-medium truncate">{email}</span>
                            </div>
                            <div className="flex items-center gap-3 text-gray-500 dark:text-gray-400">
                                <span className="material-symbols-outlined text-xl">call</span>
                                <span className="text-sm font-medium">{phone}</span>
                            </div>
                        </div>

                        <button
                            onClick={handlePhotoClick}
                            className="w-full mt-8 bg-gray-50 dark:bg-gray-800/50 hover:bg-primary hover:text-white text-gray-600 dark:text-gray-300 font-bold py-3 rounded-2xl transition-all active:scale-95 flex items-center justify-center gap-2"
                        >
                            <span className="material-symbols-outlined text-xl">photo_camera</span>
                            Alterar Foto
                        </button>
                    </div>
                </div>

                {/* Coluna da Direita - Formulário */}
                <div className="md:col-span-2 flex flex-col gap-6">
                    <div className="bg-white dark:bg-surface-dark rounded-[2.5rem] p-8 border border-gray-100 dark:border-gray-800 shadow-premium">
                        <div className="flex items-center gap-3 mb-8">
                            <span className="material-symbols-outlined text-2xl text-primary">person_edit</span>
                            <h3 className="text-xl font-black text-gray-900 dark:text-white">Editar Informações</h3>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Nome Completo</label>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="w-full px-5 py-4 bg-gray-50 dark:bg-background-dark border border-gray-100 dark:border-gray-800 rounded-2xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none font-bold text-gray-900 dark:text-white"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Cargo / Função</label>
                                <input
                                    type="text"
                                    value={role}
                                    onChange={(e) => setRole(e.target.value)}
                                    className="w-full px-5 py-4 bg-gray-50 dark:bg-background-dark border border-gray-100 dark:border-gray-800 rounded-2xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none font-bold text-gray-900 dark:text-white"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">E-mail</label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full px-5 py-4 bg-gray-50 dark:bg-background-dark border border-gray-100 dark:border-gray-800 rounded-2xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none font-bold text-gray-900 dark:text-white"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Telefone</label>
                                <input
                                    type="text"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    className="w-full px-5 py-4 bg-gray-50 dark:bg-background-dark border border-gray-100 dark:border-gray-800 rounded-2xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none font-bold text-gray-900 dark:text-white"
                                />
                            </div>
                            <div className="sm:col-span-2 space-y-2">
                                <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Localização</label>
                                <input
                                    type="text"
                                    value={location}
                                    onChange={(e) => setLocation(e.target.value)}
                                    className="w-full px-5 py-4 bg-gray-50 dark:bg-background-dark border border-gray-100 dark:border-gray-800 rounded-2xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none font-bold text-gray-900 dark:text-white"
                                />
                            </div>

                        </div>
                        <button
                            onClick={() => {
                                // Persist all fields to localStorage
                                localStorage.setItem('profile_name', name);
                                localStorage.setItem('profile_email', email);
                                localStorage.setItem('profile_role', role);
                                localStorage.setItem('profile_phone', phone);
                                localStorage.setItem('profile_location', location);
                                // Avatar is already saved on change

                                const btn = document.activeElement as HTMLButtonElement;
                                if (btn) {
                                    const originalText = btn.innerHTML;
                                    btn.innerHTML = '<span class="material-symbols-outlined animate-spin">sync</span> Salvando...';
                                    btn.disabled = true;
                                    setTimeout(() => {
                                        btn.innerHTML = '<span class="material-symbols-outlined">check</span> Alterações Salvas!';
                                        btn.classList.replace('bg-primary', 'bg-green-600');
                                        setTimeout(() => {
                                            btn.innerHTML = originalText;
                                            btn.classList.replace('bg-green-600', 'bg-primary');
                                            btn.disabled = false;
                                        }, 2000);
                                    }, 800);
                                }
                            }}
                            className="mt-8 w-full bg-primary text-white font-black px-8 py-5 rounded-2xl shadow-lg shadow-primary/30 transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            <span className="material-symbols-outlined">save</span>
                            Salvar Alterações
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfileView;

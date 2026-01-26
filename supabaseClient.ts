import { createClient } from '@supabase/supabase-js';

// NOTA: Estes valores devem idealmente estar em um arquivo .env.local
// Mas como o acesso ao .env.local está restrito pelo .gitignore,
// estou colocando aqui temporariamente para garantir que funcione.
// Para produção, mova-os para variáveis de ambiente.

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

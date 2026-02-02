import { createClient } from '@supabase/supabase-js';

console.log('🔍 Début initialisation Supabase...');
console.log('Meta env:', import.meta.env);

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

console.log('URL:', supabaseUrl);
console.log('Clé présente?', !!supabaseAnonKey);

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ ERREUR: Variables manquantes!');
  console.error('URL:', supabaseUrl);
  console.error('Clé:', supabaseAnonKey);
  
  // Pour voir toutes les variables disponibles
  console.log('Toutes les variables env:', Object.keys(import.meta.env));
  
  throw new Error('Configuration Supabase manquante');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true, // Important pour les redirects
  }
});

console.log('✅ Supabase initialisé avec URL:', supabaseUrl);

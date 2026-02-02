// env.d.ts
interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string
  readonly VITE_SUPABASE_ANON_KEY: string
  // Ajoutez d'autres variables ici au besoin
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
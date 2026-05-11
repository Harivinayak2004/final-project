// src/env.d.ts
interface ImportMetaEnv {
  readonly OPENAI_API_KEY: string
  readonly VITE_SUPABASE_URL: string
  readonly VITE_SUPABASE_ANON_KEY: string
  // add more variables here if needed
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
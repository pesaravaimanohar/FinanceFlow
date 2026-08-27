import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const isMissingConfig = !supabaseUrl || !supabaseAnonKey

// Create a no-op client if env vars are missing (for demo mode)
export const supabase = isMissingConfig
  ? null
  : createClient(supabaseUrl, supabaseAnonKey)

export default supabase

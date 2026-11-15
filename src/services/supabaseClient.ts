import { createClient, SupabaseClient } from '@supabase/supabase-js';

/**
 * Supabase Authentication, PostgreSQL & Storage Client
 *
 * Reads only public client-side VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.
 * When those environment variables are not yet configured, the app runs against
 * QuickGo's Express backend & demo storage layer while keeping all production
 * integration points cleanly isolated.
 */

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(supabaseUrl!, supabaseAnonKey!)
  : null;

export interface BackendConfig {
  provider: 'demo' | 'supabase';
  supabaseUrl?: string;
  hasAnonKey: boolean;
}

export function getBackendConfig(): BackendConfig {
  if (isSupabaseConfigured) {
    return {
      provider: 'supabase',
      supabaseUrl,
      hasAnonKey: true,
    };
  }
  return {
    provider: 'demo',
    hasAnonKey: false,
  };
}

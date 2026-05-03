import { createClient, SupabaseClient } from '@supabase/supabase-js';
import 'dotenv/config';

interface SupabaseCredentials {
  url: string;
  anonKey: string;
}

function getSupabaseCredentials(): SupabaseCredentials {
  const url = process.env.COZE_SUPABASE_URL;
  const anonKey = process.env.COZE_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    throw new Error('COZE_SUPABASE_URL or COZE_SUPABASE_ANON_KEY is not set');
  }

  return { url, anonKey };
}

let supabaseClient: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient {
  if (!supabaseClient) {
    const { url, anonKey } = getSupabaseCredentials();
    supabaseClient = createClient(url, anonKey);
  }
  return supabaseClient;
}

export function getServiceRoleKey(): string | undefined {
  return process.env.COZE_SUPABASE_SERVICE_ROLE_KEY;
}

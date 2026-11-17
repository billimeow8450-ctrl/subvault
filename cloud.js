import { createClient } from '@supabase/supabase-js';
const url = import.meta.env.VITE_SUPABASE_URL;
const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
export const supabase = url && key ? createClient(url, key) : null;
export const emptyVault = { services: [], accounts: [], recentPlatforms: [] };
export async function loadVault() {
  const { data, error } = await supabase.from('subvault_vaults').select('payload, revision').maybeSingle();
  if (error) throw error;
  return data || { payload: emptyVault, revision: 0 };
}
export async function saveVault(payload, revision) {
  const { data, error } = await supabase.rpc('subvault_save', { vault_payload: payload, expected_revision: revision });
  if (error) throw error;
  return data;
}

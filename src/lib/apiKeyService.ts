/**
 * API Key Service Layer
 * Ready to connect to Supabase backend.
 * Replace the stub functions below with actual Supabase calls.
 */

export type AIProvider = 'openai' | 'anthropic' | 'gemini';

export interface ApiKeyStatus {
  provider: AIProvider;
  isSet: boolean;
  maskedKey?: string; // e.g. "sk-...abcd"
  updatedAt?: string;
}

export interface SaveApiKeyPayload {
  provider: AIProvider;
  apiKey: string;
  userId?: string;
}

// ─────────────────────────────────────────────
// BACKEND INTEGRATION POINTS
// Replace each function body with Supabase calls
// ─────────────────────────────────────────────

/**
 * Save an API key to the backend.
 * The key should be encrypted server-side and NEVER returned to the client.
 *
 * SUPABASE EXAMPLE:
 *   const { error } = await supabase
 *     .from('api_keys')
 *     .upsert({ user_id: userId, provider, encrypted_key: apiKey }, { onConflict: 'user_id,provider' });
 *   if (error) throw error;
 */
export async function saveApiKey(payload: SaveApiKeyPayload): Promise<void> {
  // TODO: Replace with Supabase upsert
  // Simulated network delay
  await new Promise((r) => setTimeout(r, 900));
  // Stub: success
}

/**
 * Fetch the status of all API keys for the current user.
 * Returns only masked previews — never the full key.
 *
 * SUPABASE EXAMPLE:
 *   const { data, error } = await supabase
 *     .from('api_keys')
 *     .select('provider, masked_key, updated_at')
 *     .eq('user_id', userId);
 *   if (error) throw error;
 *   return data.map(row => ({ provider: row.provider, isSet: true, maskedKey: row.masked_key, updatedAt: row.updated_at }));
 */
export async function fetchApiKeyStatuses(userId?: string): Promise<ApiKeyStatus[]> {
  // TODO: Replace with Supabase select
  await new Promise((r) => setTimeout(r, 600));
  // Stub: all keys unset
  return [
    { provider: 'openai', isSet: false },
    { provider: 'anthropic', isSet: false },
    { provider: 'gemini', isSet: false },
  ];
}

/**
 * Delete an API key from the backend.
 *
 * SUPABASE EXAMPLE:
 *   const { error } = await supabase
 *     .from('api_keys')
 *     .delete()
 *     .eq('user_id', userId)
 *     .eq('provider', provider);
 *   if (error) throw error;
 */
export async function deleteApiKey(provider: AIProvider, userId?: string): Promise<void> {
  // TODO: Replace with Supabase delete
  await new Promise((r) => setTimeout(r, 700));
}

/**
 * Mask a key for display: show first 4 and last 4 chars only.
 * e.g. "sk-abcdefghijklmnop" → "sk-a...mnop"
 */
export function maskKey(key: string): string {
  if (key.length <= 8) return '••••••••';
  return key.slice(0, 6) + '...' + key.slice(-4);
}

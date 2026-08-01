import type { SupabaseClient } from "@supabase/supabase-js";
import type { EvolutionConfig } from "@/lib/evolution";

export type OrgSettings = Record<string, string>;

const DEFAULT_KEYS = [
  "gemini_api_key",
  "evolution_api_url",
  "evolution_api_key",
] as const;

export type SettingKey = (typeof DEFAULT_KEYS)[number];

export function isSettingKey(key: string): key is SettingKey {
  return (DEFAULT_KEYS as readonly string[]).includes(key);
}

export async function getOrgSettings(
  supabase: SupabaseClient,
  orgId: string
): Promise<OrgSettings> {
  const { data, error } = await supabase
    .from("org_settings")
    .select("key, value")
    .eq("org_id", orgId);

  if (error || !data) return {};

  const settings: OrgSettings = {};
  for (const row of data) {
    if (row.value) settings[row.key] = row.value;
  }
  return settings;
}

export async function getOrgEvolutionConfig(
  supabase: SupabaseClient,
  orgId: string
): Promise<EvolutionConfig> {
  const settings = await getOrgSettings(supabase, orgId);
  return {
    apiUrl: settings.evolution_api_url,
    apiKey: settings.evolution_api_key,
  };
}

export async function getOrgGeminiKey(
  supabase: SupabaseClient,
  orgId: string
): Promise<string | undefined> {
  const settings = await getOrgSettings(supabase, orgId);
  return settings.gemini_api_key || undefined;
}

export async function getUserOrgId(
  supabase: SupabaseClient
): Promise<{ user: unknown; orgId: string | null }> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { user: null, orgId: null };

  const { data: member } = await supabase
    .from("org_members")
    .select("org_id")
    .eq("user_id", user.id)
    .single();

  return { user, orgId: member?.org_id ?? null };
}

export async function saveOrgSettings(
  supabase: SupabaseClient,
  orgId: string,
  updates: Partial<OrgSettings>
): Promise<void> {
  const entries = Object.entries(updates);

  for (const [key, value] of entries) {
    if (!isSettingKey(key)) continue;
    if (!value) {
      await supabase
        .from("org_settings")
        .delete()
        .eq("org_id", orgId)
        .eq("key", key);
    } else {
      await supabase.from("org_settings").upsert(
        { org_id: orgId, key, value, updated_at: new Date().toISOString() },
        { onConflict: "org_id,key" }
      );
    }
  }
}

export function resolveSetting(
  settings: OrgSettings,
  key: SettingKey,
  fallback: string | undefined
): string {
  return settings[key] || fallback || "";
}

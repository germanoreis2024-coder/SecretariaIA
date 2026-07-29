"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Organization, OrgMember } from "@/types";

interface OrgContextValue {
  org: Organization | null;
  member: OrgMember | null;
  loading: boolean;
  refresh: () => Promise<void>;
}

const OrgContext = createContext<OrgContextValue>({
  org: null,
  member: null,
  loading: true,
  refresh: async () => {},
});

export function OrgProvider({ children }: { children: ReactNode }) {
  const [org, setOrg] = useState<Organization | null>(null);
  const [member, setMember] = useState<OrgMember | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  async function loadOrg() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setLoading(false);
      return;
    }

    const { data: memberData } = await supabase
      .from("org_members")
      .select("*, organizations(*)")
      .eq("user_id", user.id)
      .single();

    if (memberData) {
      setMember({
        id: memberData.id,
        org_id: memberData.org_id,
        user_id: memberData.user_id,
        role: memberData.role,
        created_at: memberData.created_at,
      });
      const orgRaw = memberData.organizations as Record<string, unknown>;
      setOrg({
        id: orgRaw.id as string,
        name: orgRaw.name as string,
        slug: orgRaw.slug as string,
        owner_id: orgRaw.owner_id as string | null,
        plan: orgRaw.plan as Organization["plan"],
        plan_expires_at: orgRaw.plan_expires_at as string | null,
        stripe_customer_id: orgRaw.stripe_customer_id as string | null,
        stripe_subscription_id: orgRaw.stripe_subscription_id as string | null,
        subscription_status: orgRaw.subscription_status as string | null,
        created_at: orgRaw.created_at as string,
      });
    }
    setLoading(false);
  }

  useEffect(() => {
    loadOrg();
  }, []);

  return (
    <OrgContext.Provider value={{ org, member, loading, refresh: loadOrg }}>
      {children}
    </OrgContext.Provider>
  );
}

export function useOrg() {
  return useContext(OrgContext);
}

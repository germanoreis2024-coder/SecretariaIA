export interface Profile {
  id: string;
  full_name: string | null;
  company_name: string | null;
  phone: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface Organization {
  id: string;
  name: string;
  slug: string;
  owner_id: string | null;
  plan: "free" | "starter" | "pro" | "enterprise";
  plan_expires_at: string | null;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  subscription_status: string | null;
  created_at: string;
}

export interface OrgMember {
  id: string;
  org_id: string;
  user_id: string;
  role: "owner" | "admin" | "member";
  created_at: string;
}

export interface Channel {
  id: string;
  org_id: string;
  name: string;
  type: "whatsapp";
  phone_number: string | null;
  evolution_instance_id: string | null;
  is_active: boolean;
  created_at: string;
}

export interface Agent {
  id: string;
  org_id: string;
  name: string;
  description: string | null;
  personality: string | null;
  system_prompt: string | null;
  model: string;
  temperature: number;
  max_tokens: number;
  channel_id: string | null;
  is_active: boolean;
  working_hours: Record<string, unknown> | null;
  fallback_message: string | null;
  created_at: string;
}

export interface TrainingMessage {
  id: string;
  org_id: string;
  agent_id: string;
  role: "user" | "assistant";
  content: string;
  created_at: string;
}

export interface Shortcut {
  id: string;
  org_id: string;
  trigger: string;
  response: string;
  is_active: boolean;
  created_at: string;
}

export interface Conversation {
  id: string;
  org_id: string;
  channel_id: string | null;
  agent_id: string | null;
  contact_phone: string | null;
  contact_name: string | null;
  status: "open" | "resolved" | "pending";
  sentiment: "positive" | "neutral" | "negative" | null;
  summary: string | null;
  created_at: string;
  updated_at: string;
}

export interface Message {
  id: string;
  conversation_id: string;
  role: "user" | "assistant" | "system";
  content: string;
  tokens_used: number | null;
  model: string | null;
  latency_ms: number | null;
  created_at: string;
}

export interface Automation {
  id: string;
  org_id: string;
  name: string;
  type: "welcome" | "follow_up" | "schedule" | "custom";
  trigger_config: Record<string, unknown> | null;
  action_config: Record<string, unknown> | null;
  is_active: boolean;
  created_at: string;
}

export interface AnalyticsDaily {
  id: string;
  org_id: string;
  date: string;
  total_conversations: number;
  total_messages: number;
  avg_response_time_ms: number | null;
  satisfaction_score: number | null;
  resolved_count: number;
  escalated_count: number;
  created_at: string;
}

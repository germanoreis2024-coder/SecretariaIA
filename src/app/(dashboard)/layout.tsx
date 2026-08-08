"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { OrgProvider, useOrg } from "@/lib/supabase/org-context";
import { useEffect, useState } from "react";
import {
  LayoutDashboard,
  Bot,
  MessageSquare,
  Zap,
  Plug,
  Users,
  Workflow,
  BarChart3,
  Settings,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import type { Profile } from "@/types";

const planBadge: Record<string, string> = {
  free: "border border-white/10 bg-white/5 text-slate-300",
  starter: "border border-violet-500/40 bg-violet-500/10 text-violet-300",
  pro: "border border-amber-500/40 bg-amber-500/10 text-amber-300",
};

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Atendentes IA", href: "/atendentes", icon: Bot },
  { name: "Mensagens", href: "/mensagens", icon: MessageSquare },
  { name: "Atalhos", href: "/atalhos", icon: Zap },
  { name: "Integrações", href: "/integracoes", icon: Plug },
  { name: "Agentes", href: "/agentes", icon: Users },
  { name: "Automações", href: "/automacoes", icon: Workflow },
  { name: "Analytics", href: "/analytics", icon: BarChart3 },
  { name: "Configurações", href: "/configuracoes", icon: Settings },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    async function getProfile() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
        return;
      }
      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();
      setProfile(data);
    }
    getProfile();
  }, [supabase, router]);

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  const initials = profile?.full_name
    ? profile.full_name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "??";

  return (
    <OrgProvider>
    <div className="min-h-screen bg-[#090d16] text-slate-100">
      {/* Mobile sidebar */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setSidebarOpen(false)}
          />
          <div className="fixed inset-y-0 left-0 w-64 border-r border-white/10 bg-[#0a0f1e]">
            <div className="flex items-center justify-between p-4">
              <Link href="/dashboard" className="flex items-center gap-2.5">
                <div className="relative flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-fuchsia-500 shadow-lg shadow-violet-600/30">
                  <Bot className="h-4.5 w-4.5 text-white" />
                </div>
                <span className="text-xl font-bold tracking-tight">
                  Atende<span className="gradient-text">IA</span>
                </span>
              </Link>
              <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(false)}>
                <X className="h-5 w-5" />
              </Button>
            </div>
            <SidebarNav pathname={pathname} />
          </div>
        </div>
      )}

      {/* Desktop sidebar */}
      <aside className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <div className="flex grow flex-col gap-y-6 overflow-y-auto border-r border-white/10 bg-[#0a0f1e] px-6 py-4">
          <Link href="/dashboard" className="flex items-center gap-2.5">
            <div className="relative flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-fuchsia-500 shadow-lg shadow-violet-600/30">
              <Bot className="h-4.5 w-4.5 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight">
              Atende<span className="gradient-text">IA</span>
            </span>
          </Link>
          <SidebarNav pathname={pathname} />
        </div>
      </aside>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top bar */}
        <header className="glass-nav sticky top-0 z-40 flex h-16 items-center gap-4 px-6">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden text-slate-300 hover:bg-white/5 hover:text-white"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </Button>
          <div className="flex-1" />
          <DropdownMenu>
            <DropdownMenuTrigger render={<Button variant="ghost" className="relative h-9 w-9 rounded-full" />}>
                <Avatar className="h-9 w-9">
                  <AvatarFallback className="bg-gradient-to-br from-violet-600 to-fuchsia-600 text-sm font-medium text-white">
                    {initials}
                  </AvatarFallback>
                </Avatar>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <div className="flex items-center gap-2 p-2">
                <p className="text-sm font-medium text-slate-200">{profile?.full_name || "Usuário"}</p>
              </div>
              <Separator />
              <DropdownMenuItem render={<Link href="/configuracoes" className="cursor-pointer" />}>
                  <Settings className="mr-2 h-4 w-4" />
                  Configurações
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-destructive">
                <LogOut className="mr-2 h-4 w-4" />
                Sair
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </header>

        <main className="p-6">{children}</main>
      </div>
    </div>
    </OrgProvider>
  );
}

function SidebarNav({ pathname }: { pathname: string }) {
  const { org } = useOrg();

  return (
    <nav className="flex flex-col gap-1">
      {navigation.map((item) => {
        const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center gap-3 rounded-lg border-l-2 px-3 py-2 text-sm font-medium transition-all ${
              isActive
                ? "border-violet-500 bg-gradient-to-r from-violet-600/20 to-fuchsia-600/20 text-violet-300"
                : "border-transparent text-slate-400 hover:bg-white/5 hover:text-slate-200"
            }`}
          >
            <item.icon className="h-4 w-4" />
            {item.name}
          </Link>
        );
      })}

      <Separator className="my-2 bg-white/10" />

      <div className="px-3 py-2">
        <p className="text-xs text-slate-500 mb-1">
          {org?.name || "Carregando..."}
        </p>
        {org?.plan && (
          <Badge className={planBadge[org.plan] || planBadge.free}>
            {org.plan.charAt(0).toUpperCase() + org.plan.slice(1)}
          </Badge>
        )}
      </div>
    </nav>
  );
}

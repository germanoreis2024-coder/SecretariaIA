"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, Shield, User } from "lucide-react";

interface Member {
  id: string;
  user_id: string;
  role: string;
  created_at: string;
  profiles: { full_name: string | null } | null;
}

export default function AgentesPage() {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    loadMembers();
  }, []);

  async function loadMembers() {
    const { data } = await supabase
      .from("org_members")
      .select("*, profiles(full_name)")
      .order("created_at", { ascending: false });
    setMembers((data as Member[]) || []);
    setLoading(false);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Equipe</h1>
        <p className="text-muted-foreground">
          Gerencie os membros da sua organização
        </p>
      </div>

      {loading ? (
        <div className="text-center py-8 text-muted-foreground">Carregando...</div>
      ) : members.length === 0 ? (
        <Card>
          <CardContent className="text-center py-8">
            <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Nenhum membro encontrado</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {members.map((member) => (
            <Card key={member.id}>
              <CardContent className="flex items-center justify-between py-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center">
                    <User className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="font-medium">
                      {member.profiles?.full_name || "Usuário"}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Membro desde {new Date(member.created_at).toLocaleDateString("pt-BR")}
                    </p>
                  </div>
                </div>
                <Badge variant={member.role === "owner" ? "default" : "secondary"}>
                  <Shield className="mr-1 h-3 w-3" />
                  {member.role === "owner" ? "Proprietário" : member.role === "admin" ? "Admin" : "Membro"}
                </Badge>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

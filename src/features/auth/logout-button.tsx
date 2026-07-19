"use client";

import { useState } from "react";
import { Button } from "@/components/ui";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export function LogoutButton() {
  const [saindo, setSaindo] = useState(false);

  async function sair() {
    setSaindo(true);
    const supabase = createSupabaseBrowserClient();
    await supabase.auth.signOut();
    window.location.href = "/login";
  }

  return (
    <Button variant="ghost" size="sm" onClick={sair} disabled={saindo}>
      {saindo ? "Saindo..." : "Sair do sistema"}
    </Button>
  );
}

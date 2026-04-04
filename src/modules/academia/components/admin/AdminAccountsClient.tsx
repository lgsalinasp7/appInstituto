"use client";

import { useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Users, Sparkles } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StudentsManagement } from "@/modules/academia/components/teacher/StudentsManagement";
import { TrialActivityPanel } from "@/modules/academia/components/admin/TrialActivityPanel";
import { cn } from "@/lib/utils";

type TabValue = "members" | "trial";

export function AdminAccountsClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tab: TabValue = searchParams.get("tab") === "trial" ? "trial" : "members";

  const onTabChange = useCallback(
    (value: string) => {
      const v = value === "trial" ? "trial" : "members";
      if (v === "trial") {
        router.replace("/academia/admin/users?tab=trial", { scroll: false });
      } else {
        router.replace("/academia/admin/users", { scroll: false });
      }
    },
    [router]
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-black tracking-tight text-white font-display flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center">
            <Users className="w-5 h-5 text-cyan-400" />
          </div>
          Usuarios del programa
        </h1>
        <p className="text-slate-400 mt-1 text-sm max-w-2xl">
          Invitaciones y roles de academia (estudiantes y profesores). La pestaña Prueba reúne cuentas trial y su
          actividad; también puedes abrirla desde el dashboard.
        </p>
      </div>

      <Tabs value={tab} onValueChange={onTabChange} className="w-full">
        <TabsList
          className={cn(
            "h-auto flex flex-wrap sm:flex-nowrap gap-1 p-1 rounded-xl w-full sm:w-fit max-w-full",
            "bg-white/[0.04] border border-white/[0.08]"
          )}
        >
          <TabsTrigger
            value="members"
            className={cn(
              "gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold data-[state=active]:shadow-none",
              "text-slate-400 data-[state=active]:bg-white/10 data-[state=active]:text-white"
            )}
          >
            <Users className="w-4 h-4 shrink-0 opacity-80" />
            Estudiantes y profesores
          </TabsTrigger>
          <TabsTrigger
            value="trial"
            className={cn(
              "gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold data-[state=active]:shadow-none",
              "text-slate-400 data-[state=active]:bg-amber-500/15 data-[state=active]:text-amber-200",
              "data-[state=active]:border data-[state=active]:border-amber-500/25"
            )}
          >
            <Sparkles className="w-4 h-4 shrink-0 opacity-80" />
            Prueba
          </TabsTrigger>
        </TabsList>

        <TabsContent value="members" className="mt-6 focus-visible:outline-none">
          <StudentsManagement embedded />
        </TabsContent>

        <TabsContent value="trial" className="mt-6 focus-visible:outline-none">
          <TrialActivityPanel compact />
        </TabsContent>
      </Tabs>
    </div>
  );
}

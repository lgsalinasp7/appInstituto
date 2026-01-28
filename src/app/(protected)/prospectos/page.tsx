"use client";

import { ProspectsView } from "@/modules/dashboard/components/ProspectsView";
import { DashboardHeader } from "@/modules/dashboard/components/DashboardHeader";

import { useAuthStore } from "@/lib/store/auth-store";

export default function ProspectosPage() {
    const { user } = useAuthStore();

    if (!user) return null; // Or loading state

    return (
        <div className="space-y-6">
            <DashboardHeader
                title="Gestión de Prospectos"
                subtitle="Seguimiento y conversión de clientes potenciales"
            />

            <ProspectsView currentUserId={user.id} />
        </div>
    );
}

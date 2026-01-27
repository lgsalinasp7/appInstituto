"use client";

import { ProspectsView } from "@/modules/dashboard/components/ProspectsView";
import { DashboardHeader } from "@/modules/dashboard/components/DashboardHeader";

const MOCK_USER_ID = "user-demo-001";

export default function ProspectosPage() {
    return (
        <div className="space-y-6">
            <DashboardHeader
                title="Gestión de Prospectos"
                subtitle="Seguimiento y conversión de clientes potenciales"
            />

            <ProspectsView currentUserId={MOCK_USER_ID} />
        </div>
    );
}

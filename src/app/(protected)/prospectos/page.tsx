"use client";

import { ProspectsView } from "@/modules/dashboard/components/ProspectsView";

const MOCK_USER_ID = "user-demo-001";

export default function ProspectosPage() {
    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-[#1e3a5f]">Gestión de Prospectos</h1>
                    <p className="text-[#64748b]">Seguimiento y conversión de clientes potenciales</p>
                </div>
            </div>

            <ProspectsView currentUserId={MOCK_USER_ID} />
        </div>
    );
}

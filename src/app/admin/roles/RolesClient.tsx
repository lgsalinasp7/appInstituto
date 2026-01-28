"use client";

import { RolesList } from "@/modules/admin";
import { Role } from "@/modules/admin/types";
import { toast } from "sonner";
import { useState } from "react";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

interface RolesClientProps {
    roles: Role[];
}

export default function RolesClient({ roles }: RolesClientProps) {
    const [confirmModal, setConfirmModal] = useState<{
        isOpen: boolean;
        role: Role | null;
    }>({
        isOpen: false,
        role: null,
    });

    const handleEdit = (role: Role) => {
        // Navigate to edit page or open modal
        toast.info(`Editar rol: ${role.name}`);
    };

    const handleDelete = (role: Role) => {
        setConfirmModal({
            isOpen: true,
            role,
        });
    };

    const executeDelete = () => {
        if (confirmModal.role) {
            toast.info(`Eliminar rol: ${confirmModal.role.name}`);
            // Logic to delete would go here
            setConfirmModal({ isOpen: false, role: null });
        }
    };

    return (
        <>
            <RolesList
                roles={roles}
                onEdit={handleEdit}
                onDelete={handleDelete}
            />

            <ConfirmDialog
                isOpen={confirmModal.isOpen}
                onClose={() => setConfirmModal({ isOpen: false, role: null })}
                onConfirm={executeDelete}
                title="¿Eliminar rol?"
                description={`¿Estás seguro de eliminar el rol ${confirmModal.role?.name}? Esta acción no se puede deshacer.`}
                variant="destructive"
                confirmText="Eliminar"
            />
        </>
    );
}

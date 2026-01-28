"use client";

import { RolesList } from "@/modules/admin";
import { Role } from "@/modules/admin/types";
import { toast } from "sonner";

interface RolesClientProps {
    roles: Role[];
}

export default function RolesClient({ roles }: RolesClientProps) {
    const handleEdit = (role: Role) => {
        // Navigate to edit page or open modal
        toast.info(`Editar rol: ${role.name}`);
    };

    const handleDelete = (role: Role) => {
        // Confirm and call delete action
        if (confirm(`¿Estás seguro de eliminar el rol ${role.name}?`)) {
            toast.info(`Eliminar rol: ${role.name}`);
        }
    };

    return (
        <RolesList
            roles={roles}
            onEdit={handleEdit}
            onDelete={handleDelete}
        />
    );
}

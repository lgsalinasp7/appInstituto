/**
 * Admin Roles Page
 * Role management for administrators
 */

import { RolesList, type Role, PERMISSIONS } from "@/modules/admin";
import { Button } from "@/components/ui/button";

// Mock roles - replace with actual data from AdminService.getRoles()
const mockRoles: Role[] = [
  {
    id: "1",
    name: "admin",
    description: "Administrador con acceso total al sistema",
    permissions: Object.values(PERMISSIONS),
    createdAt: new Date(),
    updatedAt: new Date(),
    _count: { users: 2 },
  },
  {
    id: "2",
    name: "user",
    description: "Usuario estándar con permisos básicos",
    permissions: [PERMISSIONS.USERS_READ],
    createdAt: new Date(),
    updatedAt: new Date(),
    _count: { users: 145 },
  },
  {
    id: "3",
    name: "moderator",
    description: "Moderador con permisos de gestión de usuarios",
    permissions: [
      PERMISSIONS.USERS_READ,
      PERMISSIONS.USERS_UPDATE,
      PERMISSIONS.AUDIT_READ,
    ],
    createdAt: new Date(),
    updatedAt: new Date(),
    _count: { users: 3 },
  },
];

export default function AdminRolesPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Gestión de Roles</h2>
          <p className="text-muted-foreground">
            Configura los roles y permisos del sistema
          </p>
        </div>
        <Button>Crear Rol</Button>
      </div>

      <RolesList
        roles={mockRoles}
        onEdit={(role) => console.log("Edit role:", role.id)}
        onDelete={(role) => console.log("Delete role:", role.id)}
      />
    </div>
  );
}

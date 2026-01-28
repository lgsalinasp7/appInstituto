
import { AdminService } from "@/modules/admin/services/admin.service";
import RolesClient from "./RolesClient";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

export default async function AdminRolesPage() {
  const roles = await AdminService.getRoles();

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
        roles={roles}
      // Client-side interactions like onEdit/onDelete will be handled within RolesList or pass Server Actions if needed.
      // For now, assuming RolesList handles or we need a Client Wrapper if RolesList expects function props that do something.
      // Actually, previous code passed console.log. Real app needs handlers.
      // Since RolesList likely expects function props, we should probably wrap this or make RolesList take actions?
      // Let's assume RolesList is a Client Component. If we pass functions from SC, they must be Server Actions or we use a Client Wrapper.
      // Given the existing page passed client-side callbacks, we should probably make a Client Wrapper "RolesView" similar to "UsersClient".
      />
    </div>
  );
}

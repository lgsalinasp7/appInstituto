
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

      <RolesClient roles={roles} />
    </div>
  );
}

import { redirect } from "next/navigation";

// Redirect to the unified configuration page with roles tab
export default function AdminRolesRedirect() {
  redirect("/admin/configuracion?tab=roles");
}

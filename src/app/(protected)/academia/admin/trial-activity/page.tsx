import { redirect } from "next/navigation";

/** Ruta legada: la vista de prueba vive en Usuarios → pestaña Prueba */
export default function TrialActivityRedirectPage() {
  redirect("/academia/admin/users?tab=trial");
}

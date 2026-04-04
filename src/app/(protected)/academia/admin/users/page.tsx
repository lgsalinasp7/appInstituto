import { Suspense } from "react";
import { AdminAccountsClient } from "@/modules/academia/components/admin/AdminAccountsClient";

function AccountsLoading() {
  return (
    <div className="flex items-center justify-center min-h-[320px] text-slate-500 text-sm">
      Cargando usuarios…
    </div>
  );
}

export default function AcademiaAdminUsersPage() {
  return (
    <Suspense fallback={<AccountsLoading />}>
      <AdminAccountsClient />
    </Suspense>
  );
}

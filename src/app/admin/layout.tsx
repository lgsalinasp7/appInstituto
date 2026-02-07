/**
 * Admin Layout
 * Layout para el panel de administración de KaledSoft (admin.kaledsoft.tech)
 * Valida platformRole server-side antes de renderizar
 */

import AdminLayoutWrapper from "./AdminLayoutWrapper";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AdminLayoutWrapper>{children}</AdminLayoutWrapper>;
}

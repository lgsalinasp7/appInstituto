/**
 * Protected Layout
 * Layout principal para rutas protegidas con TenantThemeProvider
 */

import ProtectedLayoutWrapper from "./ProtectedLayoutWrapper";

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ProtectedLayoutWrapper>{children}</ProtectedLayoutWrapper>;
}

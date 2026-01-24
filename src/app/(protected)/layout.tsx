/**
 * Protected Layout
 * Layout para páginas autenticadas
 * El dashboard tiene su propia navegación, otras páginas usan el header común
 */

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

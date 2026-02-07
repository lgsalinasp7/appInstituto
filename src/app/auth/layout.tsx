/**
 * Auth Layout
 * Layout inmersivo para páginas de autenticación con branding dinámico
 */

import AuthLayoutWrapper from "./AuthLayoutWrapper";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AuthLayoutWrapper>{children}</AuthLayoutWrapper>;
}

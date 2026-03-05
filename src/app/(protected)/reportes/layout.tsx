import type { Metadata } from "next";
import { headers } from "next/headers";

export async function generateMetadata(): Promise<Metadata> {
  const headersList = await headers();
  const host = headersList.get("host") || "kaledsoft.tech";
  const protocol = headersList.get("x-forwarded-proto") === "https" ? "https" : "http";
  const canonical = `${protocol}://${host}/reportes`;
  return {
    title: "Reportes | KaledSoft",
    description: "Rendimiento financiero, cartera y asesores.",
    alternates: { canonical },
    robots: { index: false, follow: true },
  };
}

export default function ReportesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

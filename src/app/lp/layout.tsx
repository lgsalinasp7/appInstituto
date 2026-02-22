import type { Metadata } from 'next';

export const metadata: Metadata = {
  metadataBase: new URL('https://calet.academy'),
  title: 'Bootcamp Full Stack Developer con IA | Calet Academy',
  description: 'Aprende desarrollo Full Stack con React, Next.js, PostgreSQL y herramientas de IA en 12 meses. Proyectos reales, mentoría personalizada.',
  keywords: ['bootcamp', 'programación', 'full stack', 'react', 'nextjs', 'ia', 'cursor', 'claude code'],
  authors: [{ name: 'Calet Academy' }],
  openGraph: {
    type: 'website',
    locale: 'es_CO',
    siteName: 'Calet Academy',
  },
};

export default function LandingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

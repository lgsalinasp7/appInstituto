import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { landingConfigs } from '@/data/landing-configs';
import { LandingPageClient } from './LandingPageClient';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const config = landingConfigs[slug];

  if (!config) {
    return {
      title: 'Página no encontrada',
    };
  }

  return {
    title: config.title,
    description: config.description,
    openGraph: {
      title: config.title,
      description: config.description,
      type: 'website',
    },
  };
}

export async function generateStaticParams() {
  return Object.keys(landingConfigs).map((slug) => ({
    slug,
  }));
}

export default async function LandingPage({ params }: PageProps) {
  const { slug } = await params;
  const config = landingConfigs[slug];

  if (!config) {
    notFound();
  }

  // TODO: Obtener Meta Pixel ID desde SystemConfig o variables de entorno
  const metaPixelId = process.env.NEXT_PUBLIC_META_PIXEL_ID || process.env.META_PIXEL_ID;

  // TODO: Obtener número de WhatsApp desde SystemConfig
  const whatsappNumber = process.env.WHATSAPP_PHONE_NUMBER || '573001234567';

  return (
    <LandingPageClient
      config={config}
      metaPixelId={metaPixelId}
      whatsappNumber={whatsappNumber}
    />
  );
}

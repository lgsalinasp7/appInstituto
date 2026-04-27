import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { landingConfigs } from '@/data/landing-configs';
import prisma from '@/lib/prisma';
import { LandingPageClient } from './LandingPageClient';

// Revalidate hourly so SystemConfig changes (WhatsApp number) propagate
// without losing static-generation benefits.
export const revalidate = 3600;

const DEFAULT_WHATSAPP_NUMBER = '573001234567';

/**
 * Reads the public WhatsApp number from SystemConfig (global, tenantId=null).
 * Falls back to env var, then to a hardcoded default to keep the landing
 * page resilient when the DB or config row is unavailable.
 */
async function getLandingWhatsappNumber(): Promise<string> {
  try {
    const config = await prisma.systemConfig.findFirst({
      where: { key: 'WHATSAPP_PHONE_NUMBER', tenantId: null },
      select: { value: true },
    });

    if (config?.value) {
      return config.value;
    }
  } catch {
    // Swallow DB errors – landing pages must keep rendering.
  }

  return process.env.WHATSAPP_PHONE_NUMBER || DEFAULT_WHATSAPP_NUMBER;
}

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

  const whatsappNumber = await getLandingWhatsappNumber();

  return (
    <LandingPageClient
      config={config}
      whatsappNumber={whatsappNumber}
    />
  );
}

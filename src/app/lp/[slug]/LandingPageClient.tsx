'use client';

import { HeroSection } from '@/components/landing/HeroSection';
import { BenefitsSection } from '@/components/landing/BenefitsSection';
import { TechStackSection } from '@/components/landing/TechStackSection';
import { TestimonialsSection } from '@/components/landing/TestimonialsSection';
import { MasterclassSection } from '@/components/landing/MasterclassSection';
import { WhatsAppCTA } from '@/components/landing/WhatsAppCTA';
import { LandingFooter } from '@/components/landing/LandingFooter';
import { MetaPixel, trackLead } from '@/components/landing/MetaPixel';
import type { LandingConfig } from '@/data/landing-configs';

interface LandingPageClientProps {
  config: LandingConfig;
  metaPixelId?: string;
  whatsappNumber: string;
}

export function LandingPageClient({
  config,
  metaPixelId,
  whatsappNumber,
}: LandingPageClientProps) {
  const handleCTAClick = () => {
    // Track Lead event en Meta Pixel
    trackLead();

    // Abrir WhatsApp
    const encodedMessage = encodeURIComponent(config.whatsapp.message);
    const url = `https://wa.me/${whatsappNumber}?text=${encodedMessage}`;
    window.open(url, '_blank');
  };

  return (
    <>
      {/* Meta Pixel */}
      <MetaPixel pixelId={metaPixelId} />

      {/* Hero Section */}
      <HeroSection
        headline={config.hero.headline}
        subheadline={config.hero.subheadline}
        ctaText={config.hero.ctaText}
        backgroundGradient={config.hero.backgroundGradient}
        onCTAClick={handleCTAClick}
      />

      {/* Benefits Section */}
      <BenefitsSection benefits={config.benefits} />

      {/* Tech Stack Section */}
      <TechStackSection techStack={config.techStack} />

      {/* Masterclass Section */}
      <MasterclassSection
        title={config.masterclass.title}
        subtitle={config.masterclass.subtitle}
        duration={config.masterclass.duration}
        onRegisterClick={handleCTAClick}
      />

      {/* Testimonials Section */}
      <TestimonialsSection testimonials={config.testimonials} />

      {/* WhatsApp CTA */}
      <WhatsAppCTA
        message={config.whatsapp.message}
        phoneNumber={whatsappNumber}
      />

      {/* Footer */}
      <LandingFooter />
    </>
  );
}

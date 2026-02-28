'use client';

import { HeroSection } from '@/components/landing/HeroSection';
import { BenefitsSection } from '@/components/landing/BenefitsSection';
import { TechStackSection } from '@/components/landing/TechStackSection';
import { TestimonialsSection } from '@/components/landing/TestimonialsSection';
import { MasterclassSection } from '@/components/landing/MasterclassSection';
import { WhatsAppCTA } from '@/components/landing/WhatsAppCTA';
import { LandingFooter } from '@/components/landing/LandingFooter';
import type { LandingConfig } from '@/data/landing-configs';
import { captureAttributionFromCurrentUrl, getAttribution } from '@/lib/attribution';
import { trackWhatsAppClick } from '@/lib/funnel-events';
import { useEffect } from 'react';

interface LandingPageClientProps {
  config: LandingConfig;
  whatsappNumber: string;
}

export function LandingPageClient({
  config,
  whatsappNumber,
}: LandingPageClientProps) {
  useEffect(() => {
    captureAttributionFromCurrentUrl();
  }, []);

  const buildWhatsappUrl = () => {
    const attribution = getAttribution();
    const attributionParts = [
      attribution.utmSource ? `utm_source=${attribution.utmSource}` : null,
      attribution.utmMedium ? `utm_medium=${attribution.utmMedium}` : null,
      attribution.utmCampaign ? `utm_campaign=${attribution.utmCampaign}` : null,
      attribution.fbclid ? `fbclid=${attribution.fbclid}` : null,
      attribution.gclid ? `gclid=${attribution.gclid}` : null,
      attribution.ttclid ? `ttclid=${attribution.ttclid}` : null,
    ].filter(Boolean);

    const message = attributionParts.length > 0
      ? `${config.whatsapp.message}\n\n[tracking] ${attributionParts.join(" | ")}`
      : config.whatsapp.message;

    const encodedMessage = encodeURIComponent(message);
    return `https://wa.me/${whatsappNumber}?text=${encodedMessage}`;
  };

  const handleCTAClick = () => {
    const attribution = getAttribution();
    trackWhatsAppClick({
      funnel: "lp_dynamic",
      page_path: typeof window !== "undefined" ? window.location.pathname : undefined,
      landing_slug: config.slug,
      destination: "whatsapp",
      utm_source: attribution.utmSource || undefined,
      utm_medium: attribution.utmMedium || undefined,
      utm_campaign: attribution.utmCampaign || undefined,
      fbclid: attribution.fbclid || undefined,
      gclid: attribution.gclid || undefined,
      ttclid: attribution.ttclid || undefined,
    });

    const url = buildWhatsappUrl();
    window.open(url, '_blank');
  };

  return (
    <>
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
        onWhatsAppClick={handleCTAClick}
      />

      {/* Footer */}
      <LandingFooter />
    </>
  );
}

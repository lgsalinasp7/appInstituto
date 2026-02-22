'use client';

/**
 * CtaButton - Botón de CTA con tracking de Meta Pixel
 */

import { Button } from '@/components/ui/button';
import { trackLead } from './MetaPixel';
import { cn } from '@/lib/utils';

interface CtaButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  href?: string;
  variant?: 'default' | 'outline';
  className?: string;
  trackEvent?: boolean;
}

export function CtaButton({
  children,
  onClick,
  href,
  variant = 'default',
  className,
  trackEvent = true,
}: CtaButtonProps) {
  const handleClick = () => {
    if (trackEvent) {
      trackLead();
    }
    if (onClick) {
      onClick();
    }
    if (href) {
      window.open(href, '_blank');
    }
  };

  return (
    <Button
      onClick={handleClick}
      variant={variant}
      className={cn(
        'bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white font-semibold py-6 px-8 text-lg shadow-lg shadow-cyan-500/50',
        className
      )}
    >
      {children}
    </Button>
  );
}

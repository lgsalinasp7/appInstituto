'use client';

/**
 * LeadCaptureForm - Formulario de captura de leads
 * Captura: nombre, email, teléfono + UTM params automáticos
 */

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';
import { trackEvent } from './MetaPixel';

interface LeadCaptureFormProps {
  masterclassSlug?: string;
  programId?: string;
  ctaText?: string;
}

export function LeadCaptureForm({ masterclassSlug, programId, ctaText = 'Quiero inscribirme' }: LeadCaptureFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Capturar UTM params de la URL
      const urlParams = new URLSearchParams(window.location.search);
      const utmData = {
        utmSource: urlParams.get('utm_source') || undefined,
        utmMedium: urlParams.get('utm_medium') || undefined,
        utmCampaign: urlParams.get('utm_campaign') || undefined,
        utmContent: urlParams.get('utm_content') || undefined,
      };

      // Enviar a la API pública
      const endpoint = masterclassSlug
        ? `/api/public/masterclass/${masterclassSlug}`
        : '/api/public/leads';

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          masterclassSlug,
          programId,
          ...utmData,
        }),
      });

      const data = await res.json();

      if (data.success) {
        // Track Meta Pixel CompleteRegistration
        trackEvent('CompleteRegistration', {
          content_name: masterclassSlug || 'General Lead',
        });

        // Redirigir a página de gracias
        router.push('/lp/gracias');
      } else {
        alert(data.error || 'Error al procesar registro');
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      alert('Error al procesar registro. Intenta nuevamente.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-md mx-auto">
      <div>
        <Label htmlFor="name" className="text-white">Nombre completo</Label>
        <Input
          id="name"
          type="text"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
          placeholder="Juan Pérez"
          className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
        />
      </div>

      <div>
        <Label htmlFor="email" className="text-white">Email</Label>
        <Input
          id="email"
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          required
          placeholder="juan@example.com"
          className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
        />
      </div>

      <div>
        <Label htmlFor="phone" className="text-white">WhatsApp</Label>
        <Input
          id="phone"
          type="tel"
          value={formData.phone}
          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          required
          placeholder="3001234567"
          className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
        />
      </div>

      <Button
        type="submit"
        disabled={isLoading}
        className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white font-semibold py-6 text-lg"
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            Procesando...
          </>
        ) : (
          ctaText
        )}
      </Button>

      <p className="text-xs text-center text-white/70 mt-2">
        Al registrarte aceptas recibir comunicaciones sobre el bootcamp
      </p>
    </form>
  );
}

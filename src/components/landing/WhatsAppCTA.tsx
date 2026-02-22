'use client';

import { MessageCircle, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface WhatsAppCTAProps {
  message: string;
  phoneNumber: string;
}

export function WhatsAppCTA({ message, phoneNumber }: WhatsAppCTAProps) {
  const handleWhatsAppClick = () => {
    const encodedMessage = encodeURIComponent(message);
    const url = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;
    window.open(url, '_blank');
  };

  return (
    <section className="py-20 px-4 bg-gradient-to-br from-green-600 to-emerald-600 text-white">
      <div className="container mx-auto max-w-4xl text-center">
        <div className="mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-white/20 backdrop-blur-sm mb-6">
            <MessageCircle className="h-10 w-10" />
          </div>

          <h2 className="text-4xl md:text-5xl font-black mb-4 font-display">
            ¿Listo para dar el siguiente paso?
          </h2>
          <p className="text-xl text-white/90 max-w-2xl mx-auto leading-relaxed">
            Chatea con nosotros por WhatsApp y resolvemos todas tus dudas en menos de 5 minutos
          </p>
        </div>

        <Button
          size="lg"
          onClick={handleWhatsAppClick}
          className="bg-white text-green-600 hover:bg-white/90 text-lg px-8 py-6 rounded-full font-bold shadow-2xl hover:shadow-white/50 transition-all duration-300 hover:scale-105 group"
        >
          <MessageCircle className="mr-2 h-5 w-5" />
          Chatear por WhatsApp
          <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
        </Button>

        <p className="mt-6 text-white/80 text-sm">
          Respuesta inmediata • Sin compromiso • 100% gratis
        </p>
      </div>
    </section>
  );
}

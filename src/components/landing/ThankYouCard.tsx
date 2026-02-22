'use client';

/**
 * ThankYouCard - Tarjeta de confirmación de registro
 */

import { CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

interface ThankYouCardProps {
  title?: string;
  message?: string;
  nextSteps?: string[];
  whatsappNumber?: string;
}

export function ThankYouCard({
  title = '¡Registro Exitoso!',
  message = 'Gracias por tu interés. Pronto nos pondremos en contacto contigo.',
  nextSteps = [
    'Revisa tu email (también la carpeta de spam)',
    'Te enviaremos un WhatsApp con más información',
    'Prepárate para transformar tu carrera',
  ],
  whatsappNumber,
}: ThankYouCardProps) {
  const whatsappUrl = whatsappNumber
    ? `https://wa.me/${whatsappNumber}?text=${encodeURIComponent('Hola! Acabo de registrarme y quiero más información.')}`
    : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-white/10 backdrop-blur-md rounded-3xl p-8 md:p-12 border border-white/20">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-green-500/20 rounded-full mb-6">
            <CheckCircle2 className="w-12 h-12 text-green-400" />
          </div>

          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            {title}
          </h1>

          <p className="text-xl text-white/80 mb-8">
            {message}
          </p>

          <div className="bg-white/5 rounded-2xl p-6 mb-8 text-left">
            <h3 className="text-lg font-semibold text-white mb-4">
              Próximos pasos:
            </h3>
            <ul className="space-y-3">
              {nextSteps.map((step, index) => (
                <li key={index} className="flex items-start gap-3 text-white/80">
                  <span className="inline-flex items-center justify-center w-6 h-6 bg-cyan-500/20 rounded-full text-cyan-400 text-sm font-semibold flex-shrink-0">
                    {index + 1}
                  </span>
                  <span>{step}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-4">
            {whatsappUrl && (
              <Link href={whatsappUrl} target="_blank">
                <Button className="w-full bg-green-600 hover:bg-green-700 text-white py-6 text-lg">
                  Chatea con nosotros en WhatsApp
                </Button>
              </Link>
            )}

            <Link href="/">
              <Button variant="outline" className="w-full border-white/20 text-white hover:bg-white/10 py-6">
                Volver al inicio
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

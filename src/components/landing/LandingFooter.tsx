'use client';

import { Mail, MapPin, MessageCircle } from 'lucide-react';

export function LandingFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[#1e3a5f] text-white py-12 px-4">
      <div className="container mx-auto max-w-6xl">
        <div className="grid md:grid-cols-3 gap-8 mb-8">
          {/* Brand */}
          <div>
            <h3 className="text-2xl font-black mb-4 font-display">Calet Academy</h3>
            <p className="text-white/70 leading-relaxed">
              Bootcamp Full Stack Developer con IA. Formamos desarrolladores profesionales preparados para el mercado internacional.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-bold mb-4">Programas</h4>
            <ul className="space-y-2 text-white/70">
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Bootcamp Full Stack
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Desarrollo con IA
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Masterclass Gratuita
                </a>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-bold mb-4">Contacto</h4>
            <ul className="space-y-3 text-white/70">
              <li className="flex items-start gap-2">
                <MessageCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
                <span>WhatsApp: Disponible 24/7</span>
              </li>
              <li className="flex items-start gap-2">
                <Mail className="h-5 w-5 flex-shrink-0 mt-0.5" />
                <span>info@calet.academy</span>
              </li>
              <li className="flex items-start gap-2">
                <MapPin className="h-5 w-5 flex-shrink-0 mt-0.5" />
                <span>Colombia</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 border-t border-white/10 text-center text-white/60 text-sm">
          <p>© {currentYear} Calet Academy. Todos los derechos reservados.</p>
          <p className="mt-2">
            Powered by{' '}
            <a
              href="https://kaledsoft.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-cyan-400 hover:text-cyan-300 transition-colors"
            >
              KaledSoft
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}

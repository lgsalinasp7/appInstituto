"use client";

import { Check } from "lucide-react";
import Link from "next/link";

const plans = [
  {
    name: "Básico",
    price: "49",
    period: "mes",
    description: "Perfecto para instituciones pequeñas",
    features: [
      "Hasta 50 estudiantes",
      "1 usuario administrador",
      "Gestión de pagos básica",
      "Reportes mensuales",
      "Soporte por email",
      "Almacenamiento 1GB",
    ],
    cta: "Comenzar prueba gratis",
    highlighted: false,
  },
  {
    name: "Profesional",
    price: "149",
    period: "mes",
    description: "Para instituciones en crecimiento",
    features: [
      "Hasta 200 estudiantes",
      "5 usuarios administradores",
      "Gestión avanzada de pagos",
      "Reportes personalizados",
      "Soporte prioritario 24/7",
      "Almacenamiento 10GB",
      "Branding personalizado",
      "API de integración",
    ],
    cta: "Comenzar prueba gratis",
    highlighted: true,
  },
  {
    name: "Empresarial",
    price: "499",
    period: "mes",
    description: "Para instituciones grandes",
    features: [
      "Estudiantes ilimitados",
      "Usuarios ilimitados",
      "Todas las funcionalidades",
      "Reportes avanzados con BI",
      "Soporte dedicado",
      "Almacenamiento ilimitado",
      "Branding completo",
      "Integraciones personalizadas",
      "Capacitación del equipo",
      "SLA garantizado",
    ],
    cta: "Contactar ventas",
    highlighted: false,
  },
];

export function Pricing() {
  return (
    <section id="pricing" className="py-24 bg-slate-950">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Planes que se adaptan a tu institución
          </h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Elige el plan perfecto para tu negocio. Todos incluyen 14 días de prueba gratis, sin tarjeta de crédito.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative rounded-2xl p-8 ${
                plan.highlighted
                  ? "bg-gradient-to-br from-cyan-900/40 to-blue-900/40 border-2 border-cyan-500 scale-105"
                  : "bg-slate-900/50 border border-slate-800"
              }`}
            >
              {plan.highlighted && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white px-4 py-1 rounded-full text-sm font-semibold">
                    Más Popular
                  </span>
                </div>
              )}

              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
                <p className="text-gray-400 mb-4">{plan.description}</p>
                <div className="flex items-baseline justify-center gap-1">
                  <span className="text-5xl font-bold text-white">${plan.price}</span>
                  <span className="text-gray-400">USD/{plan.period}</span>
                </div>
              </div>

              <ul className="space-y-4 mb-8">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-cyan-500 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-300">{feature}</span>
                  </li>
                ))}
              </ul>

              <Link
                href={plan.name === "Empresarial"
                  ? "mailto:ventas@kaledsoft.tech?subject=Plan%20Empresarial"
                  : "mailto:ventas@kaledsoft.tech?subject=Solicitud%20Plan%20" + encodeURIComponent(plan.name)
                }
                className={`block w-full py-4 px-6 rounded-xl font-bold text-center transition-all ${
                  plan.highlighted
                    ? "bg-gradient-to-r from-cyan-500 to-blue-500 text-white hover:shadow-lg hover:shadow-cyan-500/50"
                    : "bg-slate-800 text-white hover:bg-slate-700"
                }`}
              >
                {plan.cta}
              </Link>
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <p className="text-gray-400">
            ¿Necesitas un plan personalizado?{" "}
            <a href="mailto:ventas@kaledsoft.tech" className="text-cyan-500 hover:text-cyan-400 underline">
              Contáctanos
            </a>
          </p>
        </div>
      </div>
    </section>
  );
}

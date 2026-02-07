"use client";

import {
  Users,
  DollarSign,
  FileText,
  BarChart3,
  Shield,
  Zap,
  Bell,
  Cloud,
  Lock,
  Smartphone,
  Palette,
  Globe
} from "lucide-react";

const features = [
  {
    icon: Users,
    title: "Gestión de Estudiantes",
    description: "Administra toda la información de tus estudiantes en un solo lugar. Historial académico, pagos, documentos y más.",
  },
  {
    icon: DollarSign,
    title: "Control de Pagos",
    description: "Registra pagos, genera recibos automáticos y mantén un control preciso de la situación financiera de cada estudiante.",
  },
  {
    icon: FileText,
    title: "Módulos y Programas",
    description: "Organiza tus programas educativos por módulos, asigna contenido y da seguimiento al progreso de cada estudiante.",
  },
  {
    icon: BarChart3,
    title: "Reportes Avanzados",
    description: "Genera reportes detallados de pagos, estudiantes, programas y más. Exporta a Excel con un clic.",
  },
  {
    icon: Bell,
    title: "Notificaciones Automáticas",
    description: "Envía recordatorios de pago, avisos de eventos y comunicaciones importantes automáticamente por email.",
  },
  {
    icon: Palette,
    title: "Branding Personalizado",
    description: "Personaliza colores, logo y textos. Tu plataforma con la identidad de tu institución.",
  },
  {
    icon: Shield,
    title: "Seguridad Avanzada",
    description: "Protección de datos con encriptación, backups automáticos y control de acceso por roles.",
  },
  {
    icon: Cloud,
    title: "100% en la Nube",
    description: "Accede desde cualquier lugar, sin instalaciones. Actualizaciones automáticas y datos siempre disponibles.",
  },
  {
    icon: Smartphone,
    title: "Diseño Responsive",
    description: "Interfaz adaptada a cualquier dispositivo: computador, tablet o celular.",
  },
  {
    icon: Lock,
    title: "Multi-tenant",
    description: "Arquitectura multi-tenant que garantiza la privacidad y separación total de datos entre instituciones.",
  },
  {
    icon: Zap,
    title: "Rápido y Eficiente",
    description: "Plataforma optimizada para respuestas instantáneas y una experiencia de usuario fluida.",
  },
  {
    icon: Globe,
    title: "Soporte Multi-sede",
    description: "Gestiona múltiples sedes o campus desde una sola plataforma con reportes consolidados.",
  },
];

export function Features() {
  return (
    <section id="features" className="py-24 bg-slate-900">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4 text-wrap-balance">
            Todo lo que necesitas en una sola plataforma
          </h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto text-pretty">
            Funcionalidades potentes y fáciles de usar, diseñadas específicamente para instituciones educativas.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.title}
                className="group p-6 rounded-xl bg-slate-800/50 border border-slate-700 hover:border-cyan-500 transition-[border-color,box-shadow,transform] duration-300 hover:shadow-lg hover:shadow-cyan-500/10"
              >
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">{feature.title}</h3>
                <p className="text-gray-400">{feature.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

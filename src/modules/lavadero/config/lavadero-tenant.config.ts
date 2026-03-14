/**
 * Configuración base para tenants de tipo Lavadero Pro.
 * Branding default + servicios colombianos de ejemplo para bootstrap.
 */
export const LAVADERO_DEFAULT_CONFIG = {
  branding: {
    primaryColor: "#0e7490",   // cyan-700
    secondaryColor: "#06b6d4", // cyan-500
    accentColor: "#10b981",    // emerald-500
    darkMode: false,
    footerText: "Lavadero Pro - Powered by KaledSoft",
  },
  defaultServices: [
    { name: "Lavado Sencillo", price: 15000 },
    { name: "Lavado Completo", price: 25000 },
    { name: "Lavado Premium", price: 40000 },
    { name: "Lavado de Motor", price: 20000 },
    { name: "Polichado", price: 50000 },
    { name: "Aspirado Interior", price: 12000 },
    { name: "Lavado Chasis", price: 18000 },
    { name: "Lavado Moto", price: 8000 },
  ],
} as const;

export type LavaderoDefaultConfig = typeof LAVADERO_DEFAULT_CONFIG;

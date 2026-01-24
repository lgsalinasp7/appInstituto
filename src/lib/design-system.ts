/**
 * Design System - Educamos con Valores
 * Tokens y configuración del sistema de diseño institucional
 */

export const designTokens = {
  colors: {
    // Colores primarios (del logo)
    primary: {
      DEFAULT: "#1e3a5f",
      light: "#2d4a6f",
      dark: "#0f2847",
      foreground: "#ffffff",
    },
    // Colores secundarios
    secondary: {
      DEFAULT: "#64748b",
      light: "#94a3b8",
      dark: "#475569",
      foreground: "#ffffff",
    },
    // Acento
    accent: {
      DEFAULT: "#3b82f6",
      light: "#60a5fa",
      dark: "#2563eb",
      foreground: "#ffffff",
    },
    // Estados
    success: "#10b981",
    warning: "#f59e0b",
    error: "#ef4444",
    info: "#3b82f6",
    // Grises
    gray: {
      50: "#f8fafc",
      100: "#f1f5f9",
      200: "#e2e8f0",
      300: "#cbd5e1",
      400: "#94a3b8",
      500: "#64748b",
      600: "#475569",
      700: "#334155",
      800: "#1e293b",
      900: "#0f172a",
    },
  },
  spacing: {
    xs: "0.25rem",
    sm: "0.5rem",
    md: "1rem",
    lg: "1.5rem",
    xl: "2rem",
    "2xl": "3rem",
    "3xl": "4rem",
  },
  borderRadius: {
    sm: "0.375rem",
    DEFAULT: "0.625rem",
    lg: "0.875rem",
    xl: "1rem",
    full: "9999px",
  },
  typography: {
    fontFamily: {
      sans: "var(--font-geist-sans), system-ui, sans-serif",
      mono: "var(--font-geist-mono), monospace",
    },
    fontSize: {
      xs: "0.75rem",
      sm: "0.875rem",
      base: "1rem",
      lg: "1.125rem",
      xl: "1.25rem",
      "2xl": "1.5rem",
      "3xl": "1.875rem",
      "4xl": "2.25rem",
    },
    fontWeight: {
      normal: "400",
      medium: "500",
      semibold: "600",
      bold: "700",
    },
  },
  shadows: {
    sm: "0 1px 2px 0 rgb(30 58 95 / 0.05)",
    DEFAULT: "0 1px 3px 0 rgb(30 58 95 / 0.1), 0 1px 2px -1px rgb(30 58 95 / 0.1)",
    md: "0 4px 6px -1px rgb(30 58 95 / 0.1), 0 2px 4px -2px rgb(30 58 95 / 0.1)",
    lg: "0 10px 15px -3px rgb(30 58 95 / 0.1), 0 4px 6px -4px rgb(30 58 95 / 0.1)",
    xl: "0 20px 25px -5px rgb(30 58 95 / 0.1), 0 8px 10px -6px rgb(30 58 95 / 0.1)",
  },
  transitions: {
    fast: "150ms ease-in-out",
    DEFAULT: "200ms ease-in-out",
    slow: "300ms ease-in-out",
  },
} as const;

/**
 * Brand configuration
 */
export const brand = {
  name: "Educamos con Valores",
  tagline: "Tu camino hacia el éxito educativo",
  description: "Sistema de gestión institucional para instituciones educativas",
  logo: {
    colors: {
      primary: "#1e3a5f", // Mano grande
      secondary: "#64748b", // Mano pequeña
    },
    symbols: {
      hands: "Guía, mentoría y apoyo",
      cap: "Éxito académico y formación",
    },
  },
} as const;

/**
 * UI Component defaults
 */
export const componentDefaults = {
  button: {
    primary: {
      bg: "#1e3a5f",
      hover: "#2d4a6f",
      active: "#0f2847",
      text: "#ffffff",
    },
    secondary: {
      bg: "#f1f5f9",
      hover: "#e2e8f0",
      active: "#cbd5e1",
      text: "#1e3a5f",
    },
    outline: {
      border: "#1e3a5f",
      hover: "#1e3a5f",
      text: "#1e3a5f",
      hoverText: "#ffffff",
    },
  },
  input: {
    border: "#e2e8f0",
    focus: "#1e3a5f",
    focusRing: "rgba(30, 58, 95, 0.1)",
    placeholder: "#94a3b8",
  },
  card: {
    bg: "#ffffff",
    border: "#e2e8f0",
    shadow: "0 1px 3px 0 rgb(30 58 95 / 0.1)",
  },
} as const;

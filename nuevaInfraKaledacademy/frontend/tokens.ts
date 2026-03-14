// ============================================================
// KALEDACADEMY — Design Tokens (extraídos del App.tsx de Visily)
// Usar estas variables en toda la app para consistencia
// ============================================================

export const colors = {
  // Fondos
  bg: "#161A22",          // Fondo principal de toda la app
  surface: "#1D212B",     // Cards, sidebar, panels
  surface2: "#181D25",    // Cards internas, módulos
  surface3: "#222736",    // Hover states
  
  // Bordes
  border: "#303746",      // Todos los bordes
  borderSoft: "rgba(48,55,70,0.5)",

  // Texto
  textPrimary: "#F9FAFB",    // Títulos, texto importante
  textSecondary: "#BAC1CE",  // Texto de cuerpo
  textMuted: "rgba(186,193,206,0.6)", // Texto desactivado

  // Acento principal
  blue: "#3B82F6",
  blueBg: "rgba(59,130,246,0.10)",
  blueBorder: "rgba(59,130,246,0.20)",

  // Módulo 1 — Azul
  mod1: "#3B82F6",
  mod1bg: "rgba(59,130,246,0.10)",

  // Módulo 2 — Púrpura
  mod2: "#A855F7",
  mod2bg: "rgba(168,85,247,0.10)",

  // Módulo 3 — Verde esmeralda
  mod3: "#10B981",
  mod3bg: "rgba(16,185,129,0.10)",

  // Módulo 4 — Ámbar
  mod4: "#F59E0B",
  mod4bg: "rgba(245,158,11,0.10)",

  // Estado
  success: "#22C55E",
  successBg: "rgba(34,197,94,0.10)",
  warning: "#F59E0B",
  warningBg: "rgba(245,158,11,0.10)",
  danger: "#EF4444",
  dangerBg: "rgba(239,68,68,0.10)",
  
  // CRAL phases
  construir: "#22C55E",
  construirBg: "rgba(34,197,94,0.08)",
  construirBorder: "rgba(34,197,94,0.20)",
  romper: "#EF4444",
  romperBg: "rgba(239,68,68,0.08)",
  romperBorder: "rgba(239,68,68,0.20)",
  auditar: "#F59E0B",
  auditarBg: "rgba(245,158,11,0.08)",
  auditarBorder: "rgba(245,158,11,0.20)",
  lanzar: "#3B82F6",
  lanzarBg: "rgba(59,130,246,0.08)",
  lanzarBorder: "rgba(59,130,246,0.20)",
} as const;

export const MODULE_COLORS: Record<number, { accent: string; bg: string; border: string }> = {
  1: { accent: colors.mod1, bg: colors.mod1bg, border: "rgba(59,130,246,0.25)" },
  2: { accent: colors.mod2, bg: colors.mod2bg, border: "rgba(168,85,247,0.25)" },
  3: { accent: colors.mod3, bg: colors.mod3bg, border: "rgba(16,185,129,0.25)" },
  4: { accent: colors.mod4, bg: colors.mod4bg, border: "rgba(245,158,11,0.25)" },
};

export const CRAL_CONFIG = {
  CONSTRUIR: { label: "Construir", icon: "🔨", pct: "70%", color: colors.construir, bg: colors.construirBg, border: colors.construirBorder },
  ROMPER:    { label: "Romper",    icon: "💥", pct: "10%", color: colors.romper,    bg: colors.romperBg,    border: colors.romperBorder },
  AUDITAR:   { label: "Auditar",   icon: "🔍", pct: "10%", color: colors.auditar,   bg: colors.auditarBg,   border: colors.auditarBorder },
  LANZAR:    { label: "Lanzar",    icon: "🚀", pct: "10%", color: colors.lanzar,    bg: colors.lanzarBg,    border: colors.lanzarBorder },
} as const;

/**
 * Reduce riesgo de abuso en `<style>` cuando `customCss` viene de la BD.
 * No sustituye revisión de permisos de quién edita branding.
 */
export function sanitizeTenantCustomCss(css: string | null | undefined): string {
  if (css == null || !String(css).trim()) return "";

  let out = String(css);

  // Comentarios HTML en hojas pegadas por error
  out = out.replace(/<!--[\s\S]*?-->/g, "");

  // @import remoto o de datos
  out = out.replace(/@import[\s\S]*?;/gi, "");

  // IE / legacy
  out = out.replace(/expression\s*\([^)]*\)/gi, "");
  out = out.replace(/-moz-binding\s*:[^;};]*/gi, "");
  out = out.replace(/behavior\s*:[^;};]*/gi, "");

  // javascript: en cualquier contexto residual
  out = out.replace(/javascript\s*:/gi, "");

  // url() puede cargar recursos o datos; las plantillas de tema usan variables CSS, no url()
  out = out.replace(/url\s*\([\s\S]*?\)/gi, "none");

  // Evitar cierre accidental de </style>
  out = out.replace(/<\s*\/\s*style/gi, "");
  out = out.replace(/<\s*script/gi, "");

  return out.trim();
}

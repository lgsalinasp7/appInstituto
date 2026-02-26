'use client';

import { KaledEmailTemplate } from '@prisma/client';
import { X } from 'lucide-react';

interface EmailTemplateQuickPreviewProps {
  template: KaledEmailTemplate;
  onClose: () => void;
  onUseTemplate: () => void;
}

// Sample data for preview
const SAMPLE_DATA: Record<string, string> = {
  Nombre: 'Juan',
  Email: 'juan@ejemplo.com',
  Telefono: '+57 300 123 4567',
  Fecha: '15 de Marzo, 2026',
  Hora: '7:00 PM COT',
  Enlace: 'https://zoom.us/j/ejemplo123456',
  LinkPago: 'https://checkout.kaledsoft.com/ejemplo',
  LinkCalendly: 'https://calendly.com/kaledsoft/consulta',
  LinkInscripcion: 'https://kaledsoft.com/inscripcion',
  LinkGrabacion: 'https://vimeo.com/ejemplo123456',
  Link: 'https://kaledsoft.com/mas-info',
};

const DESIGN_STYLE_REPLACEMENTS: Array<[RegExp, string]> = [
  [/background-color:\s*#d1ecf1/gi, 'background-color: rgba(8, 145, 178, 0.2)'],
  [/background-color:\s*#d4edda/gi, 'background-color: rgba(5, 150, 105, 0.18)'],
  [/background-color:\s*#fff3cd/gi, 'background-color: rgba(245, 158, 11, 0.16)'],
  [/background-color:\s*#f8d7da/gi, 'background-color: rgba(244, 63, 94, 0.18)'],
  [/background-color:\s*#f8f9fa/gi, 'background-color: rgba(15, 23, 42, 0.78)'],
  [/background-color:\s*#fff\b/gi, 'background-color: rgba(15, 23, 42, 0.72)'],
  [/background-color:\s*#ffffff/gi, 'background-color: rgba(15, 23, 42, 0.65)'],
  [/background-color:\s*#007bff/gi, 'background-color: #0284c7'],
  [/background-color:\s*#28a745/gi, 'background-color: #059669'],
  [/background-color:\s*#dc3545/gi, 'background-color: #be123c'],
  [/color:\s*white/gi, 'color: #f8fafc'],
  [/color:\s*#0c5460/gi, 'color: #a5f3fc'],
  [/color:\s*#155724/gi, 'color: #a7f3d0'],
  [/color:\s*#856404/gi, 'color: #fde68a'],
  [/color:\s*#721c24/gi, 'color: #fecdd3'],
  [/color:\s*#666(?:666)?/gi, 'color: #94a3b8'],
  [/color:\s*#2c3e50/gi, 'color: #e2e8f0'],
  [/color:\s*#333333?/gi, 'color: #e2e8f0'],
  [/color:\s*#007bff/gi, 'color: #38bdf8'],
  [/border-left:\s*4px\s+solid\s+#ffc107/gi, 'border-left: 4px solid rgba(245, 158, 11, 0.8)'],
  [/border:\s*2px\s+solid\s+#dc3545/gi, 'border: 2px solid rgba(244, 63, 94, 0.72)'],
  [/border:\s*2px\s+solid\s+#28a745/gi, 'border: 2px solid rgba(16, 185, 129, 0.72)'],
  [/border:\s*1px\s+solid\s+#ddd/gi, 'border: 1px solid rgba(51, 65, 85, 0.85)'],
  [/border:\s*1px\s+solid\s+#e9ecef/gi, 'border: 1px solid rgba(51, 65, 85, 0.85)'],
  [/border:\s*1px\s+solid\s+#dee2e6/gi, 'border: 1px solid rgba(51, 65, 85, 0.85)'],
  [/border-top:\s*1px\s+solid\s+#ddd/gi, 'border-top: 1px solid rgba(51, 65, 85, 0.85)'],
];

const normalizePreviewHtmlStyles = (html: string) =>
  DESIGN_STYLE_REPLACEMENTS.reduce(
    (normalizedHtml, [pattern, replacement]) => normalizedHtml.replace(pattern, replacement),
    html
  );

export function EmailTemplateQuickPreview({
  template,
  onClose,
  onUseTemplate,
}: EmailTemplateQuickPreviewProps) {
  const escapeRegExp = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

  // Render template with sample data
  const renderWithSampleData = (text: string) => {
    let rendered = text;
    template.variables.forEach((variable) => {
      const sampleValue = SAMPLE_DATA[variable] || `[${variable}]`;
      const regex = new RegExp(`{{${escapeRegExp(variable)}}}`, 'g');
      // Highlight dynamic substitutions with strong contrast in preview
      rendered = rendered.replace(
        regex,
        `<mark style="background-color:#fde047; color:#1e293b; padding:2px 6px; border-radius:6px; font-weight:700; border:1px solid #facc15;">${sampleValue}</mark>`
      );
    });
    return normalizePreviewHtmlStyles(rendered);
  };

  const renderedSubject = renderWithSampleData(template.subject);
  const renderedHtml = renderWithSampleData(template.htmlContent);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm">
      <div className="flex max-h-[92vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl border border-slate-700/80 bg-slate-950 shadow-[0_28px_90px_-35px_rgba(14,165,233,0.85)]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 bg-slate-900/85 p-6">
          <div>
            <p className="mb-1 text-xs font-semibold uppercase tracking-[0.18em] text-cyan-300/80">
              Email Template Preview
            </p>
            <h2 className="text-xl font-bold text-slate-100 md:text-2xl">{template.name}</h2>
            <p className="mt-1 text-sm text-slate-400">Vista previa con datos de ejemplo</p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg border border-slate-700 p-2 text-slate-300 transition-colors hover:border-slate-500 hover:bg-slate-800 hover:text-white"
            aria-label="Cerrar"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto bg-slate-950 p-6">
          {/* Subject Line */}
          <div className="mb-6 rounded-xl border border-cyan-500/35 bg-cyan-500/10 p-4">
            <p className="mb-2 text-xs font-semibold uppercase text-cyan-300">Asunto del Email</p>
            <p
              className="text-lg font-semibold text-slate-50"
              dangerouslySetInnerHTML={{ __html: renderedSubject }}
            />
          </div>

          {/* Variables Info */}
          {template.variables.length > 0 && (
            <div className="mb-6 rounded-xl border border-violet-500/35 bg-violet-500/10 p-4">
              <p className="mb-2 text-xs font-semibold uppercase text-violet-300">Variables Dinámicas</p>
              <div className="flex flex-wrap gap-2">
                {template.variables.map((variable) => (
                  <span
                    key={variable}
                    className="rounded-full border border-violet-400/45 bg-violet-500/10 px-3 py-1 text-sm font-mono text-violet-100"
                  >
                    {`{{${variable}}}`}
                    {SAMPLE_DATA[variable] && (
                      <span className="ml-2 text-violet-300/90">→ {SAMPLE_DATA[variable]}</span>
                    )}
                  </span>
                ))}
              </div>
              <p className="mt-3 text-xs text-violet-200/90">
                Las variables aparecen resaltadas en amarillo dentro del contenido renderizado.
              </p>
            </div>
          )}

          {/* HTML Preview */}
          <div className="mb-6">
            <p className="mb-3 text-xs font-semibold uppercase text-slate-400">Contenido del Email</p>
            <div
              className="rounded-xl border border-slate-700 bg-slate-900/75 p-6 text-slate-100 shadow-inner"
              style={{
                fontFamily: 'Arial, sans-serif',
                lineHeight: 1.6,
              }}
              dangerouslySetInnerHTML={{ __html: renderedHtml }}
            />
          </div>

          {/* Metadata */}
          <div className="grid grid-cols-1 gap-4 rounded-xl border border-slate-800 bg-slate-900/65 p-4 sm:grid-cols-2">
            <div>
              <p className="mb-1 text-xs font-semibold uppercase text-slate-400">Categoría</p>
              <p className="text-sm font-medium text-slate-100">{template.category}</p>
            </div>
            <div>
              <p className="mb-1 text-xs font-semibold uppercase text-slate-400">Fase</p>
              <p className="text-sm font-medium text-slate-100">{template.phase || 'N/A'}</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex flex-col items-start justify-between gap-4 border-t border-slate-800 bg-slate-900/80 p-6 sm:flex-row sm:items-center">
          <div className="text-sm text-slate-300">
            <p>
              <strong className="text-slate-100">Nota:</strong> Al usar esta plantilla se creará una copia
              editable en tu lista personal.
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="rounded-lg border border-slate-600 px-6 py-2 font-medium text-slate-200 transition-colors hover:border-slate-400 hover:bg-slate-800"
            >
              Cerrar
            </button>
            <button
              onClick={onUseTemplate}
              className="rounded-lg border border-cyan-400/60 bg-cyan-500/15 px-6 py-2 font-semibold text-cyan-200 transition-colors hover:bg-cyan-500/25"
            >
              Usar esta plantilla
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

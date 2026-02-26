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

export function EmailTemplateQuickPreview({
  template,
  onClose,
  onUseTemplate,
}: EmailTemplateQuickPreviewProps) {
  // Render template with sample data
  const renderWithSampleData = (text: string) => {
    let rendered = text;
    template.variables.forEach((variable) => {
      const sampleValue = SAMPLE_DATA[variable] || `[${variable}]`;
      const regex = new RegExp(`{{${variable}}}`, 'g');
      // Highlight variables in yellow
      rendered = rendered.replace(
        regex,
        `<mark style="background-color: #fef08a; padding: 2px 4px; border-radius: 3px; font-weight: 600;">${sampleValue}</mark>`
      );
    });
    return rendered;
  };

  const renderedSubject = renderWithSampleData(template.subject);
  const renderedHtml = renderWithSampleData(template.htmlContent);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{template.name}</h2>
            <p className="text-sm text-gray-500 mt-1">Vista previa con datos de ejemplo</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Cerrar"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Subject Line */}
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-xs text-blue-600 font-semibold uppercase mb-2">Asunto del Email</p>
            <p
              className="text-lg font-semibold text-gray-900"
              dangerouslySetInnerHTML={{ __html: renderedSubject }}
            />
          </div>

          {/* Variables Info */}
          {template.variables.length > 0 && (
            <div className="mb-6 p-4 bg-purple-50 border border-purple-200 rounded-lg">
              <p className="text-xs text-purple-600 font-semibold uppercase mb-2">
                Variables Dinámicas
              </p>
              <div className="flex flex-wrap gap-2">
                {template.variables.map((variable) => (
                  <span
                    key={variable}
                    className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-mono"
                  >
                    {`{{${variable}}}`}
                    {SAMPLE_DATA[variable] && (
                      <span className="ml-2 text-purple-600">→ {SAMPLE_DATA[variable]}</span>
                    )}
                  </span>
                ))}
              </div>
              <p className="text-xs text-purple-600 mt-3">
                💡 Las variables están resaltadas en amarillo en el contenido
              </p>
            </div>
          )}

          {/* HTML Preview */}
          <div className="mb-6">
            <p className="text-xs text-gray-600 font-semibold uppercase mb-3">
              Contenido del Email
            </p>
            <div
              className="border border-gray-300 rounded-lg p-6 bg-white"
              style={{
                fontFamily: 'Arial, sans-serif',
                lineHeight: 1.6,
                color: '#333',
              }}
              dangerouslySetInnerHTML={{ __html: renderedHtml }}
            />
          </div>

          {/* Metadata */}
          <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
            <div>
              <p className="text-xs text-gray-600 font-semibold uppercase mb-1">Categoría</p>
              <p className="text-sm text-gray-900">{template.category}</p>
            </div>
            <div>
              <p className="text-xs text-gray-600 font-semibold uppercase mb-1">Fase</p>
              <p className="text-sm text-gray-900">{template.phase || 'N/A'}</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between gap-4 p-6 border-t border-gray-200 bg-gray-50">
          <div className="text-sm text-gray-600">
            <p>
              <strong>Nota:</strong> Al usar esta plantilla se creará una copia editable en tu lista
              personal
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-6 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              Cerrar
            </button>
            <button
              onClick={onUseTemplate}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              📋 Usar esta plantilla
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

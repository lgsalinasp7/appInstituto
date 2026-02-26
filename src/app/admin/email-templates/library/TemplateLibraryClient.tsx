'use client';

import { useState } from 'react';
import { KaledEmailTemplate } from '@prisma/client';
import { EmailTemplateQuickPreview } from '../EmailTemplateQuickPreview';
import { useRouter } from 'next/navigation';
import { tenantFetch } from '@/lib/tenant-fetch';

type Phase = 'ALL' | 'FASE_1' | 'FASE_2' | 'FASE_3' | 'NO_SHOW';

const PHASE_LABELS: Record<Phase, string> = {
  ALL: 'Todas',
  FASE_1: 'Fase 1: Pre-Masterclass',
  FASE_2: 'Fase 2: Recordatorios',
  FASE_3: 'Fase 3: Post-Masterclass',
  NO_SHOW: 'Fase 4: No-Show Recovery',
};

const PHASE_COLORS: Record<string, string> = {
  FASE_1: 'bg-blue-100 text-blue-800',
  FASE_2: 'bg-yellow-100 text-yellow-800',
  FASE_3: 'bg-green-100 text-green-800',
  NO_SHOW: 'bg-red-100 text-red-800',
};

interface TemplateLibraryClientProps {
  templates: KaledEmailTemplate[];
}

export function TemplateLibraryClient({ templates }: TemplateLibraryClientProps) {
  const router = useRouter();
  const [selectedPhase, setSelectedPhase] = useState<Phase>('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [previewTemplate, setPreviewTemplate] = useState<KaledEmailTemplate | null>(null);
  const [isUsingTemplate, setIsUsingTemplate] = useState(false);

  // Filter templates
  const filteredTemplates = templates.filter((template) => {
    const matchesPhase = selectedPhase === 'ALL' || template.phase === selectedPhase;
    const matchesSearch =
      searchTerm === '' ||
      template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      template.subject.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesPhase && matchesSearch;
  });

  // Group by phase for display
  const groupedTemplates = filteredTemplates.reduce((acc, template) => {
    const phase = template.phase || 'OTHER';
    if (!acc[phase]) {
      acc[phase] = [];
    }
    acc[phase].push(template);
    return acc;
  }, {} as Record<string, KaledEmailTemplate[]>);

  const handleUseTemplate = async (template: KaledEmailTemplate) => {
    setIsUsingTemplate(true);
    try {
      // Create a copy of the template
      const response = await tenantFetch('/api/admin/email-templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: `${template.name} - Copia`,
          subject: template.subject,
          htmlContent: template.htmlContent,
          variables: template.variables,
          category: template.category,
          isLibraryTemplate: false, // User's personal copy
        }),
      });

      if (!response.ok) {
        throw new Error('Error al duplicar plantilla');
      }

      const data = await response.json();

      // Redirect to edit the new template
      router.push(`/admin/email-templates/${data.data.id}`);
    } catch (error) {
      console.error('Error using template:', error);
      alert('Error al usar la plantilla. Por favor intenta de nuevo.');
    } finally {
      setIsUsingTemplate(false);
    }
  };

  return (
    <>
      {/* Filters */}
      <div className="mb-6 space-y-4">
        {/* Phase Filter */}
        <div className="flex flex-wrap gap-2">
          {(Object.keys(PHASE_LABELS) as Phase[]).map((phase) => (
            <button
              key={phase}
              onClick={() => setSelectedPhase(phase)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                selectedPhase === phase
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {PHASE_LABELS[phase]}
            </button>
          ))}
        </div>

        {/* Search */}
        <div>
          <input
            type="text"
            placeholder="Buscar por nombre o asunto..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Results count */}
      <div className="mb-4 text-sm text-gray-600">
        Mostrando {filteredTemplates.length} de {templates.length} plantillas
      </div>

      {/* Templates Grid */}
      {Object.keys(groupedTemplates).length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No se encontraron plantillas</p>
        </div>
      ) : (
        <div className="space-y-8">
          {Object.entries(groupedTemplates).map(([phase, phaseTemplates]) => (
            <div key={phase}>
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                {PHASE_LABELS[phase as Phase] || phase}
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {phaseTemplates.map((template) => (
                  <div
                    key={template.id}
                    className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow overflow-hidden"
                  >
                    {/* Card Header */}
                    <div className="p-4 border-b border-gray-200 bg-gray-50">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <h3 className="font-semibold text-gray-900 text-sm line-clamp-2">
                          {template.name}
                        </h3>
                        {template.phase && (
                          <span
                            className={`px-2 py-1 rounded text-xs font-medium whitespace-nowrap ${
                              PHASE_COLORS[template.phase]
                            }`}
                          >
                            {template.phase}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 line-clamp-2">
                        <strong>Asunto:</strong> {template.subject}
                      </p>
                    </div>

                    {/* Card Body */}
                    <div className="p-4">
                      {/* Variables */}
                      {template.variables.length > 0 && (
                        <div className="mb-4">
                          <p className="text-xs text-gray-500 mb-2">Variables requeridas:</p>
                          <div className="flex flex-wrap gap-1">
                            {template.variables.map((variable) => (
                              <span
                                key={variable}
                                className="px-2 py-1 bg-purple-50 text-purple-700 rounded text-xs font-mono"
                              >
                                {`{{${variable}}}`}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Actions */}
                      <div className="flex gap-2">
                        <button
                          onClick={() => setPreviewTemplate(template)}
                          className="flex-1 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
                        >
                          👁 Ver
                        </button>
                        <button
                          onClick={() => handleUseTemplate(template)}
                          disabled={isUsingTemplate}
                          className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          📋 Usar
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Preview Modal */}
      {previewTemplate && (
        <EmailTemplateQuickPreview
          template={previewTemplate}
          onClose={() => setPreviewTemplate(null)}
          onUseTemplate={() => {
            handleUseTemplate(previewTemplate);
            setPreviewTemplate(null);
          }}
        />
      )}
    </>
  );
}

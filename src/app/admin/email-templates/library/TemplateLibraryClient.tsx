'use client';

import { useMemo, useState } from 'react';
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

const PHASE_ORDER: Phase[] = ['ALL', 'FASE_1', 'FASE_2', 'FASE_3', 'NO_SHOW'];

const PHASE_COLORS: Record<string, string> = {
  FASE_1: 'border-cyan-500/30 bg-cyan-500/10 text-cyan-300',
  FASE_2: 'border-amber-500/30 bg-amber-500/10 text-amber-300',
  FASE_3: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300',
  NO_SHOW: 'border-rose-500/30 bg-rose-500/10 text-rose-300',
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

  const normalizedSearchTerm = searchTerm.trim().toLowerCase();

  const filteredTemplates = useMemo(() => {
    return templates.filter((template) => {
      const matchesPhase = selectedPhase === 'ALL' || template.phase === selectedPhase;
      const matchesSearch =
        normalizedSearchTerm === '' ||
        template.name.toLowerCase().includes(normalizedSearchTerm) ||
        template.subject.toLowerCase().includes(normalizedSearchTerm);
      return matchesPhase && matchesSearch;
    });
  }, [templates, selectedPhase, normalizedSearchTerm]);

  const groupedTemplates = useMemo(() => {
    return filteredTemplates.reduce((acc, template) => {
      const phase = template.phase || 'OTHER';
      if (!acc[phase]) {
        acc[phase] = [];
      }
      acc[phase].push(template);
      return acc;
    }, {} as Record<string, KaledEmailTemplate[]>);
  }, [filteredTemplates]);

  const groupedEntries = useMemo(() => {
    const knownEntries = PHASE_ORDER.filter((phase) => phase !== 'ALL')
      .map((phase) => [phase, groupedTemplates[phase]] as const)
      .filter(([, phaseTemplates]) => Boolean(phaseTemplates?.length));

    const otherEntries = Object.entries(groupedTemplates).filter(
      ([phase]) => !PHASE_ORDER.includes(phase as Phase)
    );

    return [...knownEntries, ...otherEntries];
  }, [groupedTemplates]);

  const phaseCounts = useMemo(() => {
    return PHASE_ORDER.reduce(
      (acc, phase) => {
        if (phase === 'ALL') {
          acc.ALL = templates.length;
          return acc;
        }
        acc[phase] = templates.filter((template) => template.phase === phase).length;
        return acc;
      },
      { ALL: templates.length, FASE_1: 0, FASE_2: 0, FASE_3: 0, NO_SHOW: 0 } as Record<Phase, number>
    );
  }, [templates]);

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
      <div className="sticky top-4 z-20 mb-7 rounded-2xl border border-slate-800/80 bg-slate-900/75 p-4 backdrop-blur">
        <div className="mb-3 flex flex-wrap gap-2">
          {PHASE_ORDER.map((phase) => (
            <button
              key={phase}
              onClick={() => setSelectedPhase(phase)}
              className={`rounded-full border px-4 py-2 text-sm font-medium transition-all ${
                selectedPhase === phase
                  ? 'border-cyan-400/70 bg-cyan-500/15 text-cyan-200 shadow-[0_8px_30px_-18px_rgba(34,211,238,0.9)]'
                  : 'border-slate-700 bg-slate-900/70 text-slate-300 hover:border-slate-500 hover:text-slate-100'
              }`}
            >
              {PHASE_LABELS[phase]} ({phaseCounts[phase]})
            </button>
          ))}
        </div>

        <div className="relative">
          <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
          >
            <path
              d="M11 4a7 7 0 1 1 0 14 7 7 0 0 1 0-14Zm0-2a9 9 0 1 0 5.65 16l4.67 4.68 1.42-1.42-4.68-4.67A9 9 0 0 0 11 2Z"
              fill="currentColor"
            />
          </svg>
          <input
            type="text"
            placeholder="Buscar por nombre o asunto..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-xl border border-slate-700 bg-slate-950/70 py-2.5 pl-10 pr-4 text-slate-100 placeholder:text-slate-500 focus:border-cyan-400/70 focus:outline-none"
          />
        </div>
      </div>

      <div className="mb-5 flex items-center justify-between rounded-xl border border-slate-800/70 bg-slate-900/60 px-4 py-3 text-sm text-slate-300">
        <p>
          Mostrando <span className="font-semibold text-slate-100">{filteredTemplates.length}</span> de{' '}
          <span className="font-semibold text-slate-100">{templates.length}</span> plantillas
        </p>
        <p className="hidden text-xs text-slate-400 sm:block">Optimizado para embudos de alta conversión</p>
      </div>

      {groupedEntries.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-700 bg-slate-900/40 py-16 text-center">
          <p className="text-lg font-semibold text-slate-200">No se encontraron plantillas</p>
          <p className="mt-2 text-sm text-slate-400">Prueba con otro término o cambia la fase seleccionada.</p>
        </div>
      ) : (
        <div className="space-y-8">
          {groupedEntries.map(([phase, phaseTemplates]) => (
            <section key={phase}>
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-xl font-semibold text-slate-100">{PHASE_LABELS[phase as Phase] || phase}</h2>
                <span className="rounded-full border border-slate-700 bg-slate-900/70 px-2.5 py-1 text-xs text-slate-300">
                  {phaseTemplates.length} plantillas
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {phaseTemplates.map((template) => (
                  <article
                    key={template.id}
                    className="group relative overflow-hidden rounded-2xl border border-slate-800 bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 p-4 transition-all hover:-translate-y-0.5 hover:border-cyan-500/45 hover:shadow-[0_20px_40px_-28px_rgba(34,211,238,0.85)]"
                  >
                    <div className="mb-4">
                      <div className="mb-3 flex items-start justify-between gap-2">
                        <h3 className="line-clamp-2 text-base font-semibold text-slate-100">{template.name}</h3>
                        {template.phase && (
                          <span
                            className={`whitespace-nowrap rounded-full border px-2.5 py-1 text-[11px] font-medium ${PHASE_COLORS[template.phase] || 'border-slate-700 bg-slate-900 text-slate-300'}`}
                          >
                            {PHASE_LABELS[template.phase as Phase] || template.phase}
                          </span>
                        )}
                      </div>
                      <p className="line-clamp-3 text-sm text-slate-300">
                        <span className="font-semibold text-slate-100">Asunto:</span> {template.subject}
                      </p>
                    </div>

                    {Array.isArray(template.variables) && template.variables.length > 0 ? (
                      <div className="mb-4">
                        <p className="mb-2 text-xs text-slate-400">Variables requeridas</p>
                        <div className="flex flex-wrap gap-1.5">
                          {template.variables.map((variable) => (
                            <span
                              key={String(variable)}
                              className="rounded-md border border-fuchsia-500/30 bg-fuchsia-500/10 px-2 py-1 text-xs font-mono text-fuchsia-200"
                            >
                              {`{{${String(variable)}}}`}
                            </span>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <p className="mb-4 text-xs text-slate-500">Sin variables requeridas</p>
                    )}

                    <div className="mt-auto flex gap-2">
                      <button
                        onClick={() => setPreviewTemplate(template)}
                        className="flex-1 rounded-lg border border-slate-700 bg-slate-900/80 px-3 py-2 text-sm font-medium text-slate-200 transition-colors hover:border-slate-500 hover:text-white"
                      >
                        Ver
                      </button>
                      <button
                        onClick={() => handleUseTemplate(template)}
                        disabled={isUsingTemplate}
                        className="flex-1 rounded-lg border border-cyan-500/50 bg-cyan-500/15 px-3 py-2 text-sm font-semibold text-cyan-200 transition-colors hover:bg-cyan-500/25 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        Usar
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            </section>
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

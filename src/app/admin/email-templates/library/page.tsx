import { prisma } from '@/lib/prisma';
import { TemplateLibraryClient } from './TemplateLibraryClient';

export const metadata = {
  title: 'Librería de Plantillas | KaledSoft',
  description: 'Plantillas de email pre-diseñadas con copywriting optimizado',
};

export default async function EmailTemplateLibraryPage() {
  // Fetch all library templates
  const templates = await prisma.kaledEmailTemplate.findMany({
    where: {
      isLibraryTemplate: true,
      isActive: true,
    },
    orderBy: [
      { phase: 'asc' },
      { createdAt: 'asc' },
    ],
  });

  const phases = ['FASE_1', 'FASE_2', 'FASE_3', 'NO_SHOW'] as const;
  const phaseCounts = phases.map((phase) => ({
    phase,
    count: templates.filter((template) => template.phase === phase).length,
  }));

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 rounded-2xl border border-slate-800/80 bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 p-6 shadow-[0_18px_60px_-35px_rgba(8,145,178,0.7)]">
        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.24em] text-cyan-300/80">
          Biblioteca Comercial
        </p>
        <h1 className="mb-2 text-3xl font-bold text-slate-100 md:text-4xl">
          Librería de Plantillas Ganadoras
        </h1>
        <p className="text-slate-400">
          {templates.length} plantillas pre-diseñadas con copywriting optimizado para tu embudo de ventas
        </p>
        <div className="mt-5 flex flex-wrap gap-2">
          {phaseCounts.map(({ phase, count }) => (
            <span
              key={phase}
              className="rounded-full border border-slate-700/80 bg-slate-900/70 px-3 py-1 text-xs font-medium text-slate-300"
            >
              {phase.replace('_', ' ')}: {count}
            </span>
          ))}
        </div>
      </div>

      <TemplateLibraryClient templates={templates} />
    </div>
  );
}

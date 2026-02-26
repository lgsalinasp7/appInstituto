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

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Librería de Plantillas Ganadoras
        </h1>
        <p className="text-gray-600">
          {templates.length} plantillas pre-diseñadas con copywriting optimizado para tu embudo de ventas
        </p>
      </div>

      <TemplateLibraryClient templates={templates} />
    </div>
  );
}

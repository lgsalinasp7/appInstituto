import { Suspense } from 'react';
import { prisma } from '@/lib/prisma';
import { AdminBreadcrumbs } from '@/modules/admin/components/AdminBreadcrumbs';
import EmailTemplatesClient from './EmailTemplatesClient';

export const metadata = {
  title: 'Plantillas de Email | KaledSoft',
  description: 'Gestión de plantillas de correo electrónico',
};

async function getEmailTemplates() {
  const templates = await prisma.kaledEmailTemplate.findMany({
    include: {
      _count: {
        select: {
          emailLogs: true,
        },
      },
      campaign: {
        select: {
          id: true,
          name: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  return templates;
}

export default async function EmailTemplatesPage() {
  const templates = await getEmailTemplates();

  return (
    <div className="container mx-auto p-6 space-y-6">
      <AdminBreadcrumbs />
      <Suspense fallback={<div>Cargando...</div>}>
        <EmailTemplatesClient templates={templates} />
      </Suspense>
    </div>
  );
}

/**
 * Edit Email Template Page
 * Full-page form for editing existing email templates
 */

import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { resolveKaledTenantId } from '@/lib/kaled-tenant';
import { AdminBreadcrumbs } from '@/modules/admin/components/AdminBreadcrumbs';
import EmailTemplateForm from '../EmailTemplateForm';

export const metadata = {
  title: 'Editar Plantilla de Email | KaledSoft',
  description: 'Editar plantilla de correo electrónico',
};

async function getEmailTemplate(id: string) {
  const tenantId = await resolveKaledTenantId();
  const template = await prisma.kaledEmailTemplate.findFirst({
    where: { id, tenantId },
  });

  if (!template) {
    notFound();
  }

  return template;
}

export default async function EditEmailTemplatePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const template = await getEmailTemplate(id);

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Breadcrumbs */}
      <AdminBreadcrumbs />

      {/* Header */}
      <div>
        <h1 className="text-3xl md:text-5xl font-bold font-display tracking-tighter text-white leading-none">
          Editar Plantilla de Email
        </h1>
        <p className="text-sm text-slate-400 mt-2 font-medium">
          Modifica la plantilla &quot;{template.name}&quot;
        </p>
      </div>

      {/* Form Card */}
      <div className="glass-card rounded-[2.5rem] p-8">
        <EmailTemplateForm template={template} />
      </div>
    </div>
  );
}

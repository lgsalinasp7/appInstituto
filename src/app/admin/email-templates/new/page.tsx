/**
 * Create Email Template Page
 * Full-page form for creating new email templates
 */

import { AdminBreadcrumbs } from '@/modules/admin/components/AdminBreadcrumbs';
import EmailTemplateForm from '../EmailTemplateForm';

export const metadata = {
  title: 'Nueva Plantilla de Email | KaledSoft',
  description: 'Crear nueva plantilla de correo electrónico',
};

export default function NewEmailTemplatePage() {
  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Breadcrumbs */}
      <AdminBreadcrumbs />

      {/* Header */}
      <div>
        <h1 className="text-3xl md:text-5xl font-bold font-display tracking-tighter text-white leading-none">
          Nueva Plantilla de Email
        </h1>
        <p className="text-sm text-slate-400 mt-2 font-medium">
          Crea una plantilla reutilizable para campañas automatizadas
        </p>
      </div>

      {/* Form Card */}
      <div className="glass-card rounded-[2.5rem] p-8">
        <EmailTemplateForm />
      </div>
    </div>
  );
}

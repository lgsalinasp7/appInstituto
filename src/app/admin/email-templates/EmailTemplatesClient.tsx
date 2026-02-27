'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import {
  Mail,
  Plus,
  Edit,
  Eye,
  Copy,
  Power,
  Trash2,
  Search,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import EmailTemplatePreviewModal from './EmailTemplatePreviewModal';
import { useAuthStore } from '@/lib/store/auth-store';
import { useConfirmModal } from '@/components/modals/use-confirm-modal';
import { useTablePagination } from '@/hooks/use-table-pagination';
import { TablePagination } from '@/components/ui/table-pagination';

interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  htmlContent: string;
  variables: string[];
  category: string;
  isActive: boolean;
  campaignId: string | null;
  createdAt?: Date;
  _count?: {
    emailLogs: number;
  };
  campaign?: {
    id: string;
    name: string;
  } | null;
}

interface EmailTemplatesClientProps {
  templates: EmailTemplate[];
}

export default function EmailTemplatesClient({
  templates: initialTemplates,
}: EmailTemplatesClientProps) {
  const router = useRouter();
  const platformRole = useAuthStore((state) => state.user?.platformRole);
  const [templates, setTemplates] = useState<EmailTemplate[]>(initialTemplates);
  const [searchQuery, setSearchQuery] = useState('');
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [selectedTemplate, setSelectedTemplate] =
    useState<EmailTemplate | null>(null);
  const { confirm, confirmModal } = useConfirmModal();

  const filteredTemplates = templates.filter(
    (template) =>
      template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.subject.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const {
    page,
    totalPages,
    totalItems,
    pageSize,
    paginatedItems: paginatedTemplates,
    setPage,
    resetPage,
  } = useTablePagination(filteredTemplates, 6);

  useEffect(() => {
    resetPage();
  }, [searchQuery, resetPage]);

  const stats = {
    total: templates.length,
    active: templates.filter((t) => t.isActive).length,
    automatic: templates.filter((t) => t.category === 'AUTOMATIC').length,
    semiAutomatic: templates.filter((t) => t.category === 'SEMI_AUTOMATIC')
      .length,
  };

  const canCreateOrDuplicate =
    platformRole === 'SUPER_ADMIN' || platformRole === 'MARKETING';
  const canEditOrToggle = platformRole === 'SUPER_ADMIN' || platformRole === 'MARKETING';
  const canDelete = platformRole === 'SUPER_ADMIN';

  const handleEdit = (template: EmailTemplate) => {
    if (!canEditOrToggle) {
      toast.error('No tienes permisos para editar plantillas');
      return;
    }
    router.push(`/admin/email-templates/${template.id}`);
  };

  const handlePreview = (template: EmailTemplate) => {
    setSelectedTemplate(template);
    setShowPreviewModal(true);
  };

  const handleDuplicate = async (template: EmailTemplate) => {
    if (!canCreateOrDuplicate) {
      toast.error('No tienes permisos para duplicar plantillas');
      return;
    }

    try {
      const response = await fetch('/api/admin/email-templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: `${template.name} (Copia)`,
          subject: template.subject,
          htmlContent: template.htmlContent,
          variables: template.variables,
          category: template.category,
          campaignId: template.campaignId,
        }),
      });

      if (!response.ok) throw new Error('Error al duplicar plantilla');

      const { data } = await response.json();
      setTemplates([{ ...data, _count: { emailLogs: 0 } }, ...templates]);
      toast.success('Plantilla duplicada exitosamente');
    } catch (error) {
      toast.error('Error al duplicar plantilla');
      console.error(error);
    }
  };

  const handleToggleActive = async (template: EmailTemplate) => {
    if (!canEditOrToggle) {
      toast.error('No tienes permisos para activar o desactivar plantillas');
      return;
    }

    try {
      const response = await fetch(
        `/api/admin/email-templates/${template.id}`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ isActive: !template.isActive }),
        }
      );

      if (!response.ok) throw new Error('Error al actualizar plantilla');

      const { data } = await response.json();
      setTemplates(
        templates.map((t) => (t.id === template.id ? data : t))
      );
      toast.success(
        `Plantilla ${data.isActive ? 'activada' : 'desactivada'}`
      );
    } catch (error) {
      toast.error('Error al actualizar plantilla');
      console.error(error);
    }
  };

  const handleDelete = async (template: EmailTemplate) => {
    if (!canDelete) {
      toast.error('No tienes permisos para eliminar plantillas');
      return;
    }

    const isConfirmed = await confirm({
      title: 'Eliminar plantilla',
      description: `¿Estás seguro de eliminar la plantilla "${template.name}"? Esta acción no se puede revertir.`,
      confirmText: 'Eliminar',
      cancelText: 'Cancelar',
      variant: 'destructive',
    });

    if (!isConfirmed)
      return;

    try {
      const response = await fetch(
        `/api/admin/email-templates/${template.id}`,
        {
          method: 'DELETE',
        }
      );

      if (!response.ok) throw new Error('Error al eliminar plantilla');

      setTemplates(templates.filter((t) => t.id !== template.id));
      toast.success('Plantilla eliminada exitosamente');
    } catch (error) {
      toast.error('Error al eliminar plantilla');
      console.error(error);
    }
  };

  const getCategoryBadge = (category: string) => {
    const styles = {
      AUTOMATIC: 'bg-green-500/10 text-green-500 border-green-500/20',
      SEMI_AUTOMATIC: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
      MANUAL: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
    };

    const labels = {
      AUTOMATIC: 'Automático',
      SEMI_AUTOMATIC: 'Semi-automático',
      MANUAL: 'Manual',
    };

    return (
      <Badge className={styles[category as keyof typeof styles]}>
        {labels[category as keyof typeof labels]}
      </Badge>
    );
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
            Plantillas de Email
          </h1>
          <p className="text-muted-foreground mt-2">
            Gestiona plantillas de correo para automatización de campañas
          </p>
        </div>
        {canCreateOrDuplicate && (
          <Button
            onClick={() => router.push('/admin/email-templates/new')}
            className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700"
          >
            <Plus className="mr-2 h-4 w-4" />
            Nueva Plantilla
          </Button>
        )}
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-4">
        {[
          {
            title: 'Total Plantillas',
            value: stats.total,
            icon: Mail,
            color: 'cyan',
          },
          {
            title: 'Activas',
            value: stats.active,
            icon: Power,
            color: 'green',
          },
          {
            title: 'Automáticas',
            value: stats.automatic,
            icon: Mail,
            color: 'blue',
          },
          {
            title: 'Semi-automáticas',
            value: stats.semiAutomatic,
            icon: Mail,
            color: 'yellow',
          },
        ].map((stat, index) => (
          <div
            key={stat.title}
            className="glass-card rounded-[2rem] p-6 animate-slide-up"
            style={{ animationDelay: `${index * 80}ms` }}
          >
            <div className="flex items-center gap-4">
              <div
                className={`p-3 rounded-2xl bg-${stat.color}-500/10 border border-${stat.color}-500/20`}
              >
                <stat.icon className={`h-6 w-6 text-${stat.color}-500`} />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{stat.title}</p>
                <p className="text-2xl font-bold">{stat.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Search Bar */}
      <div className="glass-card rounded-[2rem] p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar plantillas por nombre o asunto..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-transparent border-none focus-visible:ring-0"
          />
        </div>
      </div>

      {/* Templates Table */}
      <div className="glass-card rounded-[2.5rem] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50 border-b border-border/50">
              <tr>
                <th className="text-left p-4 font-semibold">Nombre</th>
                <th className="text-left p-4 font-semibold">Asunto</th>
                <th className="text-left p-4 font-semibold">Categoría</th>
                <th className="text-left p-4 font-semibold">Estado</th>
                <th className="text-left p-4 font-semibold">Enviados</th>
                <th className="text-left p-4 font-semibold">Campaña</th>
                <th className="text-right p-4 font-semibold">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredTemplates.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center p-12">
                    <Mail className="h-16 w-16 mx-auto mb-4 opacity-30" />
                    <p className="text-muted-foreground">
                      {searchQuery
                        ? 'No se encontraron plantillas con ese criterio'
                        : 'No hay plantillas creadas. Crea tu primera plantilla.'}
                    </p>
                  </td>
                </tr>
              ) : (
                paginatedTemplates.map((template, index) => (
                  <tr
                    key={template.id}
                    className="border-b border-border/50 hover:bg-muted/30 transition-colors animate-fade-in"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <td className="p-4 font-medium">{template.name}</td>
                    <td className="p-4 text-sm text-muted-foreground">
                      {template.subject}
                    </td>
                    <td className="p-4">{getCategoryBadge(template.category)}</td>
                    <td className="p-4">
                      <Badge
                        className={
                          template.isActive
                            ? 'bg-green-500/10 text-green-500 border-green-500/20'
                            : 'bg-gray-500/10 text-gray-500 border-gray-500/20'
                        }
                      >
                        {template.isActive ? 'Activa' : 'Inactiva'}
                      </Badge>
                    </td>
                    <td className="p-4 text-sm">{template._count?.emailLogs || 0}</td>
                    <td className="p-4 text-sm text-muted-foreground">
                      {template.campaign?.name || '-'}
                    </td>
                    <td className="p-4 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            •••
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {canEditOrToggle && (
                            <DropdownMenuItem onClick={() => handleEdit(template)}>
                              <Edit className="mr-2 h-4 w-4" />
                              Editar
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem
                            onClick={() => handlePreview(template)}
                          >
                            <Eye className="mr-2 h-4 w-4" />
                            Vista Previa
                          </DropdownMenuItem>
                          {canCreateOrDuplicate && (
                            <DropdownMenuItem
                              onClick={() => handleDuplicate(template)}
                            >
                              <Copy className="mr-2 h-4 w-4" />
                              Duplicar
                            </DropdownMenuItem>
                          )}
                          {canEditOrToggle && (
                            <DropdownMenuItem
                              onClick={() => handleToggleActive(template)}
                            >
                              <Power className="mr-2 h-4 w-4" />
                              {template.isActive ? 'Desactivar' : 'Activar'}
                            </DropdownMenuItem>
                          )}
                          {canDelete && (
                            <>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => handleDelete(template)}
                                className="text-red-600"
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Eliminar
                              </DropdownMenuItem>
                            </>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      <TablePagination
        page={page}
        totalPages={totalPages}
        totalItems={totalItems}
        pageSize={pageSize}
        onPageChange={setPage}
      />

      {/* Preview Modal */}
      <EmailTemplatePreviewModal
        open={showPreviewModal}
        onClose={() => {
          setShowPreviewModal(false);
          setSelectedTemplate(null);
        }}
        template={selectedTemplate}
      />
      {confirmModal}
    </div>
  );
}

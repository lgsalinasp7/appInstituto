'use client';

import { useState, useEffect } from 'react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import {
  Phone,
  Mail,
  Plus,
  MessageSquare,
  Calendar,
  Loader2,
  FileText,
  PhoneCall,
  Video,
} from 'lucide-react';
import type { KaledLead } from '@prisma/client';
import type { InteractionWithUser } from '@/modules/kaled-crm/types';

interface LeadHistoryDrawerProps {
  lead: KaledLead | null;
  open: boolean;
  onClose: () => void;
  onRefresh?: () => void;
  onAddNote?: () => void;
  onLogCall?: () => void;
  onLogMeeting?: () => void;
  onSendEmail?: () => void;
}

const STATUS_LABELS: Record<string, string> = {
  NUEVO: 'Nuevo',
  CONTACTADO: 'Contactado',
  DEMO: 'Demo Agendada',
  CONVERTIDO: 'Convertido',
  PERDIDO: 'Perdido',
};

const STATUS_COLORS: Record<string, string> = {
  NUEVO: 'bg-blue-500',
  CONTACTADO: 'bg-yellow-500',
  DEMO: 'bg-purple-500',
  CONVERTIDO: 'bg-green-500',
  PERDIDO: 'bg-red-500',
};

export function LeadHistoryDrawer({
  lead,
  open,
  onClose,
  onRefresh,
  onAddNote,
  onLogCall,
  onLogMeeting,
  onSendEmail,
}: LeadHistoryDrawerProps) {
  const [timeline, setTimeline] = useState<InteractionWithUser[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open && lead) {
      fetchTimeline();
    } else {
      setTimeline([]);
    }
  }, [open, lead]);

  const fetchTimeline = async () => {
    if (!lead) return;

    setLoading(true);
    try {
      const res = await fetch(`/api/admin/kaled-leads/${lead.id}/history`);
      const json = await res.json();
      if (json.success) {
        setTimeline(json.data);
      }
    } catch (error) {
      console.error('Error fetching timeline:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleActionAndRefresh = (action?: () => void) => {
    action?.();
    setTimeout(() => {
      fetchTimeline();
      onRefresh?.();
    }, 500);
  };

  if (!lead) return null;

  return (
    <Sheet open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <SheetContent className="w-full sm:max-w-2xl overflow-y-auto">
        <SheetHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <SheetTitle className="text-2xl">{lead.name}</SheetTitle>
              <SheetDescription className="mt-1 space-x-2">
                <span>{lead.email}</span>
                {lead.phone && (
                  <>
                    <span>•</span>
                    <span>{lead.phone}</span>
                  </>
                )}
              </SheetDescription>
            </div>
            <Badge
              className={`${STATUS_COLORS[lead.status] || 'bg-gray-500'} text-white`}
            >
              {STATUS_LABELS[lead.status] || lead.status}
            </Badge>
          </div>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {/* Quick Actions */}
          <div className="space-y-3">
            <h3 className="font-semibold text-sm text-muted-foreground uppercase">
              Acciones Rápidas
            </h3>
            <div className="flex flex-wrap gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleActionAndRefresh(onAddNote)}
                className="flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Agregar Nota
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleActionAndRefresh(onLogCall)}
                className="flex items-center gap-2"
              >
                <PhoneCall className="h-4 w-4" />
                Registrar Llamada
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleActionAndRefresh(onLogMeeting)}
                className="flex items-center gap-2"
              >
                <Video className="h-4 w-4" />
                Registrar Reunión
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleActionAndRefresh(onSendEmail)}
                className="flex items-center gap-2"
              >
                <Mail className="h-4 w-4" />
                Enviar Email
              </Button>
            </div>
          </div>

          <Separator />

          {/* Contact Info */}
          <div className="space-y-3">
            <h3 className="font-semibold text-sm text-muted-foreground uppercase">
              Información de Contacto
            </h3>
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span>{lead.email}</span>
              </div>
              {lead.phone && (
                <div className="flex items-center gap-3">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span>{lead.phone}</span>
                </div>
              )}
            </div>
          </div>

          <Separator />

          {/* Metadata */}
          <div className="space-y-3">
            <h3 className="font-semibold text-sm text-muted-foreground uppercase">
              Información General
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-muted rounded-lg">
                <p className="text-xs text-muted-foreground mb-1">Estado</p>
                <p className="font-semibold">
                  {STATUS_LABELS[lead.status] || lead.status}
                </p>
              </div>
              <div className="p-3 bg-muted rounded-lg">
                <p className="text-xs text-muted-foreground mb-1">Fuente</p>
                <p className="font-semibold">{lead.source}</p>
              </div>
              <div className="p-3 bg-muted rounded-lg col-span-2">
                <p className="text-xs text-muted-foreground mb-1">
                  Fecha de Registro
                </p>
                <p className="font-semibold text-xs">
                  {format(
                    new Date(lead.createdAt),
                    "dd 'de' MMMM 'de' yyyy 'a las' HH:mm",
                    { locale: es }
                  )}
                </p>
              </div>
            </div>
          </div>

          {/* UTM Tracking (if available) */}
          {(lead.utmSource ||
            lead.utmMedium ||
            lead.utmCampaign ||
            lead.utmContent) && (
            <>
              <Separator />
              <div className="space-y-3">
                <h3 className="font-semibold text-sm text-muted-foreground uppercase">
                  UTM Tracking
                </h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  {lead.utmSource && (
                    <div>
                      <span className="text-muted-foreground">Source:</span>{' '}
                      <span className="font-medium">{lead.utmSource}</span>
                    </div>
                  )}
                  {lead.utmMedium && (
                    <div>
                      <span className="text-muted-foreground">Medium:</span>{' '}
                      <span className="font-medium">{lead.utmMedium}</span>
                    </div>
                  )}
                  {lead.utmCampaign && (
                    <div>
                      <span className="text-muted-foreground">Campaign:</span>{' '}
                      <span className="font-medium">{lead.utmCampaign}</span>
                    </div>
                  )}
                  {lead.utmContent && (
                    <div>
                      <span className="text-muted-foreground">Content:</span>{' '}
                      <span className="font-medium">{lead.utmContent}</span>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}

          {/* Observations */}
          {lead.observations && (
            <>
              <Separator />
              <div className="space-y-3">
                <h3 className="font-semibold text-sm text-muted-foreground uppercase">
                  Observaciones
                </h3>
                <p className="text-sm whitespace-pre-wrap">{lead.observations}</p>
              </div>
            </>
          )}

          <Separator />

          {/* Timeline */}
          <div className="space-y-3">
            <h3 className="font-semibold text-sm text-muted-foreground uppercase">
              Historial de Actividad
            </h3>

            {loading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : timeline.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <FileText className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>No hay interacciones registradas</p>
                <p className="text-sm mt-1">
                  Agrega una nota o registra una llamada para comenzar
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {timeline.map((interaction) => (
                  <TimelineItem key={interaction.id} interaction={interaction} />
                ))}
              </div>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

// Timeline Item Component
function TimelineItem({ interaction }: { interaction: InteractionWithUser }) {
  const getIcon = () => {
    switch (interaction.type) {
      case 'NOTA':
        return <FileText className="h-4 w-4" />;
      case 'LLAMADA':
        return <PhoneCall className="h-4 w-4" />;
      case 'REUNION':
        return <Video className="h-4 w-4" />;
      case 'CORREO':
        return <Mail className="h-4 w-4" />;
      case 'WHATSAPP':
        return <MessageSquare className="h-4 w-4" />;
      case 'CAMBIO_ESTADO':
        return <Calendar className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const getTypeLabel = () => {
    const labels: Record<string, string> = {
      NOTA: 'Nota',
      LLAMADA: 'Llamada',
      REUNION: 'Reunión',
      CORREO: 'Email',
      WHATSAPP: 'WhatsApp',
      CAMBIO_ESTADO: 'Cambio de Estado',
      TAREA: 'Tarea',
    };
    return labels[interaction.type] || interaction.type;
  };

  return (
    <div className="flex gap-3 pb-4 border-b last:border-0">
      <div className="mt-1 p-2 rounded-full bg-muted">{getIcon()}</div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            <p className="font-medium text-sm">{getTypeLabel()}</p>
            {interaction.user && (
              <p className="text-xs text-muted-foreground">
                por {interaction.user.name || interaction.user.email}
              </p>
            )}
          </div>
          <time className="text-xs text-muted-foreground whitespace-nowrap">
            {format(new Date(interaction.createdAt), 'dd MMM, HH:mm', {
              locale: es,
            })}
          </time>
        </div>
        <p className="mt-2 text-sm whitespace-pre-wrap">{interaction.content}</p>
        {interaction.metadata && typeof interaction.metadata === 'object' && (
          <div className="mt-2 text-xs text-muted-foreground">
            {interaction.type === 'LLAMADA' && 'duration' in interaction.metadata && (
              <span>Duración: {(interaction.metadata as any).duration} min</span>
            )}
            {interaction.type === 'REUNION' && 'duration' in interaction.metadata && (
              <span>Duración: {(interaction.metadata as any).duration} min</span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

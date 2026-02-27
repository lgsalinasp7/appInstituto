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
  NUEVO: 'bg-blue-500/10 text-blue-300 border-blue-500/30',
  CONTACTADO: 'bg-yellow-500/10 text-yellow-300 border-yellow-500/30',
  DEMO: 'bg-purple-500/10 text-purple-300 border-purple-500/30',
  CONVERTIDO: 'bg-green-500/10 text-green-300 border-green-500/30',
  PERDIDO: 'bg-red-500/10 text-red-300 border-red-500/30',
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
      <SheetContent className="bg-premium-dark w-full overflow-y-auto border-l border-slate-800/50 text-slate-200 sm:max-w-2xl lg:max-w-3xl">
        <SheetHeader className="sticky top-0 z-10 border-b border-slate-800/50 bg-slate-950/70 px-5 pb-5 pt-7 backdrop-blur-xl sm:px-6 sm:pt-8">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <SheetTitle className="font-display text-2xl font-bold tracking-tighter text-white">
                {lead.name}
              </SheetTitle>
              <SheetDescription className="mt-1 flex flex-wrap items-center gap-2 text-sm font-medium text-slate-500">
                <span className="truncate">{lead.email}</span>
                {lead.phone && (
                  <>
                    <span>•</span>
                    <span>{lead.phone}</span>
                  </>
                )}
              </SheetDescription>
            </div>
            <Badge
              className={`rounded-lg border px-3 py-1 text-[10px] font-bold uppercase tracking-widest ${STATUS_COLORS[lead.status] || 'border-slate-700/60 bg-slate-700/20 text-slate-300'}`}
            >
              {STATUS_LABELS[lead.status] || lead.status}
            </Badge>
          </div>
        </SheetHeader>

        <div className="space-y-5 p-5 sm:space-y-6 sm:p-6 lg:p-7">
          {/* Quick Actions */}
          <section className="glass-card space-y-4 rounded-[2rem] border-slate-800/50 p-5 sm:space-y-5 sm:p-6">
            <h3 className="font-display text-xs font-bold uppercase tracking-widest text-slate-500">
              Acciones Rápidas
            </h3>
            <div className="flex flex-wrap gap-2.5">
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleActionAndRefresh(onAddNote)}
                className="h-10 border-slate-800/60 bg-slate-950/40 px-3.5 text-slate-300 hover:border-cyan-500/30 hover:bg-slate-900/70 hover:text-white"
              >
                <Plus className="h-4 w-4" />
                Agregar Nota
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleActionAndRefresh(onLogCall)}
                className="h-10 border-slate-800/60 bg-slate-950/40 px-3.5 text-slate-300 hover:border-cyan-500/30 hover:bg-slate-900/70 hover:text-white"
              >
                <PhoneCall className="h-4 w-4" />
                Registrar Llamada
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleActionAndRefresh(onLogMeeting)}
                className="h-10 border-slate-800/60 bg-slate-950/40 px-3.5 text-slate-300 hover:border-cyan-500/30 hover:bg-slate-900/70 hover:text-white"
              >
                <Video className="h-4 w-4" />
                Registrar Reunión
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleActionAndRefresh(onSendEmail)}
                className="h-10 border-slate-800/60 bg-slate-950/40 px-3.5 text-slate-300 hover:border-cyan-500/30 hover:bg-slate-900/70 hover:text-white"
              >
                <Mail className="h-4 w-4" />
                Enviar Email
              </Button>
            </div>
          </section>

          {/* Contact Info */}
          <section className="glass-card space-y-4 rounded-[2rem] border-slate-800/50 p-5 sm:space-y-5 sm:p-6">
            <h3 className="font-display text-xs font-bold uppercase tracking-widest text-slate-500">
              Información de Contacto
            </h3>
            <div className="space-y-3.5">
              <div className="flex items-center gap-3 rounded-xl border border-slate-800/60 bg-slate-950/35 px-4 py-3">
                <Mail className="h-4 w-4 text-slate-500" />
                <span className="text-sm text-slate-200">{lead.email}</span>
              </div>
              {lead.phone && (
                <div className="flex items-center gap-3 rounded-xl border border-slate-800/60 bg-slate-950/35 px-4 py-3">
                  <Phone className="h-4 w-4 text-slate-500" />
                  <span className="text-sm text-slate-200">{lead.phone}</span>
                </div>
              )}
            </div>
          </section>

          {/* Metadata */}
          <section className="glass-card space-y-4 rounded-[2rem] border-slate-800/50 p-5 sm:space-y-5 sm:p-6">
            <h3 className="font-display text-xs font-bold uppercase tracking-widest text-slate-500">
              Información General
            </h3>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
              <div className="rounded-xl border border-slate-800/60 bg-slate-950/35 p-3">
                <p className="mb-1 text-xs text-slate-500">Estado</p>
                <p className="text-sm font-semibold text-slate-100">
                  {STATUS_LABELS[lead.status] || lead.status}
                </p>
              </div>
              <div className="rounded-xl border border-slate-800/60 bg-slate-950/35 p-3">
                <p className="mb-1 text-xs text-slate-500">Fuente</p>
                <p className="text-sm font-semibold text-slate-100">{lead.source}</p>
              </div>
              <div className="col-span-2 rounded-xl border border-slate-800/60 bg-slate-950/35 p-3">
                <p className="mb-1 text-xs text-slate-500">
                  Fecha de Registro
                </p>
                <p className="text-xs font-semibold text-slate-100">
                  {format(
                    new Date(lead.createdAt),
                    "dd 'de' MMMM 'de' yyyy 'a las' HH:mm",
                    { locale: es }
                  )}
                </p>
              </div>
            </div>
          </section>

          {/* UTM Tracking (if available) */}
          {(lead.utmSource ||
            lead.utmMedium ||
            lead.utmCampaign ||
            lead.utmContent) && (
            <section className="glass-card space-y-4 rounded-[2rem] border-slate-800/50 p-5 sm:space-y-5 sm:p-6">
              <h3 className="font-display text-xs font-bold uppercase tracking-widest text-slate-500">
                UTM Tracking
              </h3>
              <div className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-2 sm:gap-4">
                {lead.utmSource && (
                  <div className="rounded-xl border border-slate-800/60 bg-slate-950/35 p-3">
                    <span className="text-xs text-slate-500">Source</span>
                    <p className="mt-1 text-sm font-medium text-slate-100">{lead.utmSource}</p>
                  </div>
                )}
                {lead.utmMedium && (
                  <div className="rounded-xl border border-slate-800/60 bg-slate-950/35 p-3">
                    <span className="text-xs text-slate-500">Medium</span>
                    <p className="mt-1 text-sm font-medium text-slate-100">{lead.utmMedium}</p>
                  </div>
                )}
                {lead.utmCampaign && (
                  <div className="rounded-xl border border-slate-800/60 bg-slate-950/35 p-3">
                    <span className="text-xs text-slate-500">Campaign</span>
                    <p className="mt-1 text-sm font-medium text-slate-100">{lead.utmCampaign}</p>
                  </div>
                )}
                {lead.utmContent && (
                  <div className="rounded-xl border border-slate-800/60 bg-slate-950/35 p-3">
                    <span className="text-xs text-slate-500">Content</span>
                    <p className="mt-1 text-sm font-medium text-slate-100">{lead.utmContent}</p>
                  </div>
                )}
              </div>
            </section>
          )}

          {/* Observations */}
          {lead.observations && (
            <section className="glass-card space-y-4 rounded-[2rem] border-slate-800/50 p-5 sm:space-y-5 sm:p-6">
              <h3 className="font-display text-xs font-bold uppercase tracking-widest text-slate-500">
                Observaciones
              </h3>
              <p className="whitespace-pre-wrap rounded-xl border border-slate-800/60 bg-slate-950/35 p-3 text-sm text-slate-200">
                {lead.observations}
              </p>
            </section>
          )}

          {/* Timeline */}
          <section className="glass-card space-y-4 rounded-[2rem] border-slate-800/50 p-5 sm:space-y-5 sm:p-6">
            <h3 className="font-display text-xs font-bold uppercase tracking-widest text-slate-500">
              Historial de Actividad
            </h3>

            {loading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
              </div>
            ) : timeline.length === 0 ? (
              <div className="rounded-xl border border-dashed border-slate-700/70 bg-slate-950/30 py-8 text-center text-slate-500">
                <FileText className="mx-auto mb-2 h-12 w-12 opacity-50" />
                <p className="text-sm">No hay interacciones registradas</p>
                <p className="mt-1 text-xs">
                  Agrega una nota o registra una llamada para comenzar
                </p>
              </div>
            ) : (
              <div className="space-y-3.5">
                {timeline.map((interaction) => (
                  <TimelineItem key={interaction.id} interaction={interaction} />
                ))}
              </div>
            )}
          </section>
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
    <div className="flex gap-3.5 rounded-xl border border-slate-800/60 bg-slate-950/35 p-4">
      <div className="mt-0.5 rounded-full bg-slate-900/70 p-2.5 text-slate-300">
        {getIcon()}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            <p className="text-sm font-medium text-slate-100">{getTypeLabel()}</p>
            {interaction.user && (
              <p className="text-xs text-slate-500">
                por {interaction.user.name || interaction.user.email}
              </p>
            )}
          </div>
          <time className="whitespace-nowrap text-xs text-slate-500">
            {format(new Date(interaction.createdAt), 'dd MMM, HH:mm', {
              locale: es,
            })}
          </time>
        </div>
        <p className="mt-2 whitespace-pre-wrap text-sm text-slate-200">
          {interaction.content}
        </p>
        {interaction.metadata && typeof interaction.metadata === 'object' && (
          <div className="mt-2 text-xs text-slate-500">
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

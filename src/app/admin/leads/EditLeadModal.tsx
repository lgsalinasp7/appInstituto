'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import type { KaledLead } from '@prisma/client';
import { trackCallBooked, trackLeadQualified } from '@/lib/funnel-events';

interface EditLeadModalProps {
  lead: KaledLead | null;
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function EditLeadModal({
  lead,
  open,
  onClose,
  onSuccess,
}: EditLeadModalProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    status: 'NUEVO',
    observations: '',
    utmSource: '',
    utmMedium: '',
    utmCampaign: '',
    utmContent: '',
  });

  useEffect(() => {
    if (lead) {
      setFormData({
        name: lead.name || '',
        email: lead.email || '',
        phone: lead.phone || '',
        status: lead.status || 'NUEVO',
        observations: lead.observations || '',
        utmSource: lead.utmSource || '',
        utmMedium: lead.utmMedium || '',
        utmCampaign: lead.utmCampaign || '',
        utmContent: lead.utmContent || '',
      });
    }
  }, [lead]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!lead) return;

    if (!formData.name.trim() || !formData.email.trim()) {
      toast.error('El nombre y email son requeridos');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/admin/kaled-leads/${lead.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name.trim(),
          email: formData.email.trim(),
          phone: formData.phone.trim() || null,
          status: formData.status,
          observations: formData.observations.trim() || null,
          utmSource: formData.utmSource.trim() || null,
          utmMedium: formData.utmMedium.trim() || null,
          utmCampaign: formData.utmCampaign.trim() || null,
          utmContent: formData.utmContent.trim() || null,
        }),
      });

      const json = await res.json();

      if (json.success) {
        const previousStatus = lead.status;
        if (formData.status === 'DEMO' && previousStatus !== 'DEMO') {
          trackCallBooked({
            funnel: 'masterclass_ia',
            source: 'admin_crm',
            lead_id: lead.id,
            old_status: previousStatus,
            new_status: formData.status,
          });
        }

        if (formData.status === 'CONTACTADO' && previousStatus !== 'CONTACTADO') {
          trackLeadQualified({
            funnel: 'masterclass_ia',
            source: 'admin_crm',
            lead_id: lead.id,
            old_status: previousStatus,
            new_status: formData.status,
          });
        }

        toast.success('Lead actualizado correctamente');
        onSuccess?.();
        onClose();
      } else {
        toast.error(json.error || 'Error al actualizar el lead');
      }
    } catch (error) {
      console.error('Error updating lead:', error);
      toast.error('Error al actualizar el lead');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      onClose();
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="bg-premium-dark max-h-[90vh] overflow-y-auto border border-slate-800/50 text-slate-200 sm:max-w-[640px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader className="border-b border-slate-800/50 pb-4">
            <DialogTitle className="font-display text-2xl font-bold tracking-tighter text-white">
              Editar Lead
            </DialogTitle>
            <DialogDescription className="text-sm font-medium text-slate-500">
              Actualiza la información del lead
            </DialogDescription>
          </DialogHeader>

          <Tabs defaultValue="basic" className="mt-5 space-y-4">
            <TabsList className="glass-card grid h-auto w-full grid-cols-3 rounded-2xl border border-slate-800/50 bg-slate-900/40 p-1">
              <TabsTrigger
                value="basic"
                className="rounded-xl px-3 py-2 text-xs font-bold uppercase tracking-widest text-slate-400 data-[state=active]:bg-slate-800/70 data-[state=active]:text-white"
              >
                Información Básica
              </TabsTrigger>
              <TabsTrigger
                value="observations"
                className="rounded-xl px-3 py-2 text-xs font-bold uppercase tracking-widest text-slate-400 data-[state=active]:bg-slate-800/70 data-[state=active]:text-white"
              >
                Observaciones
              </TabsTrigger>
              <TabsTrigger
                value="utm"
                className="rounded-xl px-3 py-2 text-xs font-bold uppercase tracking-widest text-slate-400 data-[state=active]:bg-slate-800/70 data-[state=active]:text-white"
              >
                UTM Tracking
              </TabsTrigger>
            </TabsList>

            {/* Tab: Basic Information */}
            <TabsContent
              value="basic"
              className="glass-card mt-0 space-y-4 rounded-[2rem] border border-slate-800/50 p-5"
            >
              <div className="space-y-2">
                <Label htmlFor="name" className="text-xs font-bold uppercase tracking-widest text-slate-500">
                  Nombre Completo <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  required
                  disabled={loading}
                  className="border-slate-800/60 bg-slate-950/40 text-slate-100 placeholder:text-slate-500 focus-visible:ring-cyan-500/20"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-xs font-bold uppercase tracking-widest text-slate-500">
                  Email <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  required
                  disabled={loading}
                  className="border-slate-800/60 bg-slate-950/40 text-slate-100 placeholder:text-slate-500 focus-visible:ring-cyan-500/20"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone" className="text-xs font-bold uppercase tracking-widest text-slate-500">
                  Teléfono
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                  disabled={loading}
                  className="border-slate-800/60 bg-slate-950/40 text-slate-100 placeholder:text-slate-500 focus-visible:ring-cyan-500/20"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="status" className="text-xs font-bold uppercase tracking-widest text-slate-500">
                  Estado
                </Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) =>
                    setFormData({ ...formData, status: value })
                  }
                  disabled={loading}
                >
                  <SelectTrigger className="border-slate-800/60 bg-slate-950/40 text-slate-100 focus:ring-cyan-500/20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="glass-card border-slate-800/60 bg-slate-900/90 text-slate-200 backdrop-blur-xl">
                    <SelectItem value="NUEVO">Nuevo</SelectItem>
                    <SelectItem value="CONTACTADO">Contactado</SelectItem>
                    <SelectItem value="DEMO">Demo Agendada</SelectItem>
                    <SelectItem value="CONVERTIDO">Convertido</SelectItem>
                    <SelectItem value="PERDIDO">Perdido</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </TabsContent>

            {/* Tab: Observations */}
            <TabsContent
              value="observations"
              className="glass-card mt-0 space-y-4 rounded-[2rem] border border-slate-800/50 p-5"
            >
              <div className="space-y-2">
                <Label htmlFor="observations" className="text-xs font-bold uppercase tracking-widest text-slate-500">
                  Observaciones
                </Label>
                <Textarea
                  id="observations"
                  value={formData.observations}
                  onChange={(e) =>
                    setFormData({ ...formData, observations: e.target.value })
                  }
                  rows={8}
                  placeholder="Notas adicionales sobre el lead..."
                  disabled={loading}
                  className="border-slate-800/60 bg-slate-950/40 text-slate-100 placeholder:text-slate-500 focus-visible:ring-cyan-500/20"
                />
              </div>
            </TabsContent>

            {/* Tab: UTM Tracking */}
            <TabsContent
              value="utm"
              className="glass-card mt-0 space-y-4 rounded-[2rem] border border-slate-800/50 p-5"
            >
              <div className="space-y-2">
                <Label htmlFor="utmSource" className="text-xs font-bold uppercase tracking-widest text-slate-500">
                  UTM Source
                </Label>
                <Input
                  id="utmSource"
                  value={formData.utmSource}
                  onChange={(e) =>
                    setFormData({ ...formData, utmSource: e.target.value })
                  }
                  placeholder="Ej: google, facebook, email"
                  disabled={loading}
                  className="border-slate-800/60 bg-slate-950/40 text-slate-100 placeholder:text-slate-500 focus-visible:ring-cyan-500/20"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="utmMedium" className="text-xs font-bold uppercase tracking-widest text-slate-500">
                  UTM Medium
                </Label>
                <Input
                  id="utmMedium"
                  value={formData.utmMedium}
                  onChange={(e) =>
                    setFormData({ ...formData, utmMedium: e.target.value })
                  }
                  placeholder="Ej: cpc, email, social"
                  disabled={loading}
                  className="border-slate-800/60 bg-slate-950/40 text-slate-100 placeholder:text-slate-500 focus-visible:ring-cyan-500/20"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="utmCampaign" className="text-xs font-bold uppercase tracking-widest text-slate-500">
                  UTM Campaign
                </Label>
                <Input
                  id="utmCampaign"
                  value={formData.utmCampaign}
                  onChange={(e) =>
                    setFormData({ ...formData, utmCampaign: e.target.value })
                  }
                  placeholder="Ej: masterclass_feb_2024"
                  disabled={loading}
                  className="border-slate-800/60 bg-slate-950/40 text-slate-100 placeholder:text-slate-500 focus-visible:ring-cyan-500/20"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="utmContent" className="text-xs font-bold uppercase tracking-widest text-slate-500">
                  UTM Content
                </Label>
                <Input
                  id="utmContent"
                  value={formData.utmContent}
                  onChange={(e) =>
                    setFormData({ ...formData, utmContent: e.target.value })
                  }
                  placeholder="Ej: ad_version_a, banner_top"
                  disabled={loading}
                  className="border-slate-800/60 bg-slate-950/40 text-slate-100 placeholder:text-slate-500 focus-visible:ring-cyan-500/20"
                />
              </div>
            </TabsContent>
          </Tabs>

          <DialogFooter className="mt-6 border-t border-slate-800/50 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={loading}
              className="border-slate-800/60 bg-slate-950/40 text-slate-300 hover:border-slate-700 hover:bg-slate-900/70 hover:text-white"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="bg-cyan-600/90 text-white hover:bg-cyan-500"
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Guardar Cambios
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

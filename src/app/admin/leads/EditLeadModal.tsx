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
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Editar Lead</DialogTitle>
            <DialogDescription>
              Actualiza la información del lead
            </DialogDescription>
          </DialogHeader>

          <Tabs defaultValue="basic" className="mt-4">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="basic">Información Básica</TabsTrigger>
              <TabsTrigger value="observations">Observaciones</TabsTrigger>
              <TabsTrigger value="utm">UTM Tracking</TabsTrigger>
            </TabsList>

            {/* Tab: Basic Information */}
            <TabsContent value="basic" className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="name">
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
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">
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
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Teléfono</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                  disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Estado</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) =>
                    setFormData({ ...formData, status: value })
                  }
                  disabled={loading}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
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
            <TabsContent value="observations" className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="observations">Observaciones</Label>
                <Textarea
                  id="observations"
                  value={formData.observations}
                  onChange={(e) =>
                    setFormData({ ...formData, observations: e.target.value })
                  }
                  rows={8}
                  placeholder="Notas adicionales sobre el lead..."
                  disabled={loading}
                />
              </div>
            </TabsContent>

            {/* Tab: UTM Tracking */}
            <TabsContent value="utm" className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="utmSource">UTM Source</Label>
                <Input
                  id="utmSource"
                  value={formData.utmSource}
                  onChange={(e) =>
                    setFormData({ ...formData, utmSource: e.target.value })
                  }
                  placeholder="Ej: google, facebook, email"
                  disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="utmMedium">UTM Medium</Label>
                <Input
                  id="utmMedium"
                  value={formData.utmMedium}
                  onChange={(e) =>
                    setFormData({ ...formData, utmMedium: e.target.value })
                  }
                  placeholder="Ej: cpc, email, social"
                  disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="utmCampaign">UTM Campaign</Label>
                <Input
                  id="utmCampaign"
                  value={formData.utmCampaign}
                  onChange={(e) =>
                    setFormData({ ...formData, utmCampaign: e.target.value })
                  }
                  placeholder="Ej: masterclass_feb_2024"
                  disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="utmContent">UTM Content</Label>
                <Input
                  id="utmContent"
                  value={formData.utmContent}
                  onChange={(e) =>
                    setFormData({ ...formData, utmContent: e.target.value })
                  }
                  placeholder="Ej: ad_version_a, banner_top"
                  disabled={loading}
                />
              </div>
            </TabsContent>
          </Tabs>

          <DialogFooter className="mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Guardar Cambios
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

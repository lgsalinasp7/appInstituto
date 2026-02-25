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
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface CampaignFormModalProps {
  campaign: any;
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function CampaignFormModal({
  campaign,
  open,
  onClose,
  onSuccess,
}: CampaignFormModalProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    startDate: '',
    endDate: '',
  });

  useEffect(() => {
    if (campaign) {
      setFormData({
        name: campaign.name || '',
        description: campaign.description || '',
        startDate: campaign.startDate
          ? new Date(campaign.startDate).toISOString().slice(0, 16)
          : '',
        endDate: campaign.endDate
          ? new Date(campaign.endDate).toISOString().slice(0, 16)
          : '',
      });
    } else {
      setFormData({
        name: '',
        description: '',
        startDate: '',
        endDate: '',
      });
    }
  }, [campaign, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error('El nombre es requerido');
      return;
    }

    setLoading(true);
    try {
      const body: any = {
        name: formData.name.trim(),
        description: formData.description.trim() || null,
      };

      if (formData.startDate) {
        body.startDate = new Date(formData.startDate).toISOString();
      }

      if (formData.endDate) {
        body.endDate = new Date(formData.endDate).toISOString();
      }

      const url = campaign
        ? `/api/admin/campaigns/${campaign.id}`
        : '/api/admin/campaigns';
      const method = campaign ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const json = await res.json();

      if (json.success) {
        toast.success(
          campaign
            ? 'Campaña actualizada correctamente'
            : 'Campaña creada correctamente'
        );
        onSuccess?.();
        onClose();
      } else {
        toast.error(json.error || 'Error al guardar la campaña');
      }
    } catch (error) {
      console.error('Error saving campaign:', error);
      toast.error('Error al guardar la campaña');
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
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>
              {campaign ? 'Editar Campaña' : 'Nueva Campaña'}
            </DialogTitle>
            <DialogDescription>
              {campaign
                ? 'Actualiza la información de la campaña'
                : 'Crea una nueva campaña de marketing'}
            </DialogDescription>
          </DialogHeader>

          <div className="mt-4 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">
                Nombre de la Campaña <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                placeholder="Ej: Masterclass Febrero 2024"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                required
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descripción</Label>
              <Textarea
                id="description"
                placeholder="Describe el objetivo y estrategia de esta campaña..."
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                rows={4}
                disabled={loading}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startDate">Fecha de Inicio</Label>
                <Input
                  id="startDate"
                  type="datetime-local"
                  value={formData.startDate}
                  onChange={(e) =>
                    setFormData({ ...formData, startDate: e.target.value })
                  }
                  disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="endDate">Fecha de Fin</Label>
                <Input
                  id="endDate"
                  type="datetime-local"
                  value={formData.endDate}
                  onChange={(e) =>
                    setFormData({ ...formData, endDate: e.target.value })
                  }
                  disabled={loading}
                />
              </div>
            </div>
          </div>

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
              {campaign ? 'Actualizar' : 'Crear'} Campaña
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

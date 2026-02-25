'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface LogCallModalProps {
  leadId: string | null;
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function LogCallModal({
  leadId,
  open,
  onClose,
  onSuccess,
}: LogCallModalProps) {
  const [content, setContent] = useState('');
  const [duration, setDuration] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!leadId || !content.trim()) {
      toast.error('Por favor ingresa el contenido de la llamada');
      return;
    }

    setLoading(true);
    try {
      const body: any = { content: content.trim() };
      if (duration && parseInt(duration) > 0) {
        body.duration = parseInt(duration);
      }

      const res = await fetch(`/api/admin/kaled-leads/${leadId}/call`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const json = await res.json();

      if (json.success) {
        toast.success('Llamada registrada correctamente');
        setContent('');
        setDuration('');
        onSuccess?.();
        onClose();
      } else {
        toast.error(json.error || 'Error al registrar la llamada');
      }
    } catch (error) {
      console.error('Error logging call:', error);
      toast.error('Error al registrar la llamada');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setContent('');
    setDuration('');
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Registrar Llamada</DialogTitle>
            <DialogDescription>
              Registra los detalles de la llamada realizada
            </DialogDescription>
          </DialogHeader>

          <div className="mt-4 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="content">Resumen de la llamada</Label>
              <Textarea
                id="content"
                placeholder="Ej: Llamada realizada. Lead interesado en el programa. Comentó que necesita revisar presupuesto con su socio..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={5}
                required
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="duration">Duración (minutos) - Opcional</Label>
              <Input
                id="duration"
                type="number"
                placeholder="Ej: 15"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                min="1"
                disabled={loading}
              />
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
              Registrar Llamada
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

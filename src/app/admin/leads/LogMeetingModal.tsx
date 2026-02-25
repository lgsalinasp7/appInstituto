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

interface LogMeetingModalProps {
  leadId: string | null;
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function LogMeetingModal({
  leadId,
  open,
  onClose,
  onSuccess,
}: LogMeetingModalProps) {
  const [content, setContent] = useState('');
  const [date, setDate] = useState('');
  const [duration, setDuration] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!leadId || !content.trim() || !date) {
      toast.error('Por favor completa todos los campos requeridos');
      return;
    }

    setLoading(true);
    try {
      const body: any = {
        content: content.trim(),
        date: new Date(date).toISOString(),
      };
      if (duration && parseInt(duration) > 0) {
        body.duration = parseInt(duration);
      }

      const res = await fetch(`/api/admin/kaled-leads/${leadId}/meeting`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const json = await res.json();

      if (json.success) {
        toast.success('Reunión registrada correctamente');
        setContent('');
        setDate('');
        setDuration('');
        onSuccess?.();
        onClose();
      } else {
        toast.error(json.error || 'Error al registrar la reunión');
      }
    } catch (error) {
      console.error('Error logging meeting:', error);
      toast.error('Error al registrar la reunión');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setContent('');
    setDate('');
    setDuration('');
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Registrar Reunión</DialogTitle>
            <DialogDescription>
              Registra los detalles de la reunión realizada
            </DialogDescription>
          </DialogHeader>

          <div className="mt-4 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="date">Fecha y hora de la reunión</Label>
              <Input
                id="date"
                type="datetime-local"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="content">Resumen de la reunión</Label>
              <Textarea
                id="content"
                placeholder="Ej: Reunión de demostración del producto. Lead muy interesado. Discutimos precios y plan de implementación..."
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
                placeholder="Ej: 45"
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
              Registrar Reunión
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

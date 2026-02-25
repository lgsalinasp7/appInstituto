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
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface AddNoteModalProps {
  leadId: string | null;
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function AddNoteModal({
  leadId,
  open,
  onClose,
  onSuccess,
}: AddNoteModalProps) {
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!leadId || !content.trim()) {
      toast.error('Por favor ingresa el contenido de la nota');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/admin/kaled-leads/${leadId}/note`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: content.trim() }),
      });

      const json = await res.json();

      if (json.success) {
        toast.success('Nota agregada correctamente');
        setContent('');
        onSuccess?.();
        onClose();
      } else {
        toast.error(json.error || 'Error al agregar la nota');
      }
    } catch (error) {
      console.error('Error adding note:', error);
      toast.error('Error al agregar la nota');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setContent('');
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Agregar Nota</DialogTitle>
            <DialogDescription>
              Registra una nota o comentario sobre este lead
            </DialogDescription>
          </DialogHeader>

          <div className="mt-4 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="content">Contenido de la nota</Label>
              <Textarea
                id="content"
                placeholder="Ej: El lead está muy interesado en el programa. Agendamos demo para la próxima semana..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={6}
                required
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
              Guardar Nota
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

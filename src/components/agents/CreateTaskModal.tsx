'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { tenantFetch } from '@/lib/tenant-fetch';

interface CreateTaskModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function CreateTaskModal({ open, onClose, onSuccess }: CreateTaskModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    agentType: 'MARGY' as 'MARGY' | 'KALED',
    priority: 0,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const res = await tenantFetch('/api/admin/agents/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setFormData({
          title: '',
          description: '',
          agentType: 'MARGY',
          priority: 0,
        });
        onSuccess();
      }
    } catch (error) {
      console.error('Error creating task:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-premium-dark border border-slate-800/50 text-slate-200">
        <DialogHeader className="border-b border-slate-800/50 pb-4">
          <DialogTitle className="font-display text-2xl font-bold tracking-tighter text-white">
            Nueva Tarea de Agente
          </DialogTitle>
          <DialogDescription className="text-sm text-slate-500">
            Crea una tarea manual para Margy o Kaled
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title" className="text-xs font-bold uppercase tracking-widest text-slate-500">
              Título
            </Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Ej: Seguimiento a lead caliente"
              required
              className="border-slate-800/60 bg-slate-950/40 text-slate-100 placeholder:text-slate-500 focus-visible:ring-cyan-500/20"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="text-xs font-bold uppercase tracking-widest text-slate-500">
              Descripción
            </Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Detalles de la tarea..."
              rows={4}
              required
              className="border-slate-800/60 bg-slate-950/40 text-slate-100 placeholder:text-slate-500 focus-visible:ring-cyan-500/20"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="agentType" className="text-xs font-bold uppercase tracking-widest text-slate-500">
                Agente
              </Label>
              <Select
                value={formData.agentType}
                onValueChange={(value) =>
                  setFormData({ ...formData, agentType: value as 'MARGY' | 'KALED' })
                }
              >
                <SelectTrigger id="agentType" className="border-slate-800/60 bg-slate-950/40 text-slate-100 focus:ring-cyan-500/20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="glass-card border-slate-800/60 bg-slate-900/90 text-slate-200">
                  <SelectItem value="MARGY">Margy (Captadora)</SelectItem>
                  <SelectItem value="KALED">Kaled (Analista)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="priority" className="text-xs font-bold uppercase tracking-widest text-slate-500">
                Prioridad
              </Label>
              <Select
                value={formData.priority.toString()}
                onValueChange={(value) =>
                  setFormData({ ...formData, priority: parseInt(value) })
                }
              >
                <SelectTrigger id="priority" className="border-slate-800/60 bg-slate-950/40 text-slate-100 focus:ring-cyan-500/20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="glass-card border-slate-800/60 bg-slate-900/90 text-slate-200">
                  <SelectItem value="0">Normal</SelectItem>
                  <SelectItem value="1">Alta</SelectItem>
                  <SelectItem value="2">Urgente</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex justify-end gap-2 border-t border-slate-800/50 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="border-slate-800/60 bg-slate-950/40 text-slate-300 hover:bg-slate-900/60 hover:text-white">
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting} className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white hover:from-cyan-600 hover:to-blue-600">
              {isSubmitting ? 'Creando...' : 'Crear Tarea'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

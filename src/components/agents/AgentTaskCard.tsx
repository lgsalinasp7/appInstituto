'use client';

import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreVertical, User, Clock, AlertTriangle } from 'lucide-react';
import { tenantFetch } from '@/lib/tenant-fetch';
import type { AgentTaskItem } from '@/modules/agents/types';
import { useConfirmModal } from '@/components/modals/use-confirm-modal';

interface AgentTaskCardProps {
  task: AgentTaskItem;
  onUpdate: () => void;
}

const PRIORITY_COLORS = {
  0: 'bg-blue-500/80',
  1: 'bg-orange-500/80',
  2: 'bg-red-500/80',
};

const PRIORITY_LABELS = {
  0: 'Normal',
  1: 'Alta',
  2: 'Urgente',
};

const AGENT_COLORS = {
  MARGY: 'bg-purple-500',
  KALED: 'bg-cyan-500',
};

export function AgentTaskCard({ task, onUpdate }: AgentTaskCardProps) {
  const { confirm, confirmModal } = useConfirmModal();

  const handleStatusChange = async (newStatus: string) => {
    try {
      const res = await tenantFetch(`/api/admin/agents/tasks/${task.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (res.ok) {
        onUpdate();
      }
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };

  const handleDelete = async () => {
    const isConfirmed = await confirm({
      title: 'Eliminar tarea',
      description: '¿Eliminar esta tarea?',
      confirmText: 'Eliminar',
      cancelText: 'Cancelar',
      variant: 'destructive',
    });

    if (!isConfirmed) return;

    try {
      const res = await tenantFetch(`/api/admin/agents/tasks/${task.id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        onUpdate();
      }
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

  return (
    <>
      <Card className="rounded-xl border-slate-800/60 bg-slate-950/35 p-3 transition-colors hover:border-cyan-500/20 hover:bg-slate-900/50">
        <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${AGENT_COLORS[task.agentType]}`} />
          <span className="text-xs font-medium text-slate-500">
            {task.agentType}
          </span>
        </div>
        <div className="flex items-center gap-1">
          {task.priority > 0 && (
            <AlertTriangle
              className={`h-3 w-3 ${task.priority === 2 ? 'text-red-500' : 'text-orange-500'}`}
            />
          )}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-6 w-6 p-0 text-slate-500 hover:bg-slate-800/70 hover:text-slate-200">
                <MoreVertical className="h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="glass-card border-slate-800/60 bg-slate-900/90 text-slate-200">
              <DropdownMenuItem onClick={() => handleStatusChange('EN_PROCESO')} className="focus:bg-slate-800/70 focus:text-white">
                Marcar en proceso
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleStatusChange('COMPLETADA')} className="focus:bg-slate-800/70 focus:text-white">
                Marcar completada
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleStatusChange('MEJORA')} className="focus:bg-slate-800/70 focus:text-white">
                Enviar a mejora
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={handleDelete}
                className="text-red-400 focus:bg-red-500/20 focus:text-red-300"
              >
                Eliminar
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

        <h4 className="mb-1 line-clamp-2 text-sm font-semibold text-slate-100">{task.title}</h4>
        <p className="mb-2 line-clamp-2 text-xs text-slate-500">
          {task.description}
        </p>

        {task.prospectName && (
          <div className="mb-2 flex items-center gap-1 text-xs text-slate-500">
            <User className="h-3 w-3" />
            <span className="truncate">{task.prospectName}</span>
          </div>
        )}

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1 text-xs text-slate-500">
            <Clock className="h-3 w-3" />
            <span>{new Date(task.createdAt).toLocaleDateString()}</span>
          </div>
          {task.priority > 0 && (
            <Badge variant="outline" className="border-slate-700/70 bg-slate-900/50 text-xs text-slate-300">
              {PRIORITY_LABELS[task.priority as 0 | 1 | 2]}
            </Badge>
          )}
        </div>
      </Card>
      {confirmModal}
    </>
  );
}

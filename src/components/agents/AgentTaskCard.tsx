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
import type { AgentTaskItem } from '@/modules/agents/types';

interface AgentTaskCardProps {
  task: AgentTaskItem;
  onUpdate: () => void;
}

const PRIORITY_COLORS = {
  0: 'bg-blue-500',
  1: 'bg-orange-500',
  2: 'bg-red-500',
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
  const handleStatusChange = async (newStatus: string) => {
    try {
      const res = await fetch(`/api/admin/agents/tasks/${task.id}`, {
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
    if (!confirm('¿Eliminar esta tarea?')) return;

    try {
      const res = await fetch(`/api/admin/agents/tasks/${task.id}`, {
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
    <Card className="p-3 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${AGENT_COLORS[task.agentType]}`} />
          <span className="text-xs font-medium text-muted-foreground">
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
              <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                <MoreVertical className="h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => handleStatusChange('EN_PROCESO')}>
                Marcar en proceso
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleStatusChange('COMPLETADA')}>
                Marcar completada
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleStatusChange('MEJORA')}>
                Enviar a mejora
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={handleDelete}
                className="text-red-600"
              >
                Eliminar
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <h4 className="text-sm font-semibold mb-1 line-clamp-2">{task.title}</h4>
      <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
        {task.description}
      </p>

      {task.prospectName && (
        <div className="flex items-center gap-1 text-xs text-muted-foreground mb-2">
          <User className="h-3 w-3" />
          <span className="truncate">{task.prospectName}</span>
        </div>
      )}

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Clock className="h-3 w-3" />
          <span>{new Date(task.createdAt).toLocaleDateString()}</span>
        </div>
        {task.priority > 0 && (
          <Badge variant="outline" className="text-xs">
            {PRIORITY_LABELS[task.priority as 0 | 1 | 2]}
          </Badge>
        )}
      </div>
    </Card>
  );
}

'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Plus, User, Clock } from 'lucide-react';
import { AgentTaskCard } from './AgentTaskCard';
import { CreateTaskModal } from './CreateTaskModal';
import { tenantFetch } from '@/lib/tenant-fetch';
import type { AgentTaskBoard } from '@/modules/agents/types';

const STATUS_LABELS = {
  PENDIENTE: 'Pendiente',
  EN_PROCESO: 'En Proceso',
  COMPLETADA: 'Completada',
  MEJORA: 'En Mejora',
};

export function AgentKanbanBoard() {
  const [board, setBoard] = useState<AgentTaskBoard | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchBoard();
  }, []);

  const fetchBoard = async () => {
    try {
      setError(null);
      const res = await tenantFetch('/api/admin/agents/board');

      if (!res.ok) {
        if (res.status === 401) {
          setError('No se pudo determinar el tenant. Por favor, usa un subdomain (ej: edutec.localhost:3000) o verifica tu sesión.');
        } else {
          setError('Error al cargar el tablero');
        }
        return;
      }

      const data = await res.json();
      if (data.success) {
        setBoard(data.data);
      } else {
        setError(data.error || 'Error al cargar el tablero');
      }
    } catch (error) {
      console.error('Error fetching board:', error);
      setError('Error de conexión al cargar el tablero');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTaskCreated = () => {
    setIsCreateModalOpen(false);
    fetchBoard();
  };

  if (isLoading) {
    return (
      <div className="glass-card flex items-center justify-center rounded-[2rem] border border-slate-800/50 py-12">
        <div className="text-slate-500">Cargando tablero...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="glass-card flex flex-col items-center justify-center space-y-4 rounded-[2rem] border border-slate-800/50 py-12">
        <div className="font-medium text-red-400">{error}</div>
        <Button onClick={fetchBoard} variant="outline" className="border-slate-800/60 bg-slate-950/40 text-slate-300 hover:bg-slate-900/60 hover:text-white">
          Reintentar
        </Button>
      </div>
    );
  }

  if (!board) {
    return (
      <div className="glass-card flex items-center justify-center rounded-[2rem] border border-slate-800/50 py-12">
        <div className="text-slate-500">No se pudo cargar el tablero</div>
      </div>
    );
  }

  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="font-display text-2xl font-bold tracking-tighter text-white">Tablero Kanban</h2>
          <p className="text-sm text-slate-500">
            Tareas de Margy y Kaled
          </p>
        </div>
        <Button
          onClick={() => setIsCreateModalOpen(true)}
          className="rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-lg shadow-cyan-500/20 hover:from-cyan-600 hover:to-blue-600"
        >
          <Plus className="h-4 w-4 mr-2" />
          Nueva Tarea
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {board.columns.map((column) => (
          <Card key={column.status} className="glass-card flex flex-col rounded-[2rem] border-slate-800/50 bg-slate-900/40">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-slate-300">
                  {STATUS_LABELS[column.status]}
                </CardTitle>
                <Badge variant="secondary" className="bg-slate-800/70 text-slate-200 border border-slate-700/60">
                  {column.tasks.length}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="flex-1 space-y-2">
              {column.tasks.length === 0 ? (
                <div className="py-8 text-center text-sm text-slate-500">
                  No hay tareas
                </div>
              ) : (
                column.tasks.map((task) => (
                  <AgentTaskCard
                    key={task.id}
                    task={task}
                    onUpdate={fetchBoard}
                  />
                ))
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <CreateTaskModal
        open={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={handleTaskCreated}
      />
    </>
  );
}

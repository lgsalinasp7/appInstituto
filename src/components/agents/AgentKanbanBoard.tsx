'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Plus, User, Clock } from 'lucide-react';
import { AgentTaskCard } from './AgentTaskCard';
import { CreateTaskModal } from './CreateTaskModal';
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

  useEffect(() => {
    fetchBoard();
  }, []);

  const fetchBoard = async () => {
    try {
      const res = await fetch('/api/admin/agents/board');
      const data = await res.json();
      if (data.success) {
        setBoard(data.data);
      }
    } catch (error) {
      console.error('Error fetching board:', error);
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
      <div className="flex items-center justify-center py-12">
        <div className="text-muted-foreground">Cargando tablero...</div>
      </div>
    );
  }

  if (!board) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-muted-foreground">No se pudo cargar el tablero</div>
      </div>
    );
  }

  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-2xl font-bold">Tablero Kanban</h2>
          <p className="text-sm text-muted-foreground">
            Tareas de Margy y Kaled
          </p>
        </div>
        <Button onClick={() => setIsCreateModalOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Nueva Tarea
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {board.columns.map((column) => (
          <Card key={column.status} className="flex flex-col">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium">
                  {STATUS_LABELS[column.status]}
                </CardTitle>
                <Badge variant="secondary">{column.tasks.length}</Badge>
              </div>
            </CardHeader>
            <CardContent className="flex-1 space-y-2">
              {column.tasks.length === 0 ? (
                <div className="text-center text-sm text-muted-foreground py-8">
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

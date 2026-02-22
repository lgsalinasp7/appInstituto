'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AgentKanbanBoard } from '@/components/agents/AgentKanbanBoard';
import { AgentMemoryManager } from '@/components/agents/AgentMemoryManager';
import { AgentStats } from '@/components/agents/AgentStats';
import { Bot, Brain, ListTodo, BarChart3 } from 'lucide-react';

export default function AgentesKanbanPage() {
  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center gap-3">
        <Bot className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold">Margy & Kaled</h1>
          <p className="text-muted-foreground">
            Agentes IA para captación, calificación y análisis
          </p>
        </div>
      </div>

      <Tabs defaultValue="kanban" className="space-y-4">
        <TabsList>
          <TabsTrigger value="kanban" className="gap-2">
            <ListTodo className="h-4 w-4" />
            Tablero Kanban
          </TabsTrigger>
          <TabsTrigger value="stats" className="gap-2">
            <BarChart3 className="h-4 w-4" />
            Estadísticas
          </TabsTrigger>
          <TabsTrigger value="memory" className="gap-2">
            <Brain className="h-4 w-4" />
            Memoria
          </TabsTrigger>
        </TabsList>

        <TabsContent value="kanban" className="space-y-4">
          <AgentKanbanBoard />
        </TabsContent>

        <TabsContent value="stats" className="space-y-4">
          <AgentStats />
        </TabsContent>

        <TabsContent value="memory" className="space-y-4">
          <AgentMemoryManager />
        </TabsContent>
      </Tabs>
    </div>
  );
}
